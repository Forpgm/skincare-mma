const productService = require("../services/products.service");

exports.getProductsController = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts();
    res.status(200).json({
      message: "Get all products successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.getProductDetailController = async (req, res, next) => {
  try {
    const result = await productService.getProductDetail(req.params.id);
    res.status(200).json({
      message: "Get product detail successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.addProductController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await productService.addProduct(req.body, userId);
    res.status(200).json({
      message: "Add product successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.getProductByCriteriaController = async (req, res, next) => {
  try {
    const result = await productService.getProductByCriteria(req.query);
    res.status(200).json({
      message: "Get product by category successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateProductController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await productService.updateProduct(userId, req.body);
    res.status(200).json({
      message: "Update product successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
