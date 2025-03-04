const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");

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
    },
    ["body"]
  )
);
