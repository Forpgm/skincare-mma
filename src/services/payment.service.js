const { ZalopayConfig } = require("../config/zalopay");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const axios = require("axios");

class PaymentService {
  async getPaymentUrl(order, products) {
    const embed_data = {};
    const items = products.map((product) => ({
      item_id: product.product_id,
      item_name: product.name,
      item_price: product.price,
      item_quantity: product.quantity,
    }));
    const transID = `${moment().format("YYMMDD")}_${order._id}`;
    const data = {
      app_id: ZalopayConfig.app_id,
      app_trans_id: transID,
      app_user: `user_${order.user_id}`,
      app_time: Date.now(),
      amount: order.end_price,
      description: `Thanh toán đơn hàng #${order._id}`,
      bank_code: "zalopayapp",
      callback_url: `https://f15e-2001-ee0-50da-4e00-715b-4a03-c50b-5bef.ngrok-free.app/api/orders/callback`,
      embed_data: JSON.stringify(embed_data),
      item: JSON.stringify(items),
    };
    console.log(data);

    const dataString = `${data.app_id}|${data.app_trans_id}|${data.app_user}|${data.amount}|${data.app_time}|${data.embed_data}|${data.item}`;
    data.mac = CryptoJS.HmacSHA256(dataString, ZalopayConfig.key1).toString();

    const response = await axios.post(ZalopayConfig.endpoint, null, {
      params: data,
    });

    if (response.data.return_code !== 1) {
      console.log(response.data);

      throw new Error(`ZaloPay Error: ${response.data.return_message}`);
    }

    return response.data;
  }
}

const paymentService = new PaymentService();
exports.paymentService = paymentService;
