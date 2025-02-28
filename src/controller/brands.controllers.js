const { brandService } = require("../services/brands.service");

exports.gellAllBrandsController = async (req, res) => {
  try {
    const result = await brandService.getAllBrands();
    res.json({
      message: "Get all brands successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addBrandController = async (req, res) => {
  try {
    console.log(req.body);

    const result = await brandService.addBrand(req.body);
    res.status(201).json({
      message: "Brand created successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
