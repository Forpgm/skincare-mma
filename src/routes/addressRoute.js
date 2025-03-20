const express = require("express");
const db = require("../models/index");
const { add } = require("lodash");
const { accessTokenValidator } = require("../middleware/users.middleware");
const {
  getAddressesController,
  addAddressController,
  deleteAddressController,
  updateAddressController,
  getDefaultAddressController,
} = require("../controller/address.controllers");
const {
  addAddressValidator,
  deleteAddressValidator,
  updateAddressValidator,
} = require("../middleware/addressMiddleware");
const addressRouter = express.Router();
addressRouter.get("/", accessTokenValidator, getAddressesController);
addressRouter.post(
  "/add",
  accessTokenValidator,
  addAddressValidator,
  addAddressController
);
addressRouter.delete(
  "/delete/:address_id",
  accessTokenValidator,
  deleteAddressValidator,
  deleteAddressController
);
addressRouter.patch(
  "/:address_id",
  accessTokenValidator,
  updateAddressValidator,
  updateAddressController
);
addressRouter.get(
  "/default",
  accessTokenValidator,
  getDefaultAddressController
);
exports.addressRouter = addressRouter;
