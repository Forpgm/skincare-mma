var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const setupSwagger = require("./src/utils/swagger");

const db = require("./src/models/index");
db.connectDb().catch(console.error);

const categoryRoute = require("./src/routes/categoryRoute");
const skinRoute = require("./src/routes/skinRoute");
const brandRoute = require("./src/routes/brandRoute");
const productRoute = require("./src/routes/productRoute");
const dashboardRoute = require("./src/routes/dashboardRoute");
const managerRoute = require("./src/routes/managerRoute");
const orderRoute = require("./src/routes/orderRoute");
const customerRoute = require("./src/routes/customerRoute");
const feedbackRoute = require("./src/routes/feedbackRoute");
const { ErrorWithStatus } = require("./src/models/errors");
const { omit } = require("lodash");
const userRoute = require("./src/routes/userRoute");
const wishListRoute = require("./src/routes/wishlistRoute");
const quizRouter = require("./src/routes/quizRoute");
const quizQuestionRoute = require("./src/routes/quizQuestionRoute");
const quizAnswerRoute = require("./src/routes/quizAnswerRoute");
const quizTemplateScoreRouter = require("./src/routes/quizTemplateScoreRoute");
const searchRouter = require("./src/routes/searchRoute");
const voucherRoute = require("./src/routes/voucherRoute");


var app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("This is home page");
});

app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/skins", skinRoute);
app.use("/api/brands", brandRoute);
app.use("/api/products", productRoute);
app.use("/api/manager", managerRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/orders", orderRoute);
app.use("/api/customers", customerRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/wishList", wishListRoute);
app.use("/api/quizzes", quizRouter);
app.use("/api/quizQuestions", quizQuestionRoute);
app.use("/api/quizAnswers", quizAnswerRoute);
app.use("/api/quizTemplateScores", quizTemplateScoreRouter);
app.use("/api/search", searchRouter);
app.use("/api/vouchers", voucherRoute);
setupSwagger(app);

//const HOST_NAME = process.env.HOST_NAME;
const HOST_NAME = "0.0.0.0";
const PORT = process.env.PORT;

app.listen(PORT, HOST_NAME, () => {
  console.log(`Server is running on http://${HOST_NAME}:${PORT}`);
});

// error handler
app.use(function (err, req, res, next) {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ["status"]));
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true });
  });

  res.status(500).json({
    message: err.message,
    errorInfor: omit(err, ["stack", "statusCode", "status"]),
  });
});

module.exports = app;
