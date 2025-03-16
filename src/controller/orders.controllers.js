const { orderService } = require("../services/orders.service");

exports.createOrderController = async (req, res, next) => {
  try {
    const { products } = req.body;
    const { userId } = req.decoded_authorization;
    const result = await orderService.createOrder(userId, products);
    res.status(200).json({
      message: "Order created successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
