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
const { createOrderValidator } = require("../middleware/orders.middleware");
const { createOrderController } = require("../controller/orders.controllers");
const { ZalopayConfig } = require("../config/zalopay");
const { log } = require("console");

const orderRoute = express.Router();

// API thêm sản phẩm vào giỏ hàng và tạo URL thanh toán VNPay
orderRoute.post(
  "/add-to-cart",
  authMiddleware,
  roleMiddleware(["customer"]),
  async (req, res) => {
    try {
      const { account, items } = req.body;

      if (!account || !items || items.length === 0) {
        return res
          .status(400)
          .json({ message: "An order must contain at least one product." });
      }

      const accountDetails = await db.Account.findById(account)
        .select("balance email")
        .exec();
      if (!accountDetails) {
        return res.status(404).json({ message: "Account not found." });
      }

      let totalAmount = 0;
      const updatedProducts = [];

      for (const item of items) {
        const product = await db.Product.findById(item.product);
        if (!product) {
          return res
            .status(404)
            .json({ message: `Product with ID ${item.product} not found.` });
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({
            message: `Not enough stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
          });
        }

        totalAmount += item.quantity * product.price;
        product.quantity -= item.quantity;
        updatedProducts.push(product);
      }

      if (accountDetails.balance < totalAmount) {
        return res.status(400).json({
          message: "Insufficient balance. Please recharge your account.",
        });
      }

      accountDetails.balance -= totalAmount;
      await accountDetails.save();

      for (const product of updatedProducts) {
        await product.save();
      }

      const adminAccount = await db.Account.findOne({ role: "admin" })
        .select("balance")
        .exec();
      if (!adminAccount) {
        return res.status(500).json({ message: "Admin account not found." });
      }

      adminAccount.balance += totalAmount;
      await adminAccount.save();

      const newOrder = new db.Order({
        account,
        items,
        totalAmount,
        status: "Paid",
      });

      await newOrder.save();

      const vnpay = new VNPay({
        tmnCode: "9TKDVWYK",
        secureSecret: "LH6SD44ECTBWU1PHK3D2YCOI5HLUWGPH",
        vnpayHost: "https://sandbox.vnpayment.vn",
        testMode: true,
        hashAlgorithm: "SHA512",
        enableLog: true,
        loggerFn: ignoreLogger,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: totalAmount,
        vnp_IpAddr: "127.0.0.1",
        vnp_TxnRef: newOrder._id.toString(),
        vnp_OrderInfo: `${newOrder._id}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: "https://www.facebook.com/",
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(tomorrow),
      });

      const populatedOrder = await db.Order.findById(newOrder._id)
        .populate("items.product")
        .exec();

      const formattedItems = populatedOrder.items.map((item) => ({
        productName: item.product?.name || "Unknown Product",
        price: item.product?.price || 0,
        quantity: item.quantity,
      }));

      const emailTemplatePath = path.join(
        __dirname,
        "../templates/orderConfirmationTemplate.html"
      );
      const emailTemplateSource = fs.readFileSync(emailTemplatePath, "utf8");
      const emailTemplate = handlebars.compile(emailTemplateSource);

      const emailHtml = emailTemplate({
        orderId: newOrder._id,
        totalAmount: totalAmount,
        items: formattedItems,
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: accountDetails.email,
        subject: "Order Confirmation",
        html: emailHtml,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      return res.status(201).json(vnpayResponse);
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  }
);

// API tạo đơn hàng và thanh toán qua ZaloPay
orderRoute.post(
  "/zalopay/create-payment",
  accessTokenValidator,
  createOrderValidator,
  createOrderController
);

// Callback từ ZaloPay
orderRoute.post("/callback", async (req, res) => {
  let result = {};
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;
    console.log("Received dataStr =", dataStr);

    let mac = CryptoJS.HmacSHA256(dataStr, ZalopayConfig.key2).toString();

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      console.log("Valid MAC");

      let dataJson =
        typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;

      let orderId = dataJson.app_trans_id.split("_")[1];

      console.log(" order_id =", orderId);

      await db.Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: "success" } },
        { new: true }
      );

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (error) {
    console.error("Error processing callback:", error.message);
    result.return_code = 0;
    result.return_message = error.message;
  }

  res.json(result);
});

// Lấy đơn hàng theo account ID
orderRoute.get(
  "/account/:id",
  authMiddleware,
  roleMiddleware(["customer"]),
  async (req, res) => {
    try {
      const orders = await db.Order.find({ account: req.params.id });
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  }
);

// Nạp tiền vào tài khoản
orderRoute.patch("/add-balance", async (req, res) => {
  try {
    const { account, amount } = req.body;

    if (!account || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const accountDetails = await db.Account.findById(account)
      .select("balance")
      .exec();
    if (!accountDetails) {
      return res.status(404).json({ message: "Account not found." });
    }

    accountDetails.balance += amount;
    await accountDetails.save();

    res.status(200).json({ message: "Balance added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Hủy đơn hàng
orderRoute.post("/cancel-order/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await db.Order.findById(orderId).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.status !== "Paid") {
      return res
        .status(400)
        .json({ message: "Only paid orders can be canceled." });
    } else {
      const refundAmount = order.totalAmount * 0.5;

      const account = await db.Account.findById(order.account);
      account.balance += refundAmount;
      await account.save();

      const adminAccount = await db.Account.findOne({ role: "admin" });
      if (adminAccount) {
        adminAccount.balance += refundAmount;
        await adminAccount.save();
      }

      for (const item of order.items) {
        const product = await db.Product.findById(item.product._id);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }

        order.status = "Canceled";
        await order.save();

        const formattedItems = order.items.map((item) => ({
          productName: item.product?.name || "Unknown Product",
          quantity: item.quantity,
          price: item.product?.price || 0,
          total: item.quantity * item.product?.price || 0,
        }));
        const emailTemplatePath = path.join(
          __dirname,
          "../templates/refundTemplate.html"
        );
        const emailTemplateSource = fs.readFileSync(emailTemplatePath, "utf8");
        const emailTemplate = handlebars.compile(emailTemplateSource);
        const emailHtml = emailTemplate({
          orderId,
          refundAmount,
          items: formattedItems,
        });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: account.email,
          subject: "Xác nhận hoàn tiền đơn hàng",
          html: emailHtml,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.error("Lỗi gửi email:", error);
          else console.log("Email sent:", info.response);
        });

        return res.status(200).json({
          message:
            "Đơn hàng đã được hủy và hoàn tiền 50%. Số lượng sản phẩm đã được cập nhật vào kho.",
          refundAmount,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
});

// API mới: Lấy trạng thái của một đơn hàng theo orderId
orderRoute.get(
  "/status/:orderId",
  async (req, res) => {
    try {
      const { orderId } = req.params;
      console.log("Fetching order with ID:", orderId);

      const order = await db.Order.findById(orderId)
        .populate("user_id", "email")
        .lean();

      if (!order) {
        console.log("Order not found for ID:", orderId);
        return res.status(404).json({ message: "Order not found" });
      }

      console.log("Order found:", order);
      const orderDetails = await db.OrderDetail.find({ order_id: order._id })
        .populate("product_id", "name price")
        .populate("variation_id", "name");

      const orderWithDetails = { ...order, details: orderDetails };

      let feedbackStatus = null;
      if (order.status === "SUCCESS") {
        const updatedAt = new Date(order.updatedAt);
        const now = new Date();
        const daysSinceSuccess = Math.floor(
          (now - updatedAt) / (1000 * 60 * 60 * 24)
        );

        if (order.feedbackAt) {
          feedbackStatus = "FEEDBACK_SUBMITTED";
        } else if (daysSinceSuccess <= 7) {
          feedbackStatus = "NEED_FEEDBACK";
        } else {
          feedbackStatus = "NO_FEEDBACK";
        }
      }

      res.status(200).json({
        order: orderWithDetails,
        feedbackStatus: feedbackStatus,
      });
    } catch (error) {
      console.error("Error fetching order:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// API gửi feedback (giữ nguyên)
orderRoute.post(
  "/feedback/:orderId",
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { feedback } = req.body;

      if (!feedback) {
        return res.status(400).json({ message: "Feedback content is required" });
      }

      const order = await db.Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.status !== "SUCCESS") {
        return res.status(400).json({ message: "Order must be successful to submit feedback" });
      }

      const updatedAt = new Date(order.updatedAt);
      const now = new Date();
      const daysSinceSuccess = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));

      if (order.feedback) {
        return res.status(400).json({ message: "Feedback already submitted" });
      }

      if (daysSinceSuccess > 7) {
        return res.status(400).json({ message: "Feedback period has expired (7 days)" });
      }

      order.feedback = feedback;
      order.feedbackAt = now;
      await order.save();

      res.status(200).json({ message: "Feedback submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = orderRoute;
