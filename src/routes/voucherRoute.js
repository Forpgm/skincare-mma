const express = require("express");
const {
  applyVoucherController,
  createVoucherController,
} = require("../controller/voucher.controllers");
const {
  applyVoucherValidator,
  createVoucherValidator,
} = require("../middleware/voucherMiddleware");
const { roleValidator } = require("../middleware/users.middleware");

const voucherRoute = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: API for managing vouchers
 */

/**
 * @swagger
 * /api/vouchers/apply:
 *   post:
 *     tags:
 *       - Vouchers
 *     summary: Apply a voucher to an order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voucherCode:
 *                 type: string
 *               orderTotal:
 *                 type: number
 *     responses:
 *       200:
 *         description: Voucher applied successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Voucher not found or expired
 *       500:
 *         description: Internal server error
 */
voucherRoute.post("/apply", applyVoucherValidator, applyVoucherController);

/**
 * @swagger
 * /api/vouchers/create:
 *   post:
 *     tags:
 *       - Vouchers
 *     summary: Create a new voucher (Admin/Manager only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               minOrderValue:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Voucher created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden, user does not have permission
 *       500:
 *         description: Internal server error
 */
voucherRoute.post(
  "/create",
  roleValidator,
  createVoucherValidator,
  createVoucherController
);

module.exports = voucherRoute;
