const express = require("express");
const CryptoJS = require("crypto-js");
const { accessTokenValidator } = require("../middleware/users.middleware");
const { createOrderValidator } = require("../middleware/orders.middleware");
const { createOrderController } = require("../controller/orders.controllers");
const { ZalopayConfig } = require("../config/zalopay");
const { Order } = require("../models/order.model");

const payRouter = express.Router();

payRouter.post(
  "/zalopay",
  accessTokenValidator,
  createOrderValidator,
  createOrderController,
);

payRouter.post("/callback", async (req, res) => {
  try {
    const callbackData = req.body;
    console.log("ZaloPay Callback received:", callbackData);

    // 1. Validate the callback data with MAC
    const { mac, ...data } = callbackData;
    const dataStr = Object.keys(data)
      .filter((key) => key !== "mac")
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join("&");

    const calculatedMac = CryptoJS.HmacSHA256(
      dataStr,
      ZalopayConfig.key2,
    ).toString();

    if (calculatedMac !== mac) {
      console.log("Invalid MAC signature");
      return res.status(200).json({
        return_code: 0,
        return_message: "Invalid MAC",
      });
    }

    // 2. Process the payment data
    const { app_trans_id } = callbackData;
    const transID = app_trans_id;

    // Extract orderID from transID (YYMMdd_orderID format)
    const orderID = transID.split("_")[1];

    // 3. Update order status
    if (callbackData.status === 1) {
      // Payment successful
      await Order.findByIdAndUpdate(orderID, {
        payment_status: "completed",
        status: "processing",
        payment_info: callbackData,
      });
    } else {
      // Payment failed
      await Order.findByIdAndUpdate(orderID, {
        payment_status: "failed",
        payment_info: callbackData,
      });
    }

    // 4. Return proper response to ZaloPay
    return res.status(200).json({
      return_code: 1,
      return_message: "success",
    });
  } catch (error) {
    console.error("Error processing ZaloPay callback:", error);
    return res.status(200).json({
      return_code: 0,
      return_message: "Server error",
    });
  }
});

payRouter.get("/redirect", async (req, res) => {
  const { appurl, status, apptransid } = req.query;
  console.log("Redirect received with params:", req.query);

  // Create a comprehensive HTML page that attempts multiple redirection methods
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Returning to App...</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        .loader { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hidden { display: none; }
        .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px; }
      </style>
    </head>
    <body>
      <h2>Payment Completed</h2>
      <p>Returning to application...</p>
      <div class="loader" id="loader"></div>
      <div id="manual-return" class="hidden">
        <p>If the app doesn't open automatically:</p>
        <a href="${appurl}" class="button">Return to App</a>
      </div>
      
      <script>
        // Try multiple app return methods
        function tryOpenApp() {
          // Method 1: Direct location change
          window.location.href = "${appurl}";
          
          // Method 2: Intent URL for Android
          setTimeout(function() {
            // For Android intent format
            const intentUrl = "intent://" + 
              "${appurl}".replace("com.anonymous.myapp://", "") + 
              "#Intent;scheme=com.anonymous.myapp;package=com.anonymous.myapp;end;";
            window.location.href = intentUrl;
          }, 500);
          
          // Method 3: iframe approach for iOS
          setTimeout(function() {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = "${appurl}";
            document.body.appendChild(iframe);
          }, 1000);
          
          // Show manual return option if automatic methods fail
          setTimeout(function() {
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('manual-return').classList.remove('hidden');
          }, 2500);
        }
        
        // Execute when page loads
        window.onload = tryOpenApp;
      </script>
    </body>
    </html>
  `);
});

exports.payRouter = payRouter;
