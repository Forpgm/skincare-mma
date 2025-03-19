var express = require("express");
const { searchController } = require("../controller/search.controllers.js");
const {
  getProvincesController,
  getDistrictsController,
  getWardsController,
  getPackageServicesController,
  getFeeController,
} = require("../controller/ship.controllers.js");
const {
  createOrderController,
} = require("../controller/orders.controllers.js");
var shipRouter = express.Router();

shipRouter.get("/provinces", getProvincesController);
shipRouter.post("/districts", getDistrictsController);
shipRouter.post("/wards", getWardsController);
shipRouter.get("/package-services", getPackageServicesController);
// shipRouter.post("/fee", getFeeController);
// shipRouter.post("/create-order", createOrderController);

module.exports = shipRouter;
