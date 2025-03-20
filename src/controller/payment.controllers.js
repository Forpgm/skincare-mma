const db = require("../models/index");
const { paymentService } = require("../services/payment.service");
const { shipServices } = require("../services/ship.service");
const CryptoJS = require("crypto-js");
const { ZalopayConfig } = require("../config/zalopay");
const e = require("express");
const { ORDER_STATUS } = require("../constants/enum");

exports.createPaymentController = async (req, res, next) => {
  try {
    const { products, to_district_id, to_ward_code } = req.body;
    // lấy service_id
    const service_id = await shipServices.getPackageServices(to_district_id);

    const { userId } = req.decoded_authorization;
    // lấy phí ship
    const feeParams = {
      service_id: service_id[0].service_id,
      to_district_id,
      to_ward_code,
    };

    const fee = await shipServices.getFee(feeParams);
    // tạo order cho khách hàng với status là pending - chờ thanh toán
    const order = await db.Order.create({
      user_id: userId,
      total_quantity: products
        .map((product) => product.quantity)
        .reduce((a, b) => a + b, 0),
      estimate_price: products
        .map((product) => product.price * product.quantity)
        .reduce((a, b) => a + b, 0),
      end_price:
        products
          .map((product) => product.price * product.quantity)
          .reduce((a, b) => a + b, 0) + fee.total,
      shipping_fee: fee.total,
      shipping_address: req.body.address,
      receiver_name: req.body.receiver_name,
      to_district_id,
      to_ward_code,
      phone_number: req.body.phone_number,
      service_id: service_id[0].service_id,
    });
    // tạo order detail
    const orderDetail = products.map((product) => {
      return {
        user_id: userId,
        variation_id: product.variation_id,
        order_id: order._id,
        product_id: product.product_id,
        quantity: product.quantity,
        price: product.price,
        total_price: product.quantity * product.price,
      };
    });
    await db.OrderDetail.insertMany(orderDetail);

    // tạo payment url
    const result = await paymentService.getPaymentUrl(order, products);
    res.status(200).json({
      message: "payment created successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

exports.checkPaymentResultController = async (req, res, next) => {
  let result = {};
  let orderId = null;
  try {
    let dataStr = req.body.data; // Lấy data từ request
    let reqMac = req.body.mac; // Lấy MAC từ request
    console.log("Received dataStr: ", dataStr);

    // Tính toán MAC để xác thực dữ liệu từ ZaloPay
    let mac = CryptoJS.HmacSHA256(dataStr, ZalopayConfig.key2).toString();
    // Kiểm tra MAC hợp lệ
    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson =
        typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;

      // cập nhật order status pending - delivering
      orderId = dataJson.app_trans_id.split("_")[1]; // Lấy order_id

      const order = await db.Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: ORDER_STATUS.DELIVERING } },
        { new: true }
      );
      result.return_code = 1;
      result.return_message = "SUCCESS";
      result.return_url = `com.anonymous.myapp://payment?apptransid=${dataJson.app_trans_id}`;

      // lưu lại transaction
      await db.Transaction.create({
        orderId: orderId,
        appTransId: dataJson.app_trans_id,
        zpTransId: dataJson.zp_trans_id,
        amount: dataJson.amount,
        paymentMethod: "ZALOPAY",
        status: "PAID",
      });
      // đặt đơn trên ghn
      const orderParam = {
        userId: order.user_id,
        fee: order.shipping_fee,
        cartList: dataJson.item,
        service_id: order.service_id,
        to_district_id: order.to_district_id,
        to_ward_code: order.to_ward_code,
        to_address: order.shipping_address,
        phone_number: order.phone_number,
        to_phone: order.phone_number,
        to_name: order.receiver_name,
      };

      const orderGHN = await shipServices.createOrder(
        orderParam.cartList,
        orderParam
      );
      // console.log("orderGHN", orderGHN);

      // cập nhật lại order với ghn_order_code và expected_delivery_date
      await db.Order.findOneAndUpdate(
        {
          _id: orderId,
        },
        {
          $set: {
            ghn_order_code: orderGHN.data.order_code,
            expected_delivery_date: orderGHN.data.expected_delivery_time,
          },
        }
      );
    }

    console.log("Return result:", result);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error processing callback:", error.message);
    result.return_code = 0; // ZaloPay sẽ callback lại nếu lỗi
    result.return_message = error.message;
  }
  console.log("Return result:", result);

  return res.redirect(
    `com.anonymous.myapp://payment?apptransid=${req.body.data.app_trans_id}`
  );
};
