const express = require("express");

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

exports.payRouter = payRouter;
