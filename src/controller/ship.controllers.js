const { shipServices } = require("../services/ship.service.js");

exports.getProvincesController = async (req, res, next) => {
  try {
    const providers = await shipServices.getProvinces();
    return res.json(providers);
  } catch (error) {
    next(error);
  }
};
exports.getDistrictsController = async (req, res, next) => {
  try {
    const provinceId = req.body.province_id;
    const districts = await shipServices.getDistricts(provinceId);
    return res.json(districts);
  } catch (err) {
    next(err);
  }
};

exports.getWardsController = async (req, res, next) => {
  try {
    const districtId = req.body.district_id;
    const wards = await shipServices.getWards(districtId);
    return res.json(wards);
  } catch (err) {
    next(err);
  }
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
    const result = await shipServices.getFee(req.body);
    return res.json({
      message: "Lấy phí vận chuyển thành công",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.createOrderController = async (req, res, next) => {
  try {
    const { products } = req.body;
    const { userId } = req.decoded_authorization;
    const orderParams = {
      service_id: req.body.service_id,
      to_district_id: req.body.to_district_id,
      to_ward_code: req.body.to_ward_code,
      to_address: req.body.to_address,
      to_phone: req.body.to_phone,
      to_name: req.body.to_name,
      insurance_value: req.body.insurance_value,
      service_type_id: req.body.service_type_id,
    };

    const result = await shipServices.createOrder(
      userId,
      products,
      orderParams
    );
    res.status(200).json({
      message: "Order created successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
