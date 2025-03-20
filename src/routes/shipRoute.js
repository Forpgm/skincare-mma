var express = require("express");
const { searchController } = require("../controller/search.controllers.js");
const {
  getProvincesController,
  getDistrictsController,
  getWardsController,
  getPackageServicesController,
  getFeeController,
  createOrderController,
} = require("../controller/ship.controllers.js");

const { getFeeMiddleware } = require("../middleware/shipMiddleware.js");
const { accessTokenValidator } = require("../middleware/users.middleware.js");
var shipRouter = express.Router();

shipRouter.get("/provinces", getProvincesController);
shipRouter.post("/districts", getDistrictsController);
shipRouter.post("/wards", getWardsController);
shipRouter.get("/package-services", getPackageServicesController);
shipRouter.post("/fee", getFeeMiddleware, getFeeController);
shipRouter.post(
  "/create-order",
  accessTokenValidator,
  getFeeMiddleware,
  createOrderController
);

module.exports = shipRouter;
