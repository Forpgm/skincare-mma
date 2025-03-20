const { ZalopayConfig } = require("../config/zalopay");
const moment = require("moment");
const CryptoJS = require("crypto-js");

const axios = require("axios");

class PaymentService {
  async getPaymentUrl(order, products) {
    const items = products.map((product) => ({
      item_id: product.product_id,
      item_variation_id: product.variation_id,
      item_name: product.name,
      item_price: product.price,
      item_quantity: product.quantity,
    }));
    const transID = `${moment().format("YYMMDD")}_${order._id}`;
    const embed_data = {
      redirecturl: `com.anonymous.myapp://payment?apptransid=${transID}`,
    };

    // tính checksum
    let checksumData =
      ZalopayConfig.app_id +
      "|" +
      transID +
      "|" +
      38 +
      "|" +
      "zalopayapp" +
      "|" +
      order.end_price +
      "|" +
      0 +
      "|" +
      1;
    let checksum = CryptoJS.HmacSHA256(
      checksumData,
      ZalopayConfig.key2
    ).toString();
    console.log("checksum", checksum);
    // console.log(
    //   `https://ff9f-2402-800-63a9-a094-3d4d-96b4-9431-9e28.ngrok-free.app/api/payment/callback?appid=${
    //     ZalopayConfig.app_id
    //   }&apptransid=${transID}&pmcid=${38}&bankcode=zalopayapp&amount=${
    //     order.end_price
    //   }&discountamount=0&status=1&checksum=${checksum}`
    // );

    const data = {
      app_id: ZalopayConfig.app_id,
      app_trans_id: transID,
      app_user: `user_${order.user_id}`,
      app_time: Date.now(),
      amount: order.end_price,
      description: `Thanh toán đơn hàng #${order._id}`,
      bank_code: "zalopayapp",
      //callback_url: `https://ff9f-2402-800-63a9-a094-3d4d-96b4-9431-9e28.ngrok-free.app/api/payment/callback`,
      callback_url: `https://ff9f-2402-800-63a9-a094-3d4d-96b4-9431-9e28.ngrok-free.app/api/payment/callback?appid=${
        ZalopayConfig.app_id
      }&apptransid=${transID}&pmcid=${38}&bankcode=zalopayapp&amount=${
        order.end_price
      }&discountamount=0&status=1&checksum=${checksum}`,
      redirecturl: `com.anonymous.myapp://payment?status=delivering&order_id=${order._id}`,
      embed_data: JSON.stringify(embed_data),
      item: JSON.stringify(items),
    };

    const dataString = `${data.app_id}|${data.app_trans_id}|${data.app_user}|${data.amount}|${data.app_time}|${data.embed_data}|${data.item}`;
    data.mac = CryptoJS.HmacSHA256(dataString, ZalopayConfig.key1).toString();

    const response = await axios.post(ZalopayConfig.endpoint, null, {
      params: data,
    });

    if (response.data.return_code !== 1) {
      throw new Error(`ZaloPay Error: ${response.data.return_message}`);
    }

    return response.data;
  }
}

const paymentService = new PaymentService();
exports.paymentService = paymentService;
