const express = require("express");
const { accessTokenValidator } = require("../middleware/users.middleware");
const { createOrderValidator } = require("../middleware/orders.middleware");
const { Order } = require("../models/order.model");
const { Product } = require("../models");
const { createOrderController } = require("../controller/orders.controllers");

const payRouter = express.Router();

payRouter.post(
  "/zalopay",
  // accessTokenValidator,
  // createOrderValidator,
  createOrderController,
);

// Callback endpoint for ZaloPay notifications
payRouter.post("/callback", async (req, res) => {
  try {
    const data = req.body;
    console.log("Payment callback received:", data);

    // Verify the payment with ZaloPay
    const verificationResult = await paymentService.verifyPayment(
      data.app_trans_id,
    );

    if (verificationResult.success) {
      // Update order status based on payment result
      // Implementation depends on your order model

      return res.status(200).json({
        return_code: 1,
        return_message: "success",
      });
    } else {
      return res.status(200).json({
        return_code: 0,
        return_message: verificationResult.message,
      });
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return res.status(200).json({
      return_code: 0,
      return_message: error.message,
    });
  }
});

// Redirect endpoint for payment completion
payRouter.get("/redirect", (req, res) => {
  const { appurl } = req.query;

  if (appurl) {
    // Redirect to app with payment result
    return res.redirect(appurl);
  } else {
    // Fallback page if no redirect URL provided
    return res.status(200).send(`
      <html>
        <body>
          <h1>Payment Processed</h1>
          <p>You can now return to the app.</p>
        </body>
      </html>
    `);
  }
});

exports.payRouter = payRouter;
