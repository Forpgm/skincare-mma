const { Router } = require("express");
const Chat = require("../models/chat.model");
const db = require("../models/index");
const chatRouter = Router();

chatRouter.post("/", async (req, res) => {
  const { senderId, receiverId, senderRole, content } = req.body;

  if (!senderId || !receiverId || !content || !senderRole) {
    return res.status(400).json({ message: "Thiếu thông tin gửi tin nhắn" });
  }

  try {
    const message = new Chat({ senderId, receiverId, senderRole, content });
    await message.save();
    res.status(201).json({ message: "Gửi thành công", data: message });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

chatRouter.get("/:userId/:adminId", async (req, res) => {
  const { userId, adminId } = req.params;

  try {
    const messages = await await db.Chat.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res
      .status(200)
      .json({ message: "Lấy tin nhắn thành công", data: messages });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = chatRouter;
