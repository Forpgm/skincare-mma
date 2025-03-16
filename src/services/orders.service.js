const db = require("../models/index");
const { paymentService } = require("./payment.service");

class OrderService {
  async createOrder(userId, products) {
    const order = await db.Order.create({
      user_id: userId,
      total_quantity: products.reduce(
        (acc, product) => acc + product.quantity,
        0
      ),
      estimate_price: products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      ),
      end_price: products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      ),
      status: "PENDING",
    });
    const orderDetails = products.map((product) => ({
      user_id: userId,
      order_id: order._id,
      variation_id: product.variation_id,
      product_id: product.product_id,
      quantity: product.quantity,
      price: product.price,
      total_price: product.price * product.quantity,
    }));
    await db.OrderDetail.insertMany(orderDetails);
    // create payment url
    const payment = await paymentService.getPaymentUrl(order, products);
    return payment;
  }
}
const orderService = new OrderService();
exports.orderService = orderService;
