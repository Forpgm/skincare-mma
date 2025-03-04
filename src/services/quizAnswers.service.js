const db = require("../models/index");

class QuizAnswerService {
  async addQuizAnswer({ quiz_id, userId, question_id, answer_text, score }) {
    const quizAnswer = await db.QuizAnswer.create({
      quiz_id,
      user_id: userId,
      question_id,
      answer_text,
      score,
    });
    return quizAnswer;
  }
}
const quizAnswerService = new QuizAnswerService();
module.exports = quizAnswerService;
