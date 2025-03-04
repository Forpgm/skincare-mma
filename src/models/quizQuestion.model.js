const mongoose = require("mongoose");

const QuizQuestionSchema = mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz id is required"],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "User id is required"],
    },
    question_text: {
      type: String,
      required: [true, "Question text is required"],
    },
  },
  { timestamps: true }
);

const QuizQuestion = mongoose.model("QuizQuestion", QuizQuestionSchema);

module.exports = QuizQuestion;
