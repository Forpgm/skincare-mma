const voucherService = require("../services/voucher.service");

exports.applyVoucherController = async (req, res, next) => {
  try {
    const { voucherCode, orderTotal } = req.body;
    const result = await voucherService.applyVoucher(voucherCode, orderTotal);
    res.status(200).json({
      message: "Voucher applied successfully",
      result: {
        originalTotal: orderTotal,
        discountAmount: result.discountAmount,
        newTotal: result.newTotal,
        voucher: result.voucher,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createVoucherController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await voucherService.createVoucher(req.body, userId);
    res.status(201).json({
      message: "Voucher created successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
