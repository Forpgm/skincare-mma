const mongoose = require("mongoose");
const QuizSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "User id is required"],
    },
    title: {
      type: String,
      required: [true, "title is required!!!"],
    },
    description: {
      type: String,
      required: [true, "Description is required!!!"],
    },
    category: {
      type: String,
      required: [true, "Category is required!!!"],
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
