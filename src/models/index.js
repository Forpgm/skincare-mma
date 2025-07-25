const mongoose = require("mongoose");

const Account = require("./account.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Skin = require("./skin.model");
const Brand = require("./brand.model");
const Order = require("./order.model");
const Feedback = require("./feedback.model");
const RefreshToken = require("./refreshToken.model");
const Image = require("./image.model");
const ProductVariation = require("./productVariation.model");
const WishList = require("./wishlist.model");
const Quiz = require("./quiz.model");
const QuizQuestion = require("./quizQuestion.model");
const QuizAnswer = require("./quizAnswer.model");
const QuizTemplateScore = require("./quizTemplateScore.model");
const QuizResult = require("./quizResult.model");
const OrderDetail = require("./orderDetail.model");

const Voucher = require("./voucher.model");

const Address = require("./address.model");
const Transaction = require("./transaction.model");
const Chat = require("./chat.model");

const db = {};

db.Account = Account;
db.Category = Category;
db.Product = Product;
db.Skin = Skin;
db.Brand = Brand;
db.Order = Order;
db.Feedback = Feedback;
db.RefreshToken = RefreshToken;
db.Image = Image;
db.ProductVariation = ProductVariation;
db.WishList = WishList;
db.Quiz = Quiz;
db.QuizQuestion = QuizQuestion;
db.QuizAnswer = QuizAnswer;
db.QuizTemplateScore = QuizTemplateScore;
db.QuizResult = QuizResult;
db.Order = Order;
db.OrderDetail = OrderDetail;
db.Transaction = Transaction;

db.Voucher = Voucher;
db.Address = Address;
db.Chat = Chat;

db.connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("Database connection successful!!!");
    });
  } catch (error) {
    next(error);
  }
};

module.exports = db;
