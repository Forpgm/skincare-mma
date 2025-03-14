const { log } = require("handlebars");
const { IMAGE_TYPE } = require("../constants/enum");
const db = require("../models/index");
const { ObjectId } = require("mongodb");

class QuizService {
  async addQuiz({ userId, title, description, category, images }) {
    const quiz = await db.Quiz.create({
      user_id: new ObjectId(String(userId)),
      title,
      description,
      category,
    });
    const thumbnails = [];
    if (images && images.length > 0) {
      const imgs = await Promise.all(
        images.map(async (image) => {
          const thumbnail = await db.Image.create({
            image_url: image,
            parent_id: quiz._id,
            type: IMAGE_TYPE.QUIZ,
          });
          return thumbnail;
        })
      );
      thumbnails.push(...imgs);
    }

    return { ...quiz._doc, thumbnails };
  }
  async getAllQuizzes() {
    const quizzes = await db.Quiz.find({ deletedAt: null }).populate(
      "category"
    );
    const quizQuestion = await db.QuizQuestion.find({
      quiz_id: { $in: quizzes.map((quiz) => quiz._id) },
    }).select("quiz_id question_id question_text");
    const quizAnswer = await db.QuizAnswer.find({
      quiz_id: { $in: quizzes.map((quiz) => quiz._id) },
    }).select("quiz_id answer_id question_id answer_text");

    const thumbnails = await db.Image.find({
      parent_id: { $in: quizzes.map((quiz) => quiz._id) },
      type: IMAGE_TYPE.QUIZ,
    }).select("image_url parent_id");
    return quizzes.map((quiz) => {
      const images = thumbnails.find(
        (thumb) => thumb.parent_id.toString() === quiz._id.toString()
      );
      const quizQuestions = quizQuestion.filter(
        (question) => question.quiz_id.toString() === quiz._id.toString()
      );
      const quizAnswers = quizAnswer.filter(
        (answer) => answer.quiz_id.toString() === quiz._id.toString()
      );

      return {
        ...quiz._doc,
        images: images ? images.image_url : [],
        quizQuestions,
        quizAnswers,
      };
    });
  }
  async getQuizDetail(id) {
    const quiz = await db.Quiz.findById(id).select(
      "title description category"
    );
    console.log(quiz);

    const thumbnails = await db.Image.find({
      parent_id: quiz._id,
      type: IMAGE_TYPE.QUIZ,
    }).select("image_url parent_id");
    const quizQuestions = await db.QuizQuestion.find({
      quiz_id: quiz._id,
    }).select("_id question_text");

    const quizAnswers = await db.QuizAnswer.find({
      quiz_id: quiz._id,
    }).select("_id question_id answer_text score");

    return {
      ...quiz._doc,
      images: thumbnails.map((thumb) => thumb.image_url),
      questions: quizQuestions.map((question) => {
        const answer = quizAnswers.filter(
          (ans) => ans.question_id.toString() === question._id.toString()
        );

        return {
          ...question._doc,
          answers: answer.map((ans) => {
            return ans;
          }),
        };
      }),
    };
  }
}
const quizService = new QuizService();
module.exports = quizService;
