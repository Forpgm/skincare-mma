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
  createPaymentPayosUrlController,
} = require("../controller/payment.controllers");

const payRouter = express.Router();
payRouter.post(
  "/zalopay",
  accessTokenValidator,
  createPaymentValidator,
  createPaymentController
);
payRouter.post("/callback", checkPaymentResultController);

payRouter.post(
  "/payos",
  accessTokenValidator,
  createPaymentValidator,
  createPaymentPayosUrlController
);
payRouter.post("/payos/webhook", (req, res) => {
  console.log("Webhook received", req.body);
  res.status(200).send("OK");
});

exports.payRouter = payRouter;
