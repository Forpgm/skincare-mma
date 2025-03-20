const express = require("express");
const db = require("../models/index");
const { paymentService } = require("../services/payment.service");
const { shipServices } = require("../services/ship.service");
const CryptoJS = require("crypto-js");
const { ZalopayConfig } = require("../config/zalopay");

const { ORDER_STATUS } = require("../constants/enum");

const { accessTokenValidator } = require("../middleware/users.middleware");

const { createPaymentValidator } = require("../middleware/orders.middleware");
const {
  createPaymentController,
  checkPaymentResultController,
} = require("../controller/payment.controllers");

const payRouter = express.Router();
payRouter.post(
  "/zalopay",
  accessTokenValidator,
  createPaymentValidator,
  createPaymentController
);
payRouter.post("/callback", checkPaymentResultController);
// payRouter.post("/callback", (req, res) => {
//   let data = req.query;
//   let checksumData =
//     data.appid +
//     "|" +
//     data.apptransid +
//     "|" +
//     data.pmcid +
//     "|" +
//     data.bankcode +
//     "|" +
//     data.amount +
//     "|" +
//     data.discountamount +
//     "|" +
//     data.status;

//   let checksum = CryptoJS.HmacSHA256(
//     checksumData,
//     ZalopayConfig.key2
//   ).toString();

//   if (checksum != data.checksum) {
//     res.sendStatus({
//       return_code: -1,
//       return_message: "Invalid checksum",
//       redirecturl: "https://yourdomain.com/return-url",
//     });
//   } else {
//     // kiểm tra xem đã nhận được callback hay chưa, nếu chưa thì tiến hành gọi API truy vấn trạng thái thanh toán của đơn hàng để lấy kết quả cuối cùng
//     res.sendStatus(200);
//   }
// });
exports.payRouter = payRouter;
