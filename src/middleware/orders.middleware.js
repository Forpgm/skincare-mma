const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");
const db = require("../models/index");
const { isString } = require("lodash");

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
exports.checkCartValidMiddleware = async (req, res, next) => {
  const cart_list = req.body.cart_list;
  // kiểm tra xem cart_list gữi lên có phải dạng mảng không
  if (!Array.isArray(cart_list)) {
    throw new ErrorWithStatus({
      message: "Cart list must be an array",
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    });
  }
  next();
};
exports.cancelOrderValidator = validate(
  checkSchema({
    order_id: {
      notEmpty: {
        errorMessage: "Order ID is required",
      },
      isMongoId: {
        errorMessage: "Order ID is invalid",
      },
      custom: {
        options: async (value, { req }) => {
          const existingOrder = await db.Order.find({
            _id: value,
            user_id: req.decoded_authorization.userId,
            status: { $ne: "CANCELLED" },
          });
          if (!existingOrder) {
            throw new ErrorWithStatus({
              message: "Order not found",
              status: HTTP_STATUS.NOT_FOUND,
            });
          }
          return true;
        },
      },
    },
    cancel_reason: {
      notEmpty: {
        errorMessage: "Cancel reason is required",
      },
    },
    isString: {
      errorMessage: "Cancel reason must be a string",
    },
  })
);
exports.getOrderValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: {
          errorMessage: "Id is required",
        },
        isMongoId: {
          errorMessage: "Id is invalid",
        },
        custom: {
          options: async (value, { req }) => {
            const existingOrder = await db.Order.findOne({
              _id: value,
              user_id: req.decoded_authorization.userId,
            });
            if (!existingOrder) {
              throw new ErrorWithStatus({
                message: "Order not found",
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            return true;
          },
        },
      },
    },
    ["params"]
  )
);
exports.getOrdersByCriteriaValidator = validate(
  checkSchema(
    {
      status: {
        optional: true,
        isString: {
          errorMessage: "Status must be a string",
        },
      },
    },
    ["query"]
  )
);
