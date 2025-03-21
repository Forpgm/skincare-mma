const express = require("express");
const db = require("../models/index");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { create } = require("../models/account.model");
const { get } = require("lodash");
const {
  getProductsController,
  getProductDetailController,
  addProductController,
  getProductByCateController,
  updateProductController,
  getProductByCriteriaController,
  getProductSimilarValidatorController,
} = require("../controller/products.controllers");
const {
  getProductDetailValidator,
  addProductValidator,
  updateProductValidator,
  getProductByCateValidator,
  getProductByCriteriaValidator,
  getProductSimilarValidator,
} = require("../middleware/productMiddleware");
const {
  accessTokenValidator,
  roleValidator,
} = require("../middleware/users.middleware");

const productRoute = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for products
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       403:
 *         description: Forbidden, user does not have permission
 *       500:
 *         description: Internal server error
 */
productRoute.get("/all", getProductsController);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRoute.get("/:id", getProductDetailValidator, getProductDetailController);
productRoute.get(
  "/",
  getProductByCriteriaValidator,
  getProductByCriteriaController
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *               suitableSkin:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden, user does not have permission
 *       500:
 *         description: Internal server error
 */
productRoute.post(
  "/add",
  roleValidator,
  addProductValidator,
  addProductController
);

productRoute.patch(
  "/update",
  roleValidator,
  updateProductValidator,
  updateProductController
);

module.exports = productRoute;
