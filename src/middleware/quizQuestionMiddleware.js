const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const db = require("../models/index");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");

exports.addQuizQuestionValidator = validate(
  checkSchema(
    {
      quiz_id: {
        notEmpty: {
          errorMessage: "Quiz id is required",
        },
        isMongoId: {
          errorMessage: "Invalid quiz id",
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
      question_text: {
        notEmpty: {
          errorMessage: "Question text is required",
        },
        isString: {
          errorMessage: "Question text must be a string",
        },
      },
    },
    ["body"]
  )
);
