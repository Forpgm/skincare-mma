const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const db = require("../models/index");

exports.getFeeMiddleware = validate(
  checkSchema(
    {
      service_id: {
        notEmpty: {
          errorMessage: "Service id is required",
        },
      },
      to_district_id: {
        notEmpty: {
          errorMessage: "District id is required",
        },
        isNumeric: {
          errorMessage: "District id must be a number",
        },
      },
      to_ward_code: {
        notEmpty: {
          errorMessage: "Ward code is required",
        },
        isString: {
          errorMessage: "Ward code must be a string",
        },
      },
      products: {
        notEmpty: {
          errorMessage: "Products is required",
        },
        isArray: {
          errorMessage: "Products must be an array",
        },
      },
      "products.*.product_id": {
        notEmpty: {
          errorMessage: "Product id is required",
        },
        isString: {
          errorMessage: "Product id must be a string",
        },
        custom: {
          options: async (value) => {
            const product = await db.Product.findById(value);
            if (!product) {
              throw new Error("ProductId not found");
            }
            return true;
          },
        },
      },
      "products.*.variant_id": {
        notEmpty: {
          errorMessage: "Variant id is required",
        },
        isString: {
          errorMessage: "Variant id must be a string",
        },
        custom: {
          options: async (value) => {
            const variant = await db.ProductVariation.findById(value);
            if (!variant) {
              throw new Error("VariantId not found");
            }
            return true;
          },
        },
      },
      "products.*.quantity": {
        notEmpty: {
          errorMessage: "Quantity is required",
        },
        isNumeric: {
          errorMessage: "Quantity must be a number",
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
// exports.getFeeMiddleware = validate(
//   checkSchema(
//     {
//       fromDistrictId: {
//         isString: {
//           errorMessage: "District id must be a string",
//         },
//         notEmpty: {
//           errorMessage: "District id is required",
//         },
//       },
//       toDistrictId: {
//         isString: {
//           errorMessage: "District id must be a string",
//         },
//         notEmpty: {
//           errorMessage: "District id is required",
//         },
//       },
//       weight: {
//         isString: {
//           errorMessage: "Weight must be a string",
//         },
//         notEmpty: {
//           errorMessage: "Weight is required",
//         },
//       },
//     },
//     ["body"]
//   )
// );
