const quizQuestionService = require("../services/quizQuestions.service");

exports.addQuizQuestionController = async (req, res, next) => {
  try {
    const { quiz_id, question_text } = req.body;
    const { userId } = req.decoded_authorization;
    const quizQuestion = await quizQuestionService.addQuizQuestion({
      userId,
      quiz_id,
      question_text,
    });
    res.status(200).json(quizQuestion);
  } catch (error) {
    next(error);
  }
};
