const mongoose = require("mongoose");

const QuizTemplateScoreSchema = mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz id is required"],
    },
    min_score: {
      type: Number,
      required: [true, "Min score is required"],
    },
    max_score: {
      type: Number,
      required: [true, "Max score is required"],
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Result is required"],
    },
  },
  { timestamps: true }
);

const QuizTemplateScore = mongoose.model(
  "QuizTemplateScore",
  QuizTemplateScoreSchema
);

module.exports = QuizTemplateScore;
