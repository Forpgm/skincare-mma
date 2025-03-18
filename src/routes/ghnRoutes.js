const express = require("express");
const router = express.Router();
const {
  getProvinces,
  getAvailableServices,
  calculateShippingFee,
} = require("../services/ghnService");

// Lấy danh sách tỉnh/thành
router.get("/provinces", async (req, res) => {
  try {
    const provinces = await getProvinces();
    res.json({ success: true, data: provinces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy danh sách dịch vụ khả dụng
router.post("/available-services", async (req, res) => {
  const { fromDistrictId, toDistrictId } = req.body;
  if (!fromDistrictId || !toDistrictId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu fromDistrictId hoặc toDistrictId",
    });
  }
  try {
    const services = await getAvailableServices(
      parseInt(fromDistrictId),
      parseInt(toDistrictId)
    );
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tính phí vận chuyển
router.post("/calculate-fee", async (req, res) => {
  const { fromDistrictId, toDistrictId, weight } = req.body;
  if (!fromDistrictId || !toDistrictId || !weight) {
    return res.status(400).json({
      success: false,
      message: "Thiếu fromDistrictId, toDistrictId hoặc weight",
    });
  }
  try {
    const fee = await calculateShippingFee(
      parseInt(fromDistrictId),
      parseInt(toDistrictId),
      parseInt(weight)
    );
    res.json({ success: true, data: fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
