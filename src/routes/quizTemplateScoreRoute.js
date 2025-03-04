var express = require("express");
var quizTemplateScoreRouter = express.Router();
const { accessTokenValidator } = require("../middleware/users.middleware");
const {
  addQuizTemplateScoreController,
} = require("../controller/quizTemplateScore.controllers");
const {
  addQuizTemplateScoreValidator,
} = require("../middleware/quizTemplateScoreMiddleware");

quizTemplateScoreRouter.post(
  "/add",
  accessTokenValidator,
  addQuizTemplateScoreValidator,
  addQuizTemplateScoreController
);
module.exports = quizTemplateScoreRouter;
