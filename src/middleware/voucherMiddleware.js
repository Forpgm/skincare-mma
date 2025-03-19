const { checkSchema } = require("express-validator");
const db = require("../models/index");
const { validate } = require("../utils/validator");
const { HTTP_STATUS } = require("../constants/httpStatus");
const { ErrorWithStatus } = require("../models/errors");

exports.applyVoucherValidator = validate(
  checkSchema(
    {
      voucherCode: {
        notEmpty: {
          errorMessage: "Voucher code is required",
        },
        isString: {
          errorMessage: "Voucher code must be a string",
        },
        custom: {
          options: async (value) => {
            const voucher = await db.Voucher.findOne({
              code: value,
              isActive: true,
              expiryDate: { $gte: new Date() },
              quantity: { $gt: 0 },
            });
            if (!voucher) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: "Voucher not found, expired, or out of stock",
              });
            }
            return true;
          },
        },
      },
      orderTotal: {
        notEmpty: {
          errorMessage: "Order total is required",
        },
        isNumeric: {
          errorMessage: "Order total must be a number",
        },
      },
    },
    ["body"]
  )
);

exports.createVoucherValidator = validate(
  checkSchema(
    {
      code: {
        notEmpty: { errorMessage: "Voucher code is required" },
        isString: { errorMessage: "Voucher code must be a string" },
        isLength: {
          options: { min: 5, max: 20 },
          errorMessage: "Voucher code must be between 5 and 20 characters",
        },
        custom: {
          options: async (value) => {
            const voucher = await db.Voucher.findOne({ code: value });
            if (voucher) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.CONFLICT,
                message: "Voucher code already exists",
              });
            }
            return true;
          },
        },
      },
      discount: {
        notEmpty: { errorMessage: "Discount value is required" },
        isNumeric: { errorMessage: "Discount must be a number" },
        custom: {
          options: (value) => {
            if (value < 0 || value > 100) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Discount must be between 0 and 100",
              });
            }
            return true;
          },
        },
      },
      expiryDate: {
        notEmpty: { errorMessage: "Expiry date is required" },
        isISO8601: { errorMessage: "Invalid date format" },
        custom: {
          options: (value) => {
            if (new Date(value) <= new Date()) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Expiry date must be in the future",
              });
            }
            return true;
          },
        },
      },
      minOrderValue: {
        optional: true,
        isNumeric: { errorMessage: "Minimum order value must be a number" },
        custom: {
          options: (value) => {
            if (value < 0) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Minimum order value cannot be negative",
              });
            }
            return true;
          },
        },
      },
      quantity: {
        notEmpty: { errorMessage: "Quantity is required" },
        isNumeric: { errorMessage: "Quantity must be a number" },
        custom: {
          options: (value) => {
            if (value < 0) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Quantity cannot be negative",
              });
            }
            return true;
          },
        },
      },
      description: {
        optional: true,
        isString: { errorMessage: "Description must be a string" },
      },
    },
    ["body"]
  )
);
