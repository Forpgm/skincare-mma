const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const db = require("../models");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");
(exports.quiz_id_schema = {
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
}),
  (exports.addQuizAnswerValidator = validate(
    checkSchema(
      {
        quiz_id: this.quiz_id_schema,
        question_id: {
          notEmpty: {
            errorMessage: "question id is required",
          },
          isMongoId: {
            errorMessage: "Invalid question id",
          },
          custom: {
            options: async (value) => {
              const quiz = await db.QuizQuestion.findById(value);
              if (!quiz) {
                throw new ErrorWithStatus({
                  message: "Quiz question not found",
                  status: HTTP_STATUS.NOT_FOUND,
                });
              }
              return true;
            },
          },
        },
        answer_text: {
          notEmpty: {
            errorMessage: "Answer is required",
          },
          trim: true,
          isString: {
            errorMessage: "Answer must be a string",
          },
        },
        score: {
          notEmpty: {
            errorMessage: "Score is required",
          },
          isNumeric: {
            errorMessage: "Score must be a number",
          },
        },
      },
      ["body"]
    )
  ));
