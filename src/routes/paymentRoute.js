const express = require("express");
const CryptoJS = require("crypto-js");

const { accessTokenValidator } = require("../middleware/users.middleware");
const { createOrderValidator } = require("../middleware/orders.middleware");
const { createOrderController } = require("../controller/orders.controllers");
const { ZalopayConfig } = require("../config/zalopay");
const db = require("../models/index");
const payRouter = express.Router();
payRouter.post(
  "/zalopay",
  accessTokenValidator,
  createOrderValidator,
  createOrderController
);
payRouter.post("/callback", async (req, res) => {
  console.log("callback");

  let result = {};
  let orderId = null;
  try {
    let dataStr = req.body.data; // Lấy data từ request
    let reqMac = req.body.mac; // Lấy MAC từ request
    console.log("Received dataStr =", dataStr);

    // Tính toán MAC để xác thực dữ liệu từ ZaloPay
    let mac = CryptoJS.HmacSHA256(dataStr, ZalopayConfig.key2).toString();
    // console.log("Calculated mac =", mac);

    // Kiểm tra MAC hợp lệ
    if (reqMac !== mac) {
      console.log("Invalid MAC");

      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      console.log("Valid MAC");

      // update status của order trong DB
      let dataJson =
        typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;

      orderId = dataJson.app_trans_id.split("_")[1]; // Lấy order_id

      const order = await db.Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: "success" } },
        { new: true }
      );
      console.log("order: ", order);

      result.return_code = 1;
      result.return_message = "SUCCESS";
    }
  } catch (error) {
    console.error("Error processing callback:", error.message);
    result.return_code = 0; // ZaloPay sẽ callback lại nếu lỗi
    result.return_message = error.message;
  }
  console.log("Return result:", result);

  return res.redirect(
    `com.anonymous.myapp://payment?apptransid=${req.body.data.app_trans_id}`
  );
});

exports.payRouter = payRouter;
