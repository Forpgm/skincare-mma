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
