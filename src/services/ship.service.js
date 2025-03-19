const { default: axios } = require("axios");
const { config } = require("dotenv");
const { ErrorWithStatus } = require("../models/errors");
const { SHIP_MESSAGES } = require("../constants/message");
const { HTTP_STATUS } = require("../constants/httpStatus");

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

  async getFee(feeReq, cartList) {
    const { service_id, to_district_id, to_ward_code } = feeReq;

    // kiểm tra xem to_district_id có tồn tại không ?
    const checkToDistrict = await this.getWards(to_district_id);
    // kiểm tra xem to_ward_code có tồn tại không ?
    const checkWard = checkToDistrict.find(
      (ward) => ward.WardCode.toString() === to_ward_code
    );
    // kiểm tra xem service_id có tồn tại không ?
    const packageServices = await this.getPackageServices(to_district_id); // 3695: TP thủ đức
    const checkService = packageServices.find(
      (service) => service.service_id.toString() === service_id
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

    const totalWeight = cartList.cart_list.reduce((result, item) => {
      return (result += (item.weight | 10) * item.quantity);
    }, 0);
    const countOfBox = cartList.allQuality / 6;
    const param = {
      ...feeReq,
      // những thông tin dưới đây mình để mặc định khi nào có api get thì mình bỏ vào
      from_district_id: 3695, // tp Thủ đức
      insurance_value: cartList.totalMoney, // giá tiền của cả đơn hàng
      coupon: null, // mã giảm giá
      height: 30 * countOfBox,
      length: 60,
      weight: totalWeight,
      width: 45,
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

  async createOrder(createOrderParams) {
    const user = await db.User.findOne({
      where: {
        id: createOrderParams.user_id,
      },
    });

    if (!user) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const cartListToOrder = createOrderParams.cartList.cart_list.map((item) => {
      return {
        name: item.name,
        code: item.id.toString(),
        quantity: item.quantity,
        price: item.price,
        length: 10,
        width: 15,
        height: 30,
        weight: item.weight,
        category: {
          level1: item.ship_category_id,
        },
      };
    });
    const body = {
      // thông tin của shop
      payment_type_id: 1, // người bán trả tiền vì khách đã thanh toán trước đó
      note: "Please call before delivery", // ghi chú
      required_note: "KHONGCHOXEMHANG",
      from_name: "DAIRY_STORE", // tên shop
      from_phone: "0787806042", // số điện thoại của shop
      from_address:
        "115/13 đường Đình Phong Phú, Phường Tăng Nhơn Phú B, Quận 9, Hồ Chí Minh, Vietnam",
      from_ward_name: "Phường Tăng Nhơn Phú B",
      from_district_name: "Thành Phố Thủ Đức",
      from_province_name: "HCM",
      // địa chỉ trả bưu kiện nếu không giao đc
      return_phone: "0787806042",
      return_address:
        "115/13 đường Đình Phong Phú, Phường Tăng Nhơn Phú B, Quận 9, Hồ Chí Minh, Vietnam",
      return_district_id: null,
      return_ward_code: "",
      client_order_code: "",
      // thông tin khách hàng
      //    thông tin cá nhân khách hàng
      // to_name: user.first_name + ' ' + user.last_name, // username của khách hàng
      to_name: createOrderParams.receiver_name, // username của khách hàng
      to_phone: createOrderParams.phone_number, // số điện thoại của khách hàng
      to_address: createOrderParams.address, // địa chỉ của khách hàng
      to_ward_code: createOrderParams.to_ward_code,
      to_district_id: Number(createOrderParams.to_district_id),
      cod_amount: 0, // tiền mặt sẽ thu từ khách hàng, là 0 vì minh đã thanh toán trước
      content: createOrderParams.content,
      weight: createOrderParams.fee.totalWeight,
      length: createOrderParams.fee.totalLength,
      width: createOrderParams.fee.totalWidth,
      height: createOrderParams.fee.totalHeight,
      pick_station_id: Number(createOrderParams.to_district_id), // nơi shiper đến lấy hàng
      deliver_station_id: null,
      insurance_value: createOrderParams.cartList.totalMoney, // tổng tiền hàng để nếu có vấn đề sẽ đc bồi thường
      service_id: Number(createOrderParams.service_id), // lấy service_id từ của người dùng truyền lên
      service_type_id: 0,
      coupon: null,
      pick_shift: [2],
      // danh sách sản phẩm
      items: cartListToOrder,
    };

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
