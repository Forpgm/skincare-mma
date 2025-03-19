const express = require("express");
const db = require("../models/index");
const feedbackRoute = express.Router();

// API mới: Lấy tất cả feedback của một user
feedbackRoute.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra userId hợp lệ
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Lấy tất cả feedback của user
    const feedbacks = await db.Feedback.find({ user_id: userId }).populate({
      path: "order_detail_id",
      populate: [
        { path: "order_id", select: "status createdAt" },
        { path: "product_id", select: "name" },
        { path: "variation_id", select: "attributes price" },
      ],
    });

    if (!feedbacks || feedbacks.length === 0) {
      return res
        .status(404)
        .json({ message: "No feedback found for this user" });
    }

    // Tạo response với thông tin chi tiết
    const response = feedbacks.map((feedback) => {
      const orderDetail = feedback.order_detail_id;
      return {
        feedbackId: feedback._id.toString(),
        orderId: orderDetail?.order_id?._id.toString() || "N/A",
        orderStatus: orderDetail?.order_id?.status || "N/A",
        orderCreatedAt: orderDetail?.order_id?.createdAt || "N/A",
        productId: orderDetail?.product_id?._id.toString() || "N/A",
        productName: orderDetail?.product_id?.name || "Unknown Product",
        variationId: orderDetail?.variation_id?._id.toString() || "N/A",
        variationAttributes: orderDetail?.variation_id?.attributes || {},
        price: orderDetail?.price || 0,
        rating: feedback.rating_number,
        comment: feedback.content,
        createdAt: feedback.createdAt,
      };
    });

    res.status(200).json({
      userId: userId,
      feedbacks: response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Các route hiện có
feedbackRoute.get("/order/:orderId/products", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await db.Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderDetails = await db.OrderDetail.find({ order_id: orderId })
      .populate("product_id", "name")
      .populate("variation_id", "attributes price quantity");

    const feedback = await db.Feedback.find({
      order_detail_id: { $in: orderDetails.map((detail) => detail._id) },
    });

    const products = orderDetails.map((detail) => {
      const productFeedback = feedback.find(
        (fb) => fb.order_detail_id.toString() === detail._id.toString()
      );
      return {
        productId: detail.product_id._id.toString(),
        variationId: detail.variation_id._id.toString(),
        name: detail.product_id.name,
        price: detail.price,
        quantity: detail.quantity,
        totalPrice: detail.total_price,
        feedback: productFeedback
          ? {
              rating: productFeedback.rating_number,
              comment: productFeedback.content,
            }
          : null,
      };
    });

    const response = {
      orderId: orderId,
      products,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

feedbackRoute.post("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, orderId, content, ratingNumber } = req.body;

    if (!userId || !orderId || !content || !ratingNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (ratingNumber < 1 || ratingNumber > 5) {
      return res
        .status(400)
        .json({ message: "Rating number must be between 1 and 5" });
    }

    const order = await db.Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderDetail = await db.OrderDetail.findOne({
      order_id: orderId,
      product_id: productId,
    });
    if (!orderDetail) {
      return res
        .status(404)
        .json({ message: "Product not found in this order" });
    }

    if (order.status !== "SUCCESS") {
      return res.status(403).json({ message: "Order not completed yet" });
    }

    if (order.user_id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to provide feedback" });
    }

    const existingFeedback = await db.Feedback.findOne({
      order_detail_id: orderDetail._id,
    });
    if (existingFeedback) {
      return res
        .status(400)
        .json({ message: "This product has already been reviewed" });
    }

    const feedback = new db.Feedback({
      user_id: userId,
      order_detail_id: orderDetail._id,
      content,
      rating_number: ratingNumber,
    });

    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

feedbackRoute.post("/:orderDetailId", async (req, res) => {
  try {
    const { orderDetailId } = req.params;
    const { userId, content, ratingNumber } = req.body;

    if (!userId || !content || !ratingNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const orderDetail = await db.OrderDetail.findById(orderDetailId);
    if (!orderDetail) {
      return res.status(404).json({ message: "OrderDetail not found" });
    }

    const order = await db.Order.findById(orderDetail.order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "SUCCESS") {
      return res.status(403).json({ message: "Order not completed yet" });
    }

    if (order.user_id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to provide feedback" });
    }

    const existingFeedback = await db.Feedback.findOne({
      order_detail_id: orderDetailId,
    });
    if (existingFeedback) {
      return res
        .status(400)
        .json({ message: "This product has already been reviewed" });
    }

    const feedback = new db.Feedback({
      user_id: userId,
      order_detail_id: orderDetailId,
      content,
      rating_number: ratingNumber,
    });

    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

feedbackRoute.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await db.Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderDetails = await db.OrderDetail.find({ order_id: orderId });

    const orderDetailIds = orderDetails.map((detail) => detail._id);
    const feedbacks = await db.Feedback.find({
      order_detail_id: { $in: orderDetailIds },
    });

    const response = {
      orderId: orderId,
      userId: order.user_id.toString(),
      orderDetails: orderDetails.map((detail) => {
        const feedback = feedbacks.find(
          (fb) => fb.order_detail_id.toString() === detail._id.toString()
        );
        return {
          orderDetailId: detail._id.toString(),
          productId: detail.product_id.toString(),
          feedback: feedback
            ? {
                rating: feedback.rating_number,
                comment: feedback.content,
              }
            : null,
        };
      }),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = feedbackRoute;
