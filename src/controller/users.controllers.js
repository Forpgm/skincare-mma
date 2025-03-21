const { USERS_MESSAGES } = require("../constants/message");
const usersService = require("../services/users.service");
const {
  sendSuccessRegisterMail,
  sendForgotPasswordMail,
} = require("../utils/email");

exports.registerController = async (req, res, next) => {
  try {
    const [access_token, refresh_token, user] = await usersService.register(
      req.body
    );
    sendSuccessRegisterMail(req.body.email);
    res.status(200).send({
      message: USERS_MESSAGES.REGISTRATION_SUCCESS,
      result: {
        access_token,
        refresh_token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.loginController = async (req, res, next) => {
  try {
    const { user: account } = req;
    const [access_token, refresh_token, user] = await usersService.login(
      account._id.toString()
    );
    res.status(200).send({
      message: USERS_MESSAGES.LOGIN_SUCCESS,
      result: {
        access_token,
        refresh_token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshTokenController = async (req, res, next) => {
  try {
    const { userId, exp, iat } = req.decoded_refresh_token;

    const [access_token, refresh_token] = await usersService.refreshToken(
      req.body.refresh_token,
      userId,
      exp,
      iat
    );
    res.status(200).send({
      message: USERS_MESSAGES.ACCESS_TOKEN_SUCCESS,
      result: {
        access_token,
        refresh_token,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { user } = req;
    const forgot_password_token = await usersService.forgotPassword(user._id);
    sendForgotPasswordMail(email, forgot_password_token);
    res.status(200).send({
      message: USERS_MESSAGES.CHECK_YOUR_EMAIL_TO_RESET_PASSWORD,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyforgotPasswordController = async (req, res, next) => {
  res.status(200).send({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS,
  });
};

exports.resetPasswordController = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { userId } = req.decoded_forgot_password_token;
    await usersService.resetPassword(userId, newPassword);
    res.status(200).send({
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};
exports.getMeController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await usersService.getMe(userId);
    res.status(200).send({
      message: "Get me successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateMeController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await usersService.updateMe(userId, req.body);
    res.status(200).send({
      message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.logoutController = async (req, res, next) => {
  try {
    const refresh_token = req.body.refresh_token;
    await usersService.logout(refresh_token);
    res.status(200).send({
      message: "Logout successfully",
    });
  } catch (error) {
    next(error);
  }
};
exports.changePasswordController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await usersService.changePassword(userId, req.body);
    res.status(200).send({
      message: "Change password successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
