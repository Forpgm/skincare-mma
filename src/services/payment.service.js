const { ZalopayConfig } = require("../config/zalopay");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const axios = require("axios");

class PaymentService {
  async getPaymentUrl(order, products, paymentMethod = "zalopayapp") {
    try {
      const items = products.map((product) => ({
        item_id: product.product_id,
        item_name: product.name,
        item_price: product.price,
        item_quantity: product.quantity,
      }));

      const transID = `${moment().format("YYMMDD")}_${order._id}`;

      // Store additional payment details for reference
      const embed_data = {
        redirecturl: `com.anonymous.myapp://payment?apptransid=${transID}`,
        transID: transID,
        orderID: order._id,
        merchantInfo: "Skincare Shop", // Add merchant info for receipts
        paymentMethod: paymentMethod,
        timestamp: Date.now(),
      };

      // Create payment request data
      const data = {
        app_id: ZalopayConfig.app_id,
        app_trans_id: transID,
        app_user: `user_${order.user_id}`,
        app_time: Date.now(),
        amount: order.end_price,
        description: `Thanh toán đơn hàng #${order._id}`,
        bank_code: paymentMethod, // Support different payment methods
        callback_url: `https://skincare-be-mma.onrender.com/api/payment/callback`,
        // Update the redirect URL format to ensure compatibility with ZaloPay
        redirecturl: `https://skincare-be-mma.onrender.com/api/payment/redirect?appurl=${encodeURIComponent(
          `com.anonymous.myapp://payment/result?orderID=${order._id}&transID=${transID}`,
        )}`,
        embed_data: JSON.stringify({
          ...embed_data,
          // Use proper formatting for redirect scheme
          redirectscheme: "com.anonymous.myapp",
          app_redirect_action: "return",
          // Include backup domain in case primary fails
          redirectdomains: ["skincare-be-mma.onrender.com"],
          title: `Thanh toán đơn hàng #${order._id}`,
        }),
        item: JSON.stringify(items),
      };

      // Generate MAC for security
      const dataString = `${data.app_id}|${data.app_trans_id}|${data.app_user}|${data.amount}|${data.app_time}|${data.embed_data}|${data.item}`;
      data.mac = CryptoJS.HmacSHA256(dataString, ZalopayConfig.key1).toString();

      // Log payment attempt
      console.log(
        `Creating payment for order ${order._id}, amount: ${order.end_price}`,
      );

      try {
        // Add request timeout to handle connection issues
        const response = await axios.post(ZalopayConfig.endpoint, null, {
          params: data,
          timeout: 15000, // 15 seconds timeout
        });

        if (response.data.return_code !== 1) {
          console.error(
            `ZaloPay Error: ${response.data.return_message}`,
            response.data,
          );
          throw new Error(`ZaloPay Error: ${response.data.return_message}`);
        }

        // Validate and log the returned payment URL
        if (response.data.order_url) {
          console.log(`Payment URL generated: ${response.data.order_url}`);
        } else {
          console.warn(`No order_url in ZaloPay response`, response.data);
        }

        // Add transaction ID to the response
        return {
          ...response.data,
          transID,
          orderID: order._id,
          // Add fallback URL in case the primary one fails
          fallback_url: `https://zalopay.vn/qrcode?order=${
            response.data.order_url?.split("order=")[1] || ""
          }`,
        };
      } catch (error) {
        console.error("Error in ZaloPay API request:", error.message);
        if (
          error.code === "ECONNABORTED" ||
          error.message.includes("timeout")
        ) {
          throw new Error(`Payment gateway timeout. Please try again later.`);
        }
        throw new Error(`Payment gateway error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in getPaymentUrl:", error);
      throw error;
    }
  }

  // New method to verify payment status with ZaloPay
  async verifyPayment(appTransId) {
    try {
      const data = {
        app_id: ZalopayConfig.app_id,
        app_trans_id: appTransId,
      };

      // Generate MAC for security
      const dataString = `${data.app_id}|${data.app_trans_id}|${ZalopayConfig.key1}`;
      data.mac = CryptoJS.HmacSHA256(dataString, ZalopayConfig.key1).toString();

      const response = await axios.post(
        ZalopayConfig.queryStatusEndpoint ||
          "https://sb-openapi.zalopay.vn/v2/query",
        null,
        { params: data },
      );

      if (response.data.return_code !== 1) {
        console.error(`ZaloPay Query Error: ${response.data.return_message}`);
        return {
          success: false,
          message: response.data.return_message,
          data: response.data,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error verifying payment:", error.message);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Method to handle refunds
  async refundPayment(
    orderId,
    appTransId,
    amount,
    description = "Refund request",
  ) {
    try {
      // For future implementation with ZaloPay refund API
      console.log(
        `Initiated refund for order ${orderId}, transaction ${appTransId}, amount: ${amount}`,
      );

      // Mock implementation
      return {
        success: true,
        message: "Refund initiated",
        refundId: `RF_${Date.now()}`,
      };
    } catch (error) {
      console.error("Error processing refund:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

const paymentService = new PaymentService();
exports.paymentService = paymentService;
