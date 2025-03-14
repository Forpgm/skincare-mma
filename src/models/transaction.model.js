const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // Mã đơn hàng nội bộ
    appTransId: { type: String, required: true, unique: true }, // Mã giao dịch ZaloPay
    zpTransId: { type: Number, default: null }, // Mã giao dịch bên ZaloPay
    amount: { type: Number, required: true }, // Số tiền thanh toán
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELED"],
      default: "PENDING",
    }, // Trạng thái giao dịch
    paymentMethod: { type: String, default: null }, // Phương thức thanh toán
    bankCode: { type: String, default: null }, // Mã ngân hàng
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
