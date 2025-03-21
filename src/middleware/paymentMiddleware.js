const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");
const db = require("../models/index");

exports.createPaymentValidator = validate(
  checkSchema(
    {
      products: {
        isArray: {
          options: { min: 1 },
          errorMessage: "Products must be an array and cannot be empty",
        },
        custom: {
          options: async (products) => {
            if (!Array.isArray(products)) {
              throw new Error("Products must be an array");
            }

            return true;
          },
        },
      },
      "products.*.variation_id": {
        notEmpty: {
          errorMessage: "variation_id is required",
        },
        custom: {
          options: async (product_variation_id) => {
            const existingProduct = await db.ProductVariation.findById(
              product_variation_id
            );
            if (!existingProduct) {
              throw new ErrorWithStatus({
                message: "Product variation not found",
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            return true;
          },
        },
      },
      "products.*.quantity": {
        notEmpty: {
          errorMessage: "Quantity is required",
        },
        isInt: {
          options: { min: 1 },
          errorMessage: "Quantity must be a positive integer",
        },
      },
      "products.*.product_id": {
        notEmpty: {
          errorMessage: "Product ID is required",
        },
        custom: {
          options: async (product_id) => {
            const existingProduct = await db.Product.findById(product_id);
            if (!existingProduct) {
              throw new ErrorWithStatus({
                message: "Product not found",
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            return true;
          },
        },
      },
      "products.*.price": {
        notEmpty: {
          errorMessage: "Price is required",
        },
        isNumeric: {
          errorMessage: "Price must be a number",
        },
      },
    },
    ["body"]
  )
);
