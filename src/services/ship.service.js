const { default: axios } = require("axios");
const { config } = require("dotenv");
const { ErrorWithStatus } = require("../models/errors");
const { SHIP_MESSAGES } = require("../constants/message");
const { HTTP_STATUS } = require("../constants/httpStatus");
const db = require("../models/index");

config();
class ShipServices {
  async getProvinces() {
    const result = await axios(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/province`,
      {
        headers: {
          token: process.env.SHIP_TOKEN,
        },
      }
    );
    const provinces = result.data.data;
    const newprovinces = provinces.map((province) => {
      province = {
        ProvinceID: province.ProvinceID,
        ProvinceName: province.ProvinceName,
      };
      return province;
    });
    return newprovinces;
  }

  async getDistricts(provinceId) {
    const result = await axios
      .get(
        `https://online-gateway.ghn.vn/shiip/public-api/master-data/district`,
        {
          headers: {
            token: process.env.SHIP_TOKEN,
          },
          params: {
            province_id: provinceId,
          },
        }
      )
      .catch(() => {
        throw new ErrorWithStatus({
          message: "Province ID is invalid",
          status: HTTP_STATUS.BAD_REQUEST,
        });
      });
    const districts = result.data.data;
    const newDistricts = districts.map((district) => {
      return {
        DistrictID: district.DistrictID,
        DistrictName: district.DistrictName,
      };
    });
    return newDistricts;
  }

  async getWards(districtId) {
    const result = await axios
      .get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward`, {
        headers: {
          token: process.env.SHIP_TOKEN,
        },
        params: {
          district_id: districtId,
        },
      })
      .catch(() => {
        throw new ErrorWithStatus({
          message: SHIP_MESSAGES.DISTRICT_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST,
        });
      });
    const wards = result.data.data;
    const newWards = wards.map((ward) => {
      return {
        WardCode: ward.WardCode,
        WardName: ward.WardName,
      };
    });
    return newWards;
  }

  async getPackageServices(to_district) {
    const result = await axios.get(
      `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services`,
      {
        params: {
          shop_id: process.env.SHIP_SHOP_ID,
          from_district: "3695", // tp Thủ đức
          to_district,
        },
        headers: {
          token: process.env.SHIP_TOKEN,
        },
      }
    );

    if (!result.data.data) {
      throw new ErrorWithStatus({
        message: SHIP_MESSAGES.DISTRICT_ID_IS_INVALID,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }
    const packageServices = result.data.data;
    const newPackageServices = packageServices.map((service) => {
      return {
        service_id: service.service_id,
        short_name: service.short_name,
      };
    });
    return newPackageServices;
  }

  async getFee(payload) {
    const { service_id, to_district_id, to_ward_code } = payload;
    const feeReq = {
      service_id,
      to_district_id,
      to_ward_code,
    };
    // kiểm tra xem to_district_id có tồn tại không ?
    const checkToDistrict = await this.getWards(to_district_id);
    // kiểm tra xem to_ward_code có tồn tại không ?
    const checkWard = checkToDistrict.find(
      (ward) => ward.WardCode.toString() === to_ward_code
    );
    // kiểm tra xem service_id có tồn tại không ?
    const packageServices =
      (await this.getPackageServices(to_district_id)) || []; // 3695: TP thủ đức

    const checkService = packageServices.find(
      (service) => service.service_id == service_id
    );

    if (!checkToDistrict) {
      throw new ErrorWithStatus({
        message: SHIP_MESSAGES.TO_DISTRICT_ID_IS_INVALID,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }
    if (!checkWard) {
      throw new ErrorWithStatus({
        message: SHIP_MESSAGES.WARD_CODE_IS_INVALID,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }
    if (!checkService) {
      throw new ErrorWithStatus({
        message: SHIP_MESSAGES.SERVICE_ID_IS_INVALID,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const param = {
      ...feeReq,
      from_district_id: 3695, // tp Thủ đức
      insurance_value: "10000",
      coupon: null,
      height: 20,
      length: 20,
      weight: 500,
      width: 20,
    };
    const result = await axios.get(
      `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee`,
      {
        params: param,
        headers: {
          token: process.env.SHIP_TOKEN,
          shop_id: process.env.SHIP_SHOP_ID,
        },
      }
    );
    return {
      ...result.data.data,
      totalHeight: param.height,
      totalLength: param.length,
      totalWeight: param.weight,
      totalWidth: param.width,
    };
  }

  async createOrder(productList, orderParams) {
    const products = JSON.parse(productList);
    const orderList = products.map((item) => {
      return {
        name: item.item_name,
        variant_id: item.item_variation_id,
        quantity: item.item_quantity,
        price: item.item_price,
        length: 20,
        width: 20,
        height: 20,
        weight: 500,
      };
    });
    console.log(orderList);

    const body = {
      to_name: orderParams.to_name,
      from_name: "SKINCARE_STORE",
      from_phone: "0949309132",
      from_address:
        "Lô E2a-7, Đường D1, Khu Công nghệ cao, P.Long Thạnh Mỹ, Tp. Thủ Đức, TP.HCM",
      from_ward_name: "Phường Tăng Nhơn Phú B",
      from_district_name: "Thành Phố Thủ Đức",
      from_province_name: "HCM",
      to_phone: orderParams.to_phone,
      to_address: orderParams.to_address,
      to_ward_code: orderParams.to_ward_code,
      to_district_id: Number(orderParams.to_district_id),
      weight: 500,
      length: 20,
      width: 20,
      height: 20,
      service_type_id: 2,
      payment_type_id: 1,
      required_note: "KHONGCHOXEMHANG",
      items: orderList,
      insurance_value: 100000,
    };
    console.log(body);

    const result = await axios.post(
      `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create`,
      body,
      {
        headers: {
          token: process.env.SHIP_TOKEN,
          shop_id: process.env.SHIP_SHOP_ID,
        },
      }
    );
    return result.data;
  }
}

const shipServices = new ShipServices();
exports.shipServices = shipServices;
