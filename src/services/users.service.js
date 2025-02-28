const bcrypt = require("bcryptjs");
const db = require("../models/index");
const { verifyToken, signToken } = require("../utils/jwt");
const { ObjectId } = require("mongodb");
class UsersService {
  decodeRefreshToken(refreshToken) {
    return verifyToken({
      token: refreshToken,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN,
    });
  }

  async signAccessToken({ userId }) {
    const at = await signToken({
      payload: { userId, token_type: "AcessToken" },
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

    const account = new db.Account({
      email,
      phone,
      password: hashedPassword,
      username,
      balance: 0,
    });

    const result = await account.save();
    const [access_token, refresh_token] =
      await this.signAccessTokenAndRefreshToken(result._id.toString());

    const { exp, iat } = await this.decodeRefreshToken(refresh_token);

    const refreshToken = new db.RefreshToken({
      token: refresh_token,
      user_id: new ObjectId(result._id),
      exp,
      iat,
    });
    await refreshToken.save();
    return [access_token, refresh_token];
  }

  async login(userId) {
    const [access_token, refresh_token] =
      await this.signAccessTokenAndRefreshToken(userId);
    const { exp, iat } = await this.decodeRefreshToken(refresh_token);
    const refreshToken = new db.RefreshToken({
      token: refresh_token,
      user_id: new ObjectId(userId),
      exp,
      iat,
    });
    await refreshToken.save();
    return [access_token, refresh_token];
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
}
const usersService = new UsersService();
module.exports = usersService;
