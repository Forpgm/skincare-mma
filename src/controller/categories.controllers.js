const { CATEGORIES_MESSAGES } = require("../constants/message");
const { categoryService } = require("../services/categories.service");

exports.getAllCategoriesController = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories();
    res.status(200).json({
      message: CATEGORIES_MESSAGES.GET_ALL_CATEGORIES_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getCategoryDetailController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryService.getCategoryDetail(id);
    if (!result) {
      return res
        .status(404)
        .json({ message: CATEGORIES_MESSAGES.CATEGORY_NOT_FOUND });
    }
    res.status(200).json({
      message: CATEGORIES_MESSAGES.GET_CATEGORY_DETAIL_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addCategoryController = async (req, res) => {
  try {
    const { user_id } = req.decoded_authorization;
    const result = await categoryService.addCategory(req.body, user_id);
    res.status(201).json({
      message: CATEGORIES_MESSAGES.ADD_CATEGORY_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateCategoryController = async (req, res) => {
  try {
    const { user_id } = req.decoded_authorization;
    const result = await categoryService.updateCategory(req.body, user_id);
    res.status(200).json({
      message: CATEGORIES_MESSAGES.UPDATE_CATEGORY_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteCategoryController = async (req, res) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await categoryService.deleteCategory(req.body, userId);
    res.status(200).json({
      message: CATEGORIES_MESSAGES.DELETE_CATEGORY_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getSubCategoryController = async (req, res) => {
  try {
    const { parent_category_id } = req.query;
    const result = await categoryService.getSubCateByParentCateId(
      parent_category_id
    );
    res.status(200).json({
      message: CATEGORIES_MESSAGES.GET_SUB_CATEGORY_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
