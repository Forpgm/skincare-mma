const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const { imageSchema } = require("./productMiddleware");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");
const db = require("../models/index");

exports.addQuizValidator = validate(
  checkSchema(
    {
      title: {
        notEmpty: {
          errorMessage: "Title is required",
        },
        trim: true,
        isString: true,
        errorMessage: "Title is required",
      },
      description: {
        optional: true,
        isString: {
          errorMessage: "Description should be a string",
        },
        trim: true,
      },
      category: {
        notEmpty: {
          errorMessage: "Category is required",
        },
        trim: true,
        isString: {
          errorMessage: "Category should be a string",
        },
        isIn: {
          options: [["SKINTYPE"]],
          errorMessage: "Invalid category",
        },
      },
      images: imageSchema,
    },
    ["body"]
  )
);
exports.getQuizDetailValidator = validate(
  checkSchema({
    id: {
      notEmpty: {
        errorMessage: "Quiz id is required",
      },
      custom: {
        options: async (value) => {
          const quiz = await db.Quiz.findById(value);
          if (!quiz) {
            throw new ErrorWithStatus({
              message: "Quiz not found",
              status: HTTP_STATUS.NOT_FOUND,
            });
          }
          return true;
        },
      },
    },
  }),
  ["params"]
);
