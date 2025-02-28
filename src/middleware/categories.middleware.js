const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const db = require("../models");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");
const { CATEGORY_STATUS } = require("../constants/enum");
const { CATEGORIES_MESSAGES } = require("../constants/message");
const { ObjectId } = require("mongodb");

const categoryIdShema = {
  trim: true,
  notEmpty: {
    errorMessage: "Category id is required",
  },
  isMongoId: {
    errorMessage: "Category id is invalid",
  },
  custom: {
    options: async (value) => {
      const existingCategoryId = await db.Category.findOne({
        _id: new ObjectId(String(value)),
        deleteBy: { $exists: false },
      });
      if (!existingCategoryId) {
        throw new ErrorWithStatus({
          message: "Category id is not found",
          status: HTTP_STATUS.NOT_FOUND,
        });
      }
      return true;
    },
  },
};

exports.addCategoryValidator = validate(
  checkSchema(
    {
      parent_category_id: {
        ...categoryIdShema,
        optional: true,
      },
      name: {
        trim: true,
        notEmpty: {
          errorMessage: "Category name is required",
        },
        custom: {
          options: (value) => {
            if (typeof value !== "string" || /^\d+$/.test(value)) {
              throw new error(
                CATEGORIES_MESSAGES.CATEGORY_NAME_MUST_BE_A_STRING
              );
            }
            return true;
          },
        },
      },
      status: {
        optional: true,
        in: [CATEGORY_STATUS.ACTIVE, CATEGORY_STATUS.INACTIVE],
        errorMessage: CATEGORY_STATUS.STATUS_MUST_BE_ACTIVE_OR_INACTIVE,
      },
    },
    ["body"]
  )
);
exports.updateCategoryValidator = validate(
  checkSchema(
    {
      category_id: categoryIdShema,
      name: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: "Name must be a string",
        },
        custom: {
          options: (value) => {
            if (typeof value !== "string" || /^\d+$/.test(value)) {
              throw new error(
                CATEGORIES_MESSAGES.CATEGORY_NAME_MUST_BE_A_STRING
              );
            }
            return true;
          },
        },
      },
      status: {
        optional: true,
        in: [CATEGORY_STATUS.ACTIVE, CATEGORY_STATUS.INACTIVE],
        errorMessage: CATEGORY_STATUS.STATUS_MUST_BE_ACTIVE_OR_INACTIVE,
      },
    },
    ["body"]
  )
);
exports.deleteCategoryValidator = validate(
  checkSchema(
    {
      category_id: categoryIdShema,
    },
    ["body"]
  )
);
exports.getSubCategoryValidator = validate(
  checkSchema(
    {
      parent_category_id: categoryIdShema,
    },
    ["query"]
  )
);
