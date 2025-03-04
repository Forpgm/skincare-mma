const quizService = require("../services/quizzes.service");

exports.addQuizController = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const { userId } = req.decoded_authorization;
    const result = await quizService.addQuiz({
      userId,
      title,
      description,
      category,
    });
    res.status(201).send({
      message: "Quiz added successfully",
      result,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
