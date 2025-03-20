const db = require("../models/index");
const { paymentService } = require("./payment.service");
const { ObjectId } = require("mongodb");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");

class OrderService {
  async createOrder(userId, products, paymentMethod = "zalopayapp") {
    try {
      // Validate product availability and prices before creating order
      const validProducts = await this.validateProducts(products);
      if (!validProducts.success) {
        throw new ErrorWithStatus({
          message: validProducts.message,
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        });
      }

      // Create the order with initial status
      const order = await db.Order.create({
        user_id: userId,
        total_quantity: products.reduce(
          (acc, product) => acc + product.quantity,
          0,
        ),
        estimate_price: products.reduce(
          (acc, product) => acc + product.price * product.quantity,
          0,
        ),
        end_price: products.reduce(
          (acc, product) => acc + product.price * product.quantity,
          0,
        ),
        status: "PENDING",
        payment_status: "pending",
        payment_method: paymentMethod,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Create order details
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

      // Create payment URL
      const payment = await paymentService.getPaymentUrl(
        order,
        products,
        paymentMethod,
      );

      // Update order with payment information
      await db.Order.findByIdAndUpdate(order._id, {
        payment_info: {
          transID: payment.transID,
          payment_url: payment.order_url,
          created_at: new Date(),
        },
      });

      // Return payment information
      return {
        ...payment,
        order_id: order._id,
        order_details: { ...orderDetails },
        status: order.status,
        payment_status: order.payment_status,
        payment_info: {
          transID: payment.transID,
          payment_url: payment.order_url,
          created_at: new Date(),
        },
      };
    } catch (error) {
      console.error("Error creating order:", error);

      // If order was created but payment failed, update the order status
      if (error.order_id) {
        await db.Order.findByIdAndUpdate(error.order_id, {
          status: "FAILED",
          payment_status: "failed",
          payment_info: {
            error: error.message,
            timestamp: new Date(),
          },
        });
      }

      throw error;
    }
  }

  // New method to validate products before order creation
  async validateProducts(products) {
    try {
      // Get all product IDs
      const productIds = products.map((product) => product.product_id);

      // Get products from database
      const dbProducts = await db.Product.find({
        _id: { $in: productIds },
      });

      // Check if all products exist
      if (dbProducts.length !== productIds.length) {
        const foundIds = dbProducts.map((p) => String(p._id));
        const missingIds = productIds.filter(
          (id) => !foundIds.includes(String(id)),
        );
        return {
          success: false,
          message: `Products not found: ${missingIds.join(", ")}`,
        };
      }

      // Check product quantities
      for (const product of products) {
        const dbProduct = dbProducts.find(
          (p) => String(p._id) === String(product.product_id),
        );
        if (dbProduct.quantity < product.quantity) {
          return {
            success: false,
            message: `Not enough quantity for ${dbProduct.name}. Available: ${dbProduct.quantity}, Requested: ${product.quantity}`,
          };
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error validating products:", error);
      return {
        success: false,
        message: "Error validating products",
      };
    }
  }

  // Method to get order by ID with payment status
  async getOrderById(orderId, userId) {
    try {
      const order = await db.Order.findOne({
        _id: orderId,
        user_id: userId,
      });

      if (!order) {
        throw new ErrorWithStatus({
          message: "Order not found",
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      // If payment is pending, check the payment status
      if (order.payment_status === "pending" && order.payment_info?.transID) {
        try {
          const paymentStatus = await paymentService.verifyPayment(
            order.payment_info.transID,
          );

          // Update order if payment status has changed
          if (paymentStatus.success && paymentStatus.data.return_code === 1) {
            const status = paymentStatus.data.status;

            // Map ZaloPay status to our system status
            const statusMap = {
              1: { payment_status: "completed", status: "processing" },
              2: { payment_status: "canceled", status: "canceled" },
              3: { payment_status: "failed", status: "pending" },
              4: { payment_status: "error", status: "pending" },
            };

            if (statusMap[status]) {
              await db.Order.findByIdAndUpdate(orderId, {
                payment_status: statusMap[status].payment_status,
                status: statusMap[status].status,
                updated_at: new Date(),
              });

              // Update order object with new status
              order.payment_status = statusMap[status].payment_status;
              order.status = statusMap[status].status;
            }
          }
        } catch (error) {
          console.error("Error verifying payment status:", error);
        }
      }

      // Get order details
      const orderDetails = await db.OrderDetail.find({
        order_id: orderId,
      });

      return {
        order,
        details: orderDetails,
      };
    } catch (error) {
      console.error("Error getting order:", error);
      throw error;
    }
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

    // bỏ những đứa hết hạng
    productPriceList = productPriceList.filter((item) => {
      const isDated =
        item.ending_timestamp && item.ending_timestamp < new Date();
      return !isDated;
    });

    const result = [];
    let allQuality = 0;
    productList.forEach((product) => {
      const prevProduct = cart_list.find(
        (item) => Number(item.product_id) == product.id,
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
            item.product_id === product.id && item.ending_timestamp === null,
        )?.price,
      );
      const sale_price = Number(
        productPriceList.find(
          (item) =>
            item.product_id === product.id && item.ending_timestamp !== null,
        )?.price,
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
}

const orderService = new OrderService();
exports.orderService = orderService;
