const express = require("express");
const db = require("../models/index");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { default: categoryService } = require("../services/categories.service");
const { CATEGORIES_MESSAGES } = require("../constants/message");
const {
  getAllCategoriesController,
  addCategoryController,
  updateCategoryController,
  getCategoryDetailController,
  deleteCategoryController,
  getSubCategoryController,
} = require("../controller/categories.controllers");
const { roleValidator } = require("../middleware/users.middleware");
const {
  addCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  getSubCategoryValidator,
} = require("../middleware/categories.middleware");

const categoryRoute = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for categories
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       403:
 *         description: Forbidden, user does not have permission
 *       500:
 *         description: Internal server error
 */
categoryRoute.get("/all", getAllCategoriesController);
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get a category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
categoryRoute.get("/:id", getCategoryDetailController);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a new category
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
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden, user does not have permission
 *       500:
 *         description: Internal server error
 */
categoryRoute.post(
  "/add",
  roleValidator,
  addCategoryValidator,
  addCategoryController
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update a category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */

categoryRoute.patch(
  "/update",
  roleValidator,
  updateCategoryValidator,
  updateCategoryController
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete a category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the category
 *       400:
 *         description: Category cannot be deleted because it has associated products
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
categoryRoute.delete(
  "/delete",
  roleValidator,
  deleteCategoryValidator,
  deleteCategoryController
);
categoryRoute.get("/", getSubCategoryValidator, getSubCategoryController);
module.exports = categoryRoute;
