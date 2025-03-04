const mongoose = require("mongoose");

const QuizAnswerSchema = mongoose.Schema(
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
    question_id: {
      type: String,
      ref: "QuizQuestion",
      required: [true, "Question id is required"],
    },
    answer_text: {
      type: String,
      required: [true, "Answer is required"],
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
    },
  },
  { timestamps: true }
);

const QuizAnswer = mongoose.model("QuizAnswer", QuizAnswerSchema);

module.exports = QuizAnswer;
