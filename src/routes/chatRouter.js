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

const mongoose = require("mongoose");

chatRouter.get("/:userId/:adminId", async (req, res) => {
  const { userId, adminId } = req.params;

  try {
    // Ép kiểu ObjectId cho đúng với dữ liệu MongoDB
    const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
    const adminObjectId = mongoose.Types.ObjectId.createFromHexString(adminId);

    const messages = await Chat.find({
      $or: [
        { senderId: userObjectId, receiverId: adminObjectId },
        { senderId: adminObjectId, receiverId: userObjectId },
      ],
    }).sort({ createdAt: 1 });

    // Lấy thông tin người dùng
    const [user, admin] = await Promise.all([
      db.Account.findById(userId).select("username avatar_url"),
      db.Account.findById(adminId).select("username avatar_url"),
    ]);

    if (!user || !admin) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy user hoặc admin" });
    }

    const data = messages.map((msg) => {
      const sender =
        msg.senderId.toString() === userId
          ? {
              _id: user._id,
              username: user.username,
              avatar_url: user.avatar_url,
            }
          : {
              _id: admin._id,
              username: admin.username,
              avatar_url: admin.avatar_url,
            };

      const receiver =
        msg.receiverId.toString() === userId
          ? {
              _id: user._id,
              username: user.username,
              avatar_url: user.avatar_url,
            }
          : {
              _id: admin._id,
              username: admin.username,
              avatar_url: admin.avatar_url,
            };

      return {
        _id: msg._id,
        content: msg.content,
        createdAt: msg.createdAt,
        sender,
        receiver,
      };
    });

    res.status(200).json({ message: "Lấy tin nhắn thành công", data });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = chatRouter;
