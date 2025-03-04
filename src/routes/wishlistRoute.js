const express = require("express");
const bodyParser = require("body-parser");
const { accessTokenValidator } = require("../middleware/users.middleware");
const {
  addWishListValidator,
  deleteWishListValidator,
} = require("../middleware/wishList.middleware");
const {
  addWishListController,
  deleteWishListController,
  getWishListController,
} = require("../controller/wishlist.controllers");

const wishListRoute = express.Router();
wishListRoute.use(bodyParser.json());

wishListRoute.post(
  "/add",
  accessTokenValidator,
  addWishListValidator,
  addWishListController
);
wishListRoute.delete(
  "/delete",
  accessTokenValidator,
  deleteWishListValidator,
  deleteWishListController
);
wishListRoute.get("/all", accessTokenValidator, getWishListController);
module.exports = wishListRoute;
