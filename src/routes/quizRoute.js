var express = require("express");
var quizRouter = express.Router();
const { accessTokenValidator } = require("../middleware/users.middleware");
const { addQuizValidator } = require("../middleware/quizMiddelware");
const { addQuizController } = require("../controller/quizzes.controllers");

quizRouter.post(
  "/add",
  accessTokenValidator,
  addQuizValidator,
  addQuizController
);
module.exports = quizRouter;
