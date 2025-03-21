const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const db = require("../models");
const { config } = require("dotenv");
config();

exports.addWishListValidator = validate(
  checkSchema(
    {
      // userId: {
      //   notEmpty: {
      //     errorMessage: "User id is required",
      //   },
      //   isMongoId: {
      //     errorMessage: "User id is invalid",
      //   },
      //   custom: {
      //     options: async (value) => {
      //       const existingUser = await db.User.findById({
      //         _id: value,
      //         deletedAt: null,
      //         deletedBy: null,
      //       });
      //       if (!existingUser) {
      //         throw new Error("User id is invalid");
      //       }
      //       const { userId } = req.decoded_authorization;
      //       if (userId !== value) {
      //         throw new Error("User id is invalid");
      //       }
      //       return true;
      //     },
      //   },
      // },
      product_id: {
        notEmpty: {
          errorMessage: "Product id is required",
        },
        isMongoId: {
          errorMessage: "Product id is invalid",
        },
        custom: {
          options: async (value) => {
            const existingProduct = await db.Product.findById({
              _id: value,
              deletedAt: null,
              deletedBy: null,
            });
            if (!existingProduct) {
              throw new Error("Product id is invalid");
            }
            return true;
          },
        },
      },
      variation_id: {
        notEmpty: {
          errorMessage: "Variant id is required",
        },
        isMongoId: {
          errorMessage: "Variant id is invalid",
        },
        custom: {
          options: async (value, { req }) => {
            const existingVariant = await db.ProductVariation.findById({
              _id: value,
              product_id: req.body.product_id,
              deletedAt: null,
              deletedBy: null,
            });
            if (!existingVariant) {
              throw new Error("Variant id is invalid");
            }
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
exports.deleteWishListValidator = validate(
  checkSchema(
    {
      product_id: {
        notEmpty: {
          errorMessage: "Product id is required",
        },
        isMongoId: {
          errorMessage: "Product id is invalid",
        },
        custom: {
          options: async (value) => {
            const existingProduct = await db.Product.findById({
              _id: value,
              deletedAt: null,
              deletedBy: null,
            });
            if (!existingProduct) {
              throw new Error("Product id is invalid");
            }
            return true;
          },
        },
      },
      variation_id: {
        notEmpty: {
          errorMessage: "Variant id is required",
        },
        isMongoId: {
          errorMessage: "Variant id is invalid",
        },
        custom: {
          options: async (value, { req }) => {
            console.log(req.body.product_id, value);

            const existingVariant = await db.ProductVariation.findById({
              _id: value,
              product_id: req.body.product_id,
              deletedAt: null,
              deletedBy: null,
            });
            if (!existingVariant) {
              throw new Error("Variation id is invalid");
            }
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
