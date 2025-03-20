const { orderService } = require("../services/orders.service");

exports.cancelOrderController = async (req, res) => {
  try {
    const result = await orderService.cancelOrder(req.body.order_id);
  } catch (error) {
    next(error);
  }
};
