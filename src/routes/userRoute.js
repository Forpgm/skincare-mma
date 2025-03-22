const express = require("express");
const bodyParser = require("body-parser");
const {
  registerController,
  loginController,
  refreshTokenController,
  forgotPasswordController,
  verifyforgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  logoutController,
  changePasswordController,
} = require("../controller/users.controllers");
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  verifyForgotPasswordTokenValidator,
  resetPasswordValidator,
  accessTokenValidator,
  updateMeValidator,
  changePasswordValidator,
} = require("../middleware/users.middleware");

const userRoute = express.Router();
userRoute.use(bodyParser.json());

/**
 * @swagger
 * /api/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new account
 *     description: Register new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - phone
 *               - password
 *               - username
 *     responses:
 *       200:
 *         description: Register success
 *       400:
 *         description: Register failed
 */

userRoute.post("/register", registerValidator, registerController);
/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login to an existing account
 *     description: Allows a user to log into their account using email and password.
 *     security:
 *       - BearerAuth: [] # Chỉ định API này cần Bearer Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *               password:
 *                 type: string
 *                 description: The password for the user account.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful. Returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticating further requests.
 *       400:
 *         description: Bad request. The request could not be processed due to invalid input.
 *       401:
 *         description: Unauthorized. Incorrect email or password.
 *       404:
 *         description: Account not found. No account exists with the provided email.
 *       500:
 *         description: Internal server error. Something went wrong on the server.
 */
userRoute.post("/login", loginValidator, loginController);

/**
 * @swagger
 * /api/forgot-password:
 *   post: # Method type
 *     tags:
 *       - Authentication # Tag group for the API
 *     summary: Forgot password
 *     description: Send an email to reset the password
 *     requestBody: # Defines the request body
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the account
 *             required:
 *               - email
 *     responses: # Possible responses
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Bad request (e.g., missing email or invalid format)
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
userRoute.post(
  "/forgot-password",
  forgotPasswordValidator,
  forgotPasswordController
);

// verify-forgot-password-token
userRoute.post(
  "/verify-forgot-password",
  verifyForgotPasswordTokenValidator,
  verifyforgotPasswordController
);
/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     description: Allows a user to reset their password using a token and a new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: The new password to set.
 *               token:
 *                 type: string
 *                 description: The token generated during the password reset request.
 *             required:
 *               - newPassword
 *               - token
 *     responses:
 *       200:
 *         description: Reset password successful. The user's password has been updated.
 *       400:
 *         description: Bad request. The provided data is invalid.
 *       401:
 *         description: Unauthorized. Invalid or expired token.
 *       404:
 *         description: Not Found. Token does not exist or has expired.
 *       500:
 *         description: Internal server error. Something went wrong on the server.
 */
userRoute.post(
  "/reset-password",
  verifyForgotPasswordTokenValidator,
  resetPasswordValidator,
  resetPasswordController
);

// get new accessToken & refreshToken
userRoute.post("/refresh-token", refreshTokenValidator, refreshTokenController);
userRoute.get("/me", accessTokenValidator, getMeController);
userRoute.patch(
  "/me",
  accessTokenValidator,
  updateMeValidator,
  updateMeController
);
userRoute.post(
  "/logout",
  accessTokenValidator,
  refreshTokenValidator,
  logoutController
);
userRoute.put(
  "/change-password",
  accessTokenValidator,
  changePasswordValidator,
  changePasswordController
);

module.exports = userRoute;
