const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const { quiz_id_schema } = require("./quizAnswerMiddleware");
exports.addQuizTemplateScoreValidator = validate(
  checkSchema(
    {
      quiz_id: quiz_id_schema,
      min_score: {
        notEmpty: {
          errorMessage: "Min score is required",
        },
        isNumeric: {
          errorMessage: "Min score must be a number",
        },
        custom: {
          options: (value, { req }) => {
            if (value < 0 || value > req.body.max_score) {
              throw new Error(
                "Min score must be greater than 0 and less than max score"
              );
            }
            return true;
          },
        },
      },
      max_score: {
        notEmpty: {
          errorMessage: "Max score is required",
        },
        isNumeric: {
          errorMessage: "Max score must be a number",
        },
        custom: {
          options: (value, { req }) => {
            if (value < req.body.min_score) {
              throw new Error("Max score must be greater than min score");
            }
            return true;
          },
        },
      },
      result: {
        notEmpty: {
          errorMessage: "Result is required",
        },
        custom: {
          options: (value) => {
            if (typeof value !== "object") {
              throw new Error("Result must be an object");
            }
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
