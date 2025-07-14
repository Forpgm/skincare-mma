require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

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
const userRoute = require("./src/routes/userRoute");
const wishListRoute = require("./src/routes/wishlistRoute");
const quizRouter = require("./src/routes/quizRoute");
const quizQuestionRoute = require("./src/routes/quizQuestionRoute");
const quizAnswerRoute = require("./src/routes/quizAnswerRoute");
const quizTemplateScoreRouter = require("./src/routes/quizTemplateScoreRoute");
const searchRouter = require("./src/routes/searchRoute");
const voucherRoute = require("./src/routes/voucherRoute");
const ghnRoutes = require("./src/routes/ghnRoutes");
const { payRouter } = require("./src/routes/paymentRoute");
const shipRouter = require("./src/routes/shipRoute");
const { addressRouter } = require("./src/routes/addressRoute");
const chatRouter = require("./src/routes/chatRouter");

const { ErrorWithStatus } = require("./src/models/errors");
const { omit } = require("lodash");
const Chat = require("./src/models/chat.model");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, content, senderRole } = data;
    if (!senderId || !receiverId || !content) return;

    try {
      const newMessage = new Chat({
        senderId,
        receiverId,
        content,
        senderRole,
      });
      await newMessage.save();

      io.emit("receiveMessage", newMessage);
    } catch (err) {
      console.error(" Lỗi gửi tin nhắn:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "jade");

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
app.use("/api/payment", payRouter);
app.use("/api/ship", shipRouter);
app.use("/api/customers", customerRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/wishList", wishListRoute);
app.use("/api/quizzes", quizRouter);
app.use("/api/quizQuestions", quizQuestionRoute);
app.use("/api/quizAnswers", quizAnswerRoute);
app.use("/api/quizTemplateScores", quizTemplateScoreRouter);
app.use("/api/search", searchRouter);
app.use("/api/vouchers", voucherRoute);
app.use("/api/ghn", ghnRoutes);
app.use("/api/address", addressRouter);
app.use("/api/chat", chatRouter);

// Swagger
setupSwagger(app);

// Error handling
app.use((err, req, res, next) => {
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

const HOST_NAME = "0.0.0.0";
const PORT = process.env.PORT || 3000;
server.listen(PORT, HOST_NAME, () => {
  console.log(`Server is running on http://${HOST_NAME}:${PORT}`);
});

module.exports = app;
