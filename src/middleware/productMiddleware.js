const { checkSchema } = require("express-validator");
const db = require("../models/index");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");
const { validate } = require("../utils/validator");
const { ObjectId } = require("mongodb");
const { PRODUCTS_MESSAGES } = require("../constants/message");

const nameSchema = {
  trim: true,
  notEmpty: {
    errorMessage: "Product name is required",
  },
  isString: {
    errorMessage: "Product name must be a string",
  },
};
const imageSchema = {
  optional: true,
  isArray: {
    errorMessage: PRODUCTS_MESSAGES.IMAGES_MUST_BE_ARRAY,
  },
  custom: {
    options: (value) => {
      if (value.length === 0) {
        throw new Error(PRODUCTS_MESSAGES.IMAGES_MUST_BE_NOT_EMPTY);
      }
      if (
        !value.every((image) => {
          try {
            new URL(image);
            return true;
          } catch (error) {
            return false;
          }
        })
      ) {
        throw new Error(PRODUCTS_MESSAGES.IMAGES_MUST_BE_URL);
      }
      return true;
    },
  },
};
const priceSchema = {
  notEmpty: {
    errorMessage: "Price is required",
  },
  isNumeric: {
    errorMessage: "Price must be a number",
  },
};
const quantitySchema = {
  notEmpty: {
    errorMessage: "Price is required",
  },
  isNumeric: {
    errorMessage: "Price must be a number",
  },
};

const attributeSchema = {
  optional: true,
};
const categoryIdSchema = {
  notEmpty: {
    errorMessage: "Category id is required",
  },
  isMongoId: {
    errorMessage: "Invalid category id",
  },
  custom: {
    options: async (value) => {
      const category = await db.Category.findById({
        _id: new ObjectId(String(value)),
        deletedAt: null,
        deletedBy: null,
      });
      if (!category) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: "Category not found",
        });
      }
      return true;
    },
  },
};
const brandIdSchema = {
  notEmpty: {
    errorMessage: "Brand id is required",
  },
  isMongoId: {
    errorMessage: "Invalid brand id",
  },
  custom: {
    options: async (value) => {
      const brand = await db.Brand.findById({
        _id: new ObjectId(String(value)),
        deletedAt: null,
        deletedBy: null,
      });
      if (!brand) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: "Brand not found",
        });
      }
      return true;
    },
  },
};

const descriptionSchema = {
  optional: true,
  trim: true,
  isString: {
    errorMessage: "Description must be a string",
  },
};
const instructionSchema = {
  optional: true,
  trim: true,
  isString: {
    errorMessage: "Description must be a string",
  },
};
const originSchema = {
  notEmpty: {
    errorMessage: "Origin is required",
  },
  isString: {
    errorMessage: "Origin must be a string",
  },
};
exports.getProductDetailValidator = validate(
  checkSchema(
    {
      id: {
        isMongoId: {
          errorMessage: PRODUCTS_MESSAGES.INVALID_PRODUCT_ID,
        },
        custom: {
          options: async (value) => {
            const product = await db.Product.findById({
              _id: new ObjectId(String(value)),
              deletedAt: null,
              deletedBy: null,
            });
            if (!product) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
              });
            }
          },
        },
      },
    },
    ["params"]
  )
);
exports.addProductValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      category_id: categoryIdSchema,
      brand_id: brandIdSchema,
      description: descriptionSchema,
      instruction: instructionSchema,
      origin: originSchema,
      images: imageSchema,
      variations: {
        notEmpty: {
          errorMessage: "Product variations are required",
        },
        isArray: { errorMessage: "Variations must be an array!" },
      },
      "variations.*.price": {
        isNumeric: { errorMessage: "Price must be a number!" },
        notEmpty: { errorMessage: "Price is required!" },
      },
      "variations.*.quantity": {
        isNumeric: { errorMessage: "Quantity must be a number!" },
        notEmpty: { errorMessage: "Quantity is required!" },
      },
      "variations.*.images": {
        optional: true,
        isArray: { errorMessage: "Images must be an array!" },
        custom: {
          options: (value) => {
            if (value.length === 0) {
              throw new Error("Images must be not empty!");
            }
            if (
              !value.every((image) => {
                try {
                  new URL(image);
                  return true;
                } catch (error) {
                  return false;
                }
              })
            ) {
              throw new Error("Each image must be a valid URL!");
            }
            return true;
          },
        },
      },
      "variations.*.attributes": {
        custom: {
          options: (value) => {
            if (typeof value !== "object")
              throw new Error("Attributes must be an object!");
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
exports.getProductByCriteriaValidator = validate(
  checkSchema(
    {
      category_id: {
        optional: true,
        isMongoId: {
          errorMessage: "Invalid product id",
        },
        custom: {
          options: async (value) => {
            const product = await db.Category.findById({
              _id: new ObjectId(String(value)),
              deletedAt: null,
              deletedBy: null,
            });
            if (!product) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: "Product not found",
              });
            }
            return true;
          },
        },
      },
      variation_id: {
        optional: true,
        isMongoId: {
          errorMessage: "Invalid product id",
        },
        custom: {
          options: async (value) => {
            const productVariation = await db.ProductVariation.findById({
              _id: new ObjectId(String(value)),
              deletedAt: null,
              deletedBy: null,
            });
            if (!productVariation) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: "Product not found",
              });
            }
            return true;
          },
        },
      },
    },

    ["query"]
  )
);
exports.updateProductValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: {
          errorMessage: "Product id is required",
        },
        isMongoId: {
          errorMessage: "Invalid product id",
        },
        custom: {
          options: async (value) => {
            const product = await db.Product.findById({
              _id: new ObjectId(String(value)),
              deletedAt: null,
              deletedBy: null,
            });
            if (!product) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
              });
            }
            return true;
          },
        },
      },
      name: {
        ...nameSchema,
        optional: true,
      },
      description: {
        ...descriptionSchema,
        optional: true,
      },
      instruction: {
        ...instructionSchema,
        optional: true,
      },
      origin: {
        ...originSchema,
        optional: true,
      },
      images: {
        ...imageSchema,
        optional: true,
      },
      variations: {
        optional: true,
        isArray: { errorMessage: "Variations must be an array!" },
      },
      "variations.*.price": {
        optional: true,
        isNumeric: { errorMessage: "Price must be a number!" },
        // notEmpty: { errorMessage: "Price is required!" },
      },
      "variations.*.quantity": {
        optional: true,
        isNumeric: { errorMessage: "Quantity must be a number!" },
        // notEmpty: { errorMessage: "Quantity is required!" },
      },
      "variations.*.images": {
        optional: true,
        isArray: { errorMessage: "Images must be an array!" },
        custom: {
          options: (value) => {
            if (value.length === 0) {
              throw new Error("Images must be not empty!");
            }
            if (
              !value.every((image) => {
                try {
                  new URL(image);
                  return true;
                } catch (error) {
                  return false;
                }
              })
            ) {
              throw new Error("Each image must be a valid URL!");
            }
            return true;
          },
        },
      },
      "variations.*.attributes": {
        custom: {
          options: (value) => {
            if (typeof value !== "object")
              throw new Error("Attributes must be an object!");
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
