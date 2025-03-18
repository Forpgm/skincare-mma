const db = require("../models/index");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");

class VoucherService {
  async applyVoucher(voucherCode, orderTotal) {
    const voucher = await db.Voucher.findOne({
      code: voucherCode,
      isActive: true,
      expiryDate: { $gte: new Date() },
      quantity: { $gt: 0 },
    });

    if (!voucher) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: "Voucher not found, expired, or out of stock",
      });
    }

    if (orderTotal < voucher.minOrderValue) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: `Order total must be at least ${voucher.minOrderValue} to use this voucher`,
      });
    }

    const discountAmount = (orderTotal * voucher.discount) / 100;
    const newTotal = orderTotal - discountAmount;

    voucher.quantity -= 1;
    await voucher.save();

    return {
      discountAmount,
      newTotal,
      voucher,
    };
  }

  async createVoucher(data, userId) {
    try {
      const voucherData = {
        ...data,
        createdBy: userId,
      };
      const voucher = await db.Voucher.create(voucherData);
      return voucher;
    } catch (error) {
      // Xử lý lỗi từ Mongoose hoặc các lỗi khác
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: error.message || "Failed to create voucher",
      });
    }
  }
}

module.exports = new VoucherService();
