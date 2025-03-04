const db = require("../models");

class QuizQuestionService {
  async addQuizQuestion({ userId, quiz_id, question_text }) {
    const quizQuestion = await db.QuizQuestion.create({
      quiz_id,
      user_id: userId,
      question_text,
    });
    return quizQuestion;
  }
}
const quizQuestionService = new QuizQuestionService();
module.exports = quizQuestionService;
