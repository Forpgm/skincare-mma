const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
    },
    user_id: {
      type: ObjectId,
      required: [true, "User ID is required"],
    },
    exp: {
      type: Date,
      required: [true, "Exp is required"],
    },
    iat: {
      type: Date,
      required: [true, "Iat is required"],
    },
  },
  { timestamps: true }
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
