const express = require("express");

const quizAnswerRoute = express.Router();
const { accessTokenValidator } = require("../middleware/users.middleware");
const {
  addQuizAnswerValidator,
} = require("../middleware/quizAnswerMiddleware");
const {
  addQuizAnswerController,
} = require("../controller/quizAnswers.controllers");
quizAnswerRoute.post(
  "/add",
  accessTokenValidator,
  addQuizAnswerValidator,
  addQuizAnswerController
);
module.exports = quizAnswerRoute;
