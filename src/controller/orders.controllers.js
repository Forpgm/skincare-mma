const { orderService } = require("../services/orders.service");

exports.createOrderController = async (req, res, next) => {
  try {
    console.log("🚀 ~ exports.createOrderController= ~ req.body:", req.body);
    const { products, customer_id } = req.body;
    const result = await orderService.createOrder(customer_id, products);
    res.status(200).json({
      message: "Order created successfully",
      result,
    });
  } catch (error) {
    console.log("🚀 ~ exports.createOrderController= ~ error:", error);
    next(error);
  }
};
