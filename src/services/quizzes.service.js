const db = require("../models/index");

const { ObjectId } = require("mongodb");

class QuizService {
  async addQuiz({ userId, title, description, category }) {
    const quiz = await db.Quiz.create({
      user_id: new ObjectId(String(userId)),
      title,
      description,
      category,
    });
    return quiz;
  }
}
const quizService = new QuizService();
module.exports = quizService;
