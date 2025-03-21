const mongoose = require("mongoose");
const { ROLE } = require("../constants/enum");

const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    forgot_password_token: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    avatar_url: {
      type: String,
      default:
        "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png",
    },
    username: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      default: null,
    },
    birthday: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      default: ROLE.CUSTOMER,
    },
    status: {
      type: Boolean,
      default: true,
    },
    deleted_at: {
      type: Date,
    },
    deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
