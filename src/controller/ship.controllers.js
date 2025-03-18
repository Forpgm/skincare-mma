const { omit } = require("lodash");
const { shipServices } = require("../services/ship.service");
const { orderService } = require("../services/orders.service");

exports.getProvincesController = async (req, res, next) => {
  try {
    const providers = await shipServices.getProvinces();
    return res.json(providers);
  } catch (error) {
    next(error);
  }
};
exports.getDistrictsController = async (req, res) => {
  const provinceId = req.body.province_id;
  const districts = await shipServices.getDistricts(provinceId);
  return res.json(districts);
};

exports.getWardsController = async (req, res, Request) => {
  const districtId = req.body.district_id;
  const wards = await shipServices.getWards(districtId);
  return res.json(wards);
};

exports.getPackageServicesController = async (req, res, next) => {
  try {
    const { to_district } = req.body;
    const packageServices = await shipServices.getPackageServices(to_district);
    return res.json(packageServices);
  } catch (err) {
    next(err);
  }
};
exports.getFeeController = async (req, res, next) => {
  try {
    const feeReq = omit(req.body, ["cart_list"]);
    const { voucher_code } = req.body;

    const cart_list = req.body.cart_list;
    const cartList = await orderService.convertCartList({
      cart_list,
      voucher_code,
    });
    const fee = await shipServices.getFee(feeReq, cartList);
    return res.json({ ...cartList, fee });
  } catch (err) {
    next(err);
  }
};

exports.createOrderController = async (req, res, next) => {
  try {
    const userId = req.decoded_authorization.user_id;
    const {
      service_id,
      to_district_id,
      to_ward_code,
      address,
      phone_number,
      receiver_name,
      content,
      cart_list,
      voucher_code,
    } = req.body;
    const cartList = await orderService.convertCartList({
      cart_list,
      voucher_code,
    });

    const getFreePackage = {
      service_id,
      to_district_id,
      to_ward_code,
    };
    const fee = await shipServices.getFee(getFreePackage, cartList);
    const createOrderParam = {
      userId: userId,
      fee,
      cartList,
      ...getFreePackage,
      address,
      phone_number,
      content,
      receiver_name,
    };

    const order = await shipServices.createOrder(createOrderParam);
    return res.json(order);
  } catch (err) {
    next(err);
  }
};
