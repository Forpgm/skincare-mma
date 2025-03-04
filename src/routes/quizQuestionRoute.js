var express = require("express");
var quizQuestionRoute = express.Router();
const { accessTokenValidator } = require("../middleware/users.middleware");
const {
  addQuizQuestionValidator,
} = require("../middleware/quizQuestionMiddleware");
const {
  addQuizQuestionController,
} = require("../controller/quizQuestions.controllers");

quizQuestionRoute.post(
  "/add",
  accessTokenValidator,
  addQuizQuestionValidator,
  addQuizQuestionController
);
module.exports = quizQuestionRoute;
