const db = require("../models/index");
const { paymentService } = require("./payment.service");
const { ObjectId } = require("mongodb");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");
const { ORDER_STATUS } = require("../constants/enum");
const { default: axios } = require("axios");
const { body } = require("express-validator");
class OrderService {
  async createPayment(userId, products) {
    const order = await db.Order.create({
      user_id: userId,
      total_quantity: products.reduce(
        (acc, product) => acc + product.quantity,
        0
      ),
      estimate_price: products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      ),
      end_price: products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      ),
      status: "PENDING",
    });
    const orderDetails = products.map((product) => ({
      user_id: userId,
      order_id: order._id,
      variation_id: product.variation_id,
      product_id: product.product_id,
      quantity: product.quantity,
      price: product.price,
      total_price: product.price * product.quantity,
    }));
    await db.OrderDetail.insertMany(orderDetails);
    // create payment url
    const payment = await paymentService.getPaymentUrl(order, products);
    return payment;
  }
  async convertCartList({ cart_list, voucher_code }) {
    // danh sách các product_id mà người dùng đã truyền lên trong cart_list
    const productCartIdListPrev = cart_list.reduce((result, item) => {
      result.push(String(item.product_id));
      return result;
    }, []);
    console.log(productCartIdListPrev);

    // danh sách các product lấy từ productCartIdListPrev
    const productList = await db.Product.find({
      _id: {
        $in: productCartIdListPrev,
      },
    });

    // lấy danh sách product_id từ danh sách lấy đc
    const productCartIdList = productList.reduce((result, item) => {
      result.push(item._id);
      return result;
    }, []);

    // danh sách những product_id không có trong table product đã lấy đc
    const productIdListInValid = productCartIdListPrev.filter((item) => {
      return !productCartIdList.includes(item);
    });

    // nếu danh sách này có phần tử nghĩa là cart_list người dùng truyền lên có product_id không hợp lệ
    if (productIdListInValid.length) {
      throw new ErrorWithStatus({
        message: "Product Id DNE", // có sản phẩm không tồn tại
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      });
    }
    // lấy price cho từng sản phẩm
    let productPriceList = await db.ProductPrice.find({
      _id: {
        $in: productCartIdListPrev,
      },
    });

    // bỏ những đứa hết hạn
    productPriceList = productPriceList.filter((item) => {
      const isDated =
        item.ending_timestamp && item.ending_timestamp < new Date();
      return !isDated;
    });

    const result = [];
    let allQuality = 0;
    productList.forEach((product) => {
      const prevProduct = cart_list.find(
        (item) => Number(item.product_id) == product.id
      );
      if (product.quantity < Number(prevProduct?.quantity)) {
        throw new ErrorWithStatus({
          message: "Số lượng sản phẩm không đủ",
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        });
      }

      const price = Number(
        productPriceList.find(
          (item) =>
            item.product_id === product.id && item.ending_timestamp === null
        )?.price
      );
      const sale_price = Number(
        productPriceList.find(
          (item) =>
            item.product_id === product.id && item.ending_timestamp !== null
        )?.price
      );
      const productInfor = productList.find((item) => item.id === product.id);
      const volume = productInfor?.volume ? Number(productInfor?.volume) : 10;
      const weight = productInfor?.weight ? Number(productInfor?.weight) : 10;
      allQuality += Number(prevProduct?.quantity);
      result.push({
        ...product,
        price,
        sale_price,
        quantity: Number(prevProduct?.quantity),
        volume: volume,
        weight: weight,
      });
    });

    // tính tổng tiền
    let totalMoney = 0;
    result.forEach((item) => {
      item.sale_price
        ? (totalMoney += item.sale_price * item.quantity)
        : (totalMoney += item.price * item.quantity);
    });
    if (voucher_code) {
      const voucher = await voucherService.getVoucherByCode(voucher_code);
      totalMoney -= voucher?.value || 0;
    }
    return {
      cart_list: result,
      allQuality,
      totalMoney,
    };
  }
  async cancelOrder(orderId) {
    const order = await db.Order.findOneAndUpdate(
      {
        _id: ObjectId(orderId),
      },
      {
        status: ORDER_STATUS.CANCELLED,
      },
      {
        new: true,
      }
    );
    if (!order) {
      throw new ErrorWithStatus({
        message: "Order not found",
        status: HTTP_STATUS.NOT_FOUND,
      });
    }
    return order;
  }
  async getOrder(orderId) {
    const order = await db.Order.findById(orderId);
    const orderDetail = await db.OrderDetail.find({
      order_id: order._id,
    }).select("-_id -__v -createdAt -updatedAt -order_id");
    const productIds = orderDetail.map((item) => item.product_id);
    const products = await db.Product.find({
      _id: {
        $in: productIds,
      },
    });
    const ProductVariationIds = await db.ProductVariation.find({
      _id: {
        $in: orderDetail.map((item) => item.variation_id),
      },
    });
    console.log(ProductVariationIds);

    const result = orderDetail.map((item) => {
      const product = products.find((product) =>
        product._id.equals(item.product_id)
      );
      console.log(product);

      return {
        ...item._doc,
        product: product,
        name: product.name,
        images: ProductVariationIds.find((variation) =>
          variation._id.equals(item.variation_id)
        ).images,
      };
    });
    return {
      ...order._doc,
      orderDetail: result,
    };
  }
  async getAllOrders() {
    return await db.Order.find();
  }

  async getOrdersByCriteria(status, user_id) {
    const orders = await db.Order.find({
      status: status.toUpperCase(),
      user_id: new ObjectId(user_id),
    });

    const orderDetails = await db.OrderDetail.find({
      order_id: {
        $in: orders.map((order) => order._id),
      },
    });

    const productIds = orderDetails.map((item) => item.product_id);
    const products = await db.Product.find({
      _id: {
        $in: productIds,
      },
    }).select("_id name"); // Chỉ lấy _id và name

    const variations = await db.ProductVariation.find({
      _id: {
        $in: orderDetails.map((orderDetail) => orderDetail.variation_id),
      },
    });

    const result = orders.map((order) => {
      const orderDetail = orderDetails.filter((item) =>
        item.order_id.equals(order._id)
      );

      const productsInOrder = orderDetail.map((item) => {
        const product = products.find(
          (product) => product._id.toString() === item.product_id.toString()
        );
        const images = variations.find(
          (variation) =>
            variation._id.toString() === item.variation_id.toString()
        ).images;

        return {
          ...item._doc,
          images,
          name: product.name,
        };
      });

      return {
        ...order._doc,
        orderDetail: productsInOrder,
      };
    });

    return result;
  }
}
const orderService = new OrderService();
exports.orderService = orderService;
