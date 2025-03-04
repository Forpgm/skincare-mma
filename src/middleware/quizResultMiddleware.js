const { checkSchema } = require("express-validator");
const { quiz_id_schema } = require("./quizAnswerMiddleware");
const { validate } = require("../utils/validator");

exports.addQuizResultValidator = validate(
  checkSchema(
    {
      quiz_id: quiz_id_schema,
      result: {
        notEmpty: {
          errorMessage: "Result is required",
        },

        custom: {
          options: async (value) => {
            const quizResult = await db.QuizResult.findById(value);
            if (!quizResult) {
              throw new ErrorWithStatus({
                message: "Quiz result not found",
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
