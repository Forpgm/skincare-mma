const { default: axios } = require("axios");
const { orderService } = require("../services/orders.service");
const { config } = require("dotenv");
config();

exports.cancelOrderController = async (req, res, next) => {
  try {
    const result = await orderService.cancelOrder(req.body.order_id);
    return res.json({
      message: "Cancel order successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderController = async (req, res, next) => {
  try {
    const result = await orderService.getOrder(req.params.id);

    return res.json({
      message: "Get order successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
