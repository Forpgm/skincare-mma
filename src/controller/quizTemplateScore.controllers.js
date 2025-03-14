const quizTemplateScoreService = require("../services/quizTemplateScore.service");

exports.addQuizTemplateScoreController = async (req, res) => {
  try {
    const result = await quizTemplateScoreService.addQuizTemplateScore(
      req.body
    );
    res.status(201).send({
      message: "Quiz template score added successfully",
      result,
    });
  } catch (error) {
    throw error;
  }
};
exports.getQuizDetailTemplateScoresController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quizTemplateScoreService.getQuizDetailTemplateScores(
      id
    );
    res.status(200).send({
      message: "Get quiz template scores successfully",
      result,
    });
  } catch (error) {
    throw error;
  }
};
