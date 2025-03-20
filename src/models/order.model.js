const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    total_quantity: {
      type: Number,
      required: true,
    },
    estimate_price: {
      type: Number,
      required: true,
    },
    ghn_order_code: {
      type: String,
      required: false,
    },
    service_id: {
      type: Number,
      required: false,
    },
    discount: {
      type: Number,
      required: false,
    },
    end_price: {
      type: Number,
      required: true,
    },
    shipping_fee: {
      type: Number,
      required: false,
    },
    expected_delivery_time: {
      type: Date,
      required: false,
    },
    to_district_id: {
      type: Number,
      required: false,
    },
    to_ward_code: {
      type: String,
      required: false,
    },
    shipping_address: {
      type: String,
      required: false,
    },
    receiver_name: {
      type: String,
      required: false,
    },
    phone_number: {
      type: String,
      required: false,
    },
    expected_delivery_date: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["PENDING", "DELIVERING", "SUCCESS", "CANCELED"],
      required: true,
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
