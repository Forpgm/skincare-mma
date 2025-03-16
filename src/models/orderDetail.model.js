const mongoose = require("mongoose");

const OrderDetailSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const OrderDetail = mongoose.model("OrderDetail", OrderDetailSchema);

module.exports = OrderDetail;
