const mongoose = require("mongoose");

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
  { timestamps: true }
);

const Voucher = mongoose.model("Voucher", VoucherSchema);

module.exports = Voucher;
