const axios = require("axios");
const config = require("../config/config");

const apiClient = axios.create({
  baseURL: config.GHN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Token: config.GHN_API_TOKEN,
  },
});

// Lấy danh sách tỉnh/thành
async function getProvinces() {
  try {
    const response = await apiClient.get("/master-data/province");
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.message : error.message
    );
  }
}

// Lấy danh sách dịch vụ khả dụng
async function getAvailableServices(fromDistrictId, toDistrictId) {
  try {
    const response = await apiClient.post(
      "/v2/shipping-order/available-services",
      {
        shop_id: parseInt(config.GHN_SHOP_ID),
        from_district: fromDistrictId,
        to_district: toDistrictId,
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.message : error.message
    );
  }
}

// Tính phí vận chuyển
async function calculateShippingFee(fromDistrictId, toDistrictId, weight) {
  try {
    const services = await getAvailableServices(fromDistrictId, toDistrictId);
    if (!services || services.length === 0) {
      throw new Error("Không có dịch vụ nào khả dụng cho tuyến đường này");
    }

    const serviceId = services[0].service_id;

    const response = await apiClient.post("/v2/shipping-order/fee", {
      shop_id: parseInt(config.GHN_SHOP_ID),
      from_district_id: fromDistrictId,
      service_id: serviceId,
      to_district_id: toDistrictId,
      weight: weight,
      length: 15,
      width: 15,
      height: 15,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.message : error.message
    );
  }
}

module.exports = {
  getProvinces,
  getAvailableServices,
  calculateShippingFee,
};
