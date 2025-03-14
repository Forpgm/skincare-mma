const quizService = require("../services/quizzes.service");

exports.addQuizController = async (req, res) => {
  try {
    const { title, description, category, images } = req.body;
    const { userId } = req.decoded_authorization;
    const result = await quizService.addQuiz({
      userId,
      title,
      description,
      category,
      images,
    });
    res.status(201).send({
      message: "Quiz added successfully",
      result,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.getAllQuizzesController = async (req, res) => {
  try {
    const result = await quizService.getAllQuizzes();
    res.status(200).send({
      message: "Get all quizzes successfully",
      result,
    });
  } catch (error) {
    throw error;
  }
};
exports.getQuizDetailController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quizService.getQuizDetail(id);
    res.status(200).send({
      message: "Get quiz detail successfully",
      result,
    });
  } catch (error) {
    throw error;
  }
};
