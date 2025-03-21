const bcrypt = require("bcryptjs");
const db = require("../models/index");
const { verifyToken, signToken } = require("../utils/jwt");
const { ObjectId } = require("mongodb");
const { hashPassword } = require("../utils/crypto");
class UsersService {
  decodeRefreshToken(refreshToken) {
    return verifyToken({
      token: refreshToken,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN,
    });
  }

  async signAccessToken({ userId }) {
    console.log(process.env.JWT_SECRET_ACCESS_TOKEN);

    const at = await signToken({
      payload: { userId, token_type: "AccessToken" },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN,
    });
    return at;
  }

  async signRefreshToken({ userId, exp }) {
    if (exp) {
      const rt = await signToken({
        payload: { userId, token_type: "RefreshToken", exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
      });

      return rt;
    } else {
      const rt = await signToken({
        payload: { userId, token_type: "RefreshToken" },
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
      });

      return rt;
    }
  }

  async signEmailVerifyToken(user_id) {
    return signToken({
      payload: { user_id, token_type: "EmailVerificationToken" },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
    });
  }

  async signForgotPasswordToken(userId) {
    return signToken({
      payload: { userId, token_type: "ForgotPasswordToken" },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
    });
  }

  async signAccessTokenAndRefreshToken(userId) {
    return Promise.all([
      this.signAccessToken({ userId }),
      this.signRefreshToken({ userId }),
    ]);
  }

  async register(payload) {
    const { email, phone, password, username } = payload;
    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await db.Account.create({
      email,
      phone,
      password: hashedPassword,
      username,
    });
    const user = await db.Account.findOne({ _id: account._id }).select(
      "email phone username role avatar_url birthday gender"
    );
    const [access_token, refresh_token] =
      await this.signAccessTokenAndRefreshToken(account._id.toString());

    const { exp, iat } = await this.decodeRefreshToken(refresh_token);

    const refreshToken = new db.RefreshToken({
      token: refresh_token,
      user_id: new ObjectId(account._id),
      exp,
      iat,
    });
    await refreshToken.save();
    return [access_token, refresh_token, user];
  }

  async login(userId) {
    const [access_token, refresh_token] =
      await this.signAccessTokenAndRefreshToken(userId);
    const { exp, iat } = await this.decodeRefreshToken(refresh_token);
    const refreshToken = new db.RefreshToken({
      token: refresh_token,
      user_id: new ObjectId(String(userId)),
      exp,
      iat,
    });
    const user = await db.Account.findOne({ _id: userId }).select(
      "email phone username role avatar_url birthday gender"
    );
    await refreshToken.save();
    return [access_token, refresh_token, user];
  }

  async refreshToken(refresh_token, user_id, exp, iat) {
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ userId: user_id }),
      this.signRefreshToken({ userId: user_id, exp }),
    ]);

    await db.RefreshToken.findOneAndUpdate(
      { token: refresh_token },
      { token: new_refresh_token, exp, iat }
    );
    return [access_token, new_refresh_token];
  }

  async forgotPassword(user_id) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id);
    const result = await db.Account.updateOne(
      { _id: user_id },
      { forgot_password_token },
      { new: true }
    );
    return forgot_password_token;
  }

  async resetPassword(user_id, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.Account.updateOne(
      { _id: new ObjectId(String(user_id)) },
      { password: hashedPassword, forgot_password_token: "" }
    );
  }

  async getMe(userId) {
    return db.Account.findOne({ _id: userId }).select(
      "email phone username role avatar_url gender birthday"
    );
  }

  async updateMe(userId, payload) {
    const { username, phone, birthday, gender, avatar_url } = payload;
    return db.Account.findOneAndUpdate(
      { _id: userId },
      { username, phone, birthday, gender, avatar_url },
      { new: true }
    ).select("email phone username role avatar_url gender birthday");
  }
  async logout(refresh_token) {
    return await db.RefreshToken.deleteOne({ token: refresh_token });
  }
  async changePassword(userId, payload) {
    const { password } = payload;

    const hashedPassword = await hashPassword(password);
    await db.Account.updateOne(
      { _id: userId },
      { password: hashedPassword },
      { new: true }
    );
    return await db.Account.findOne({ _id: userId }).select(
      "email phone username role avatar_url birthday"
    );
  }
}
const usersService = new UsersService();
module.exports = usersService;
