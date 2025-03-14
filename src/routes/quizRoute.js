var express = require("express");
var quizRouter = express.Router();
const { accessTokenValidator } = require("../middleware/users.middleware");
const {
  addQuizValidator,
  getQuizDetailValidator,
} = require("../middleware/quizMiddelware.js");
const {
  addQuizController,
  getAllQuizzesController,
  getQuizDetailController,
} = require("../controller/quizzes.controllers.js");

quizRouter.post(
  "/add",
  accessTokenValidator,
  addQuizValidator,
  addQuizController
);

quizRouter.get("/all", getAllQuizzesController);
quizRouter.get("/:id", getQuizDetailValidator, getQuizDetailController);
module.exports = quizRouter;
