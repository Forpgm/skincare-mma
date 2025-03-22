const express = require("express");
const db = require("../models/index");
const crypto = require("crypto");
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");
const roleMiddleware = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const moment = require("moment");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const { accessTokenValidator } = require("../middleware/users.middleware");
const {
  createOrderValidator,
  cancelOrderValidator,
  getOrderValidator,
  getOrdersByCriteriaValidator,
} = require("../middleware/orders.middleware");
const {
  createOrderController,
  cancelOrderController,
  getOrderController,
  getOrdersByCriteriaController,
} = require("../controller/orders.controllers");

const orderRoute = express.Router();

orderRoute.post(
  "/cancel",
  accessTokenValidator,
  cancelOrderValidator,
  cancelOrderController
);
orderRoute.get(
  "/:id",
  accessTokenValidator,
  getOrderValidator,
  getOrderController
);
orderRoute.get(
  "/",
  accessTokenValidator,
  getOrdersByCriteriaValidator,
  getOrdersByCriteriaController
);
module.exports = orderRoute;
