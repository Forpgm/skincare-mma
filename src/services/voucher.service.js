const db = require("../models/index");

class VoucherService {
  async applyVoucher(voucherCode, orderTotal) {
    const voucher = await db.Voucher.findOne({
      code: voucherCode,
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (!voucher) {
      throw new Error("Voucher not found or expired");
    }

    if (orderTotal < voucher.minOrderValue) {
      throw new Error(
        `Order total must be at least ${voucher.minOrderValue} to use this voucher`
      );
    }

    const discountAmount = (orderTotal * voucher.discount) / 100;
    const newTotal = orderTotal - discountAmount;

    return {
      discountAmount,
      newTotal,
      voucher,
    };
  }

  async createVoucher(data, userId) {
    const voucherData = {
      ...data,
      createdBy: userId,
    };
    const voucher = await db.Voucher.create(voucherData);
    return voucher;
  }
}

module.exports = new VoucherService();
