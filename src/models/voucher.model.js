const mongoose = require("mongoose");
const ErrorWithStatus = require("../models/errors");

const VoucherSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Voucher code is required"],
      unique: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    description: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 1, // Mặc định là 1 nếu không được cung cấp
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Created by is required"],
      ref: "Account",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

const Voucher = mongoose.model("Voucher", VoucherSchema);

module.exports = Voucher;
