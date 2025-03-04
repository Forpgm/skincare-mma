const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: { type: true, message: "User is required" },
    },
    order_detail_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderDetail",
      required: { type: true, message: "Order Detail is required" },
    },
    content: {
      type: String,
      required: true,
    },
    rating_number: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "true",
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
