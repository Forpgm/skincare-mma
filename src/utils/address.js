import axios from "axios";

export const getProvinces = async () => {
  return await axios(
    `https://online-gateway.ghn.vn/shiip/public-api/master-data/province`,
    {
      headers: { token: process.env.TOKEN },
    }
  ).then((response) => response.data.data);
};

export const getDistricts = async (provinceId) => {
  return await axios
    .post(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/district`,
      { province_id: provinceId },
      {
        headers: {
          "Content-Type": "application/json",
          token: process.env.TOKEN,
        },
      }
    )
    .then((response) => response.data.data);
};

export const getWards = async (districtId) => {
  return await axios
    .get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward`, {
      params: { district_id: districtId },

      headers: {
        "Content-Type": "application/json",
        token: process.env.TOKEN,
      },
    })
    .then((responsee) => response.data.data);
};

export const getProvinceById = async (provinceId) => {
  return await axios(
    `https://online-gateway.ghn.vn/shiip/public-api/master-data/province`,
    {
      headers: { token: process.env.TOKEN },
    }
  ).then((response) =>
    response.data.data.find((province) => provinceId === province.ProvinceID)
  );
};

export const getDistrictById = async (provinceId, districtId) => {
  console.log(provinceId, districtId);
  return await axios
    .post(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/district`,
      { province_id: provinceId },
      {
        headers: {
          "Content-Type": "application/json",
          token: process.env.TOKEN,
        },
      }
    )
    .then((response) => {
      return response.data.data.find((district) => {
        return district.DistrictID === districtId;
      });
    });
};

export const getWardById = async (districtId, wardId) => {
  return await axios
    .get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward`, {
      params: { district_id: districtId },
      headers: {
        "Content-Type": "application/json",
        token: process.env.TOKEN,
      },
    })
    .then((response) => {
      return response.data.data.find((ward) => Number(ward.WardCode) == wardId);
    });
};
