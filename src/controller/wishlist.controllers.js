const { WISH_LIST_MESSAGES } = require("../constants/message");
const wishListService = require("../services/wishList.service");

exports.addWishListController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await wishListService.addWishList(userId, req.body);
    res.status(200).send({
      message: WISH_LIST_MESSAGES.ADD_WISH_LIST_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteWishListController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await wishListService.deleteWishList(userId, req.body);
    res.status(200).send({
      message: WISH_LIST_MESSAGES.DELETE_WISH_LIST_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.getWishListController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await wishListService.getWishList(userId);
    res.status(200).send({
      message: WISH_LIST_MESSAGES.GET_WISH_LIST_SUCCESSFULLY,
      result,
    });
  } catch (error) {
    next(error);
  }
};
