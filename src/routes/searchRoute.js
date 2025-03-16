var express = require("express");
const { searchController } = require("../controller/search.controllers.js");
var searchRouter = express.Router();

searchRouter.get("/", searchController);

module.exports = searchRouter;
