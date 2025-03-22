const { default: axios } = require("axios");
const { orderService } = require("../services/orders.service");
const { config } = require("dotenv");
const { ORDER_STATUS } = require("../constants/enum");
const db = require("../models/index");
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
async function checkAndUpdateOrders() {
  const currentTime = new Date();

  await db.Order.updateMany(
    {
      expected_delivery_date: { $lte: currentTime },
      status: { $ne: ORDER_STATUS.DELIVERED },
    },
    { $set: { status: ORDER_STATUS.DELIVERED } }
  );
}

setInterval(checkAndUpdateOrders, 60 * 100);
exports.getOrdersByCriteriaController = async (req, res, next) => {
  try {
    const result = await orderService.getOrdersByCriteria(req.query.status);
    return res.json({
      message: "Get orders successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
