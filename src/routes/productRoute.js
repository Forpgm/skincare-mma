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
} = require("../controller/products.controllers");
const {
  getProductDetailValidator,
  addProductValidator,
  updateProductValidator,
  getProductByCateValidator,
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
productRoute.get("/", getProductByCateValidator, getProductByCateController);

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

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Update a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
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
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden, user does not have permission
 *       500:
 *         description: Internal server error
 */
productRoute.patch(
  "/update",
  roleValidator,
  updateProductValidator,
  updateProductController
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden, user does not have permission
 *       500:
 *         description: Internal server error
 */
productRoute.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  async (req, res) => {
    const productId = req.params.id;

    try {
      const deletedProduct = await db.Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = productRoute;
