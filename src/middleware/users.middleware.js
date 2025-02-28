const { comparePassword, hashPassword } = require("../utils/crypto");
const { USERS_MESSAGES } = require("../constants/message");
const db = require("../models/index");
const { ErrorWithStatus } = require("../models/errors");
const { HTTP_STATUS } = require("../constants/httpStatus");
const { verifyToken } = require("../utils/jwt");
const { capitalize } = require("lodash");
const { JsonWebTokenError } = require("jsonwebtoken");
const { config } = require("dotenv");
const checkSchema = require("express-validator").checkSchema;
const validate = require("../utils/validator").validate;
const { ObjectId } = require("mongodb");
const { ROLE } = require("../constants/enum");

config();

const emailSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED,
  },
  trim: true,
  isEmail: {
    errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID,
  },
  custom: {
    options: async (value) => {
      const isExistEmail = await db.Account.findOne({ email: value });

      if (isExistEmail) {
        throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      return true;
    },
  },
};
const passwordSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED,
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING,
  },
  isLength: {
    options: {
      min: 6,
      max: 50,
    },
  },
  errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
};
const usernameSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.USERNAME_IS_REQUIRED,
  },
  isString: {
    errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING,
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100,
    },
    errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_100,
  },
  custom: {
    options: async (value) => {
      const isExistUsername = await db.Account.findOne({
        username: value,
      });
      if (isExistUsername) {
        throw new Error("Username has already existed");
      }
      return true;
    },
  },
};
const phoneSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PHONE_IS_REQUIRED,
  },
  isMobilePhone: {
    options: ["vi-VN"],
    errorMessage: USERS_MESSAGES.PHONE_IS_INVALID,
  },
};
const confirmPasswordSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED,
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING,
  },
  isLength: {
    options: {
      min: 6,
      max: 50,
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error(
          USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD
        );
      }
      return true;
    },
  },
};

exports.registerValidator = validate(
  checkSchema(
    {
      email: emailSchema,
      password: passwordSchema,
      username: usernameSchema,
      phone: phoneSchema,
    },
    ["body"]
  )
);

exports.loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED,
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID,
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const hashedPassword = await hashPassword(req.body.password);
            const user = await db.Account.findOne({
              email: value,
            });
            const isPasswordMatch = await comparePassword(
              req.body.password,
              hashedPassword
            );
            if (!user || !isPasswordMatch) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }
            const isPasswordCorrect = await comparePassword(
              req.body.password,
              user.password
            );

            if (!isPasswordCorrect) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }
            console.log(isPasswordCorrect);

            req.user = user;
            return true;
          },
        },
      },
      password: passwordSchema,
    },
    ["body"]
  )
);

exports.accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(" ")[1];
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublickey: process.env.JWT_SECRET_ACCESS_TOKEN,
              });
              req.decoded_authorization = decoded_authorization;
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize(error.message),
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
    },
    ["headers"]
  )
);

exports.refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            try {
              const [decoded_refresh_token, refreshToken] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN,
                }),
                db.RefreshToken.findOne({ token: value }),
              ]);

              if (refreshToken === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED,
                });
              }
              req.decoded_refresh_token = decoded_refresh_token;
            } catch (error) {
              // if (error instanceof JsonWebTokenError) {
              //   throw new ErrorWithStatus({
              //     message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
              //     status: HTTP_STATUS.UNAUTHORIZED,
              //   });
              // }
              // throw error;
              throw new ErrorWithStatus({
                message: error,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
    },
    ["body"]
  )
);

exports.forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED,
        },
        trim: true,
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID,
        },
        custom: {
          options: async (value, { req }) => {
            const user = await db.Account.findOne({ email: value });
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_NOT_EXIST,
                status: HTTP_STATUS.NOT_FOUND,
              });
            }
            req.user = user;
            return true;
          },
        },
      },
    },
    ["body"]
  )
);

exports.verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
        },
        custom: {
          options: async (value, { req }) => {
            try {
              console.log(123);

              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
              });
              const { userId } = decoded_forgot_password_token;
              const existingUser = await db.Account.findById(userId);
              if (!existingUser) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_EXIST,
                  status: HTTP_STATUS.NOT_FOUND,
                });
              }
              if (existingUser.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
                  status: HTTP_STATUS.UNAUTHORIZED,
                });
              }
              req.decoded_forgot_password_token = decoded_forgot_password_token;
              return true;
            } catch (error) {
              throw new ErrorWithStatus({
                message: error.message,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
          },
        },
      },
    },
    ["body"]
  )
);

exports.resetPasswordValidator = validate(
  checkSchema(
    {
      newPassword: passwordSchema,
      confirmPassword: confirmPasswordSchema,
    },
    ["body"]
  )
);
exports.roleValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(" ")[1];

            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED,
              });
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN,
              });

              const { userId } = decoded_authorization;

              const user = await db.Account.findById(
                new ObjectId(String(userId))
              );

              if (!user) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED,
                });
              }

              if (user.role === ROLE.CUSTOMER) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_IS_NOT_AUTHORIZED,
                  status: HTTP_STATUS.UNAUTHORIZED,
                });
              }
              req.decoded_authorization = decoded_authorization;
              req.role = user.role;
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: HTTP_STATUS.UNAUTHORIZED,
                });
              }
              throw error;
            }
            return true;
          },
        },
      },
    },
    ["headers"]
  )
);
