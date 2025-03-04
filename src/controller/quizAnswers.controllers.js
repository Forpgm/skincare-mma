const quizAnswerService = require("../services/quizAnswers.service");

exports.addQuizAnswerController = async (req, res, next) => {
  try {
    const { quiz_id, question_id, answer_text, score } = req.body;
    const { userId } = req.decoded_authorization;
    const result = await quizAnswerService.addQuizAnswer({
      quiz_id,
      userId,
      question_id,
      answer_text,
      score,
    });

    res.status(200).json({
      message: "Quiz answer added successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
