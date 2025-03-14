const db = require("../models");

class QuizTemplateScoreService {
  async addQuizTemplateScore(payload) {
    const result = await db.QuizTemplateScore.create({
      min_score: payload.min_score,
      max_score: payload.max_score,
      result: payload.result,
      quiz_id: payload.quiz_id,
    });
    return result;
  }
  async getQuizDetailTemplateScores(quiz_id) {
    const result = await db.QuizTemplateScore.find({ quiz_id }).select(
      "min_score max_score result quiz_id"
    );

    return result;
  }
}
const quizTemplateScoreService = new QuizTemplateScoreService();
module.exports = quizTemplateScoreService;
