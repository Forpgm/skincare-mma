const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
exports.sendSuccessRegisterMail = (email) => {
  const templatePath = path.join(__dirname, "../templates/emailTemplate.html");

  let emailTemplate = fs.readFileSync(templatePath, "utf8");
  emailTemplate = emailTemplate.replace("{{email}}", email);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Registration Successful",
    html: emailTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
exports.sendForgotPasswordMail = (email, token) => {
  const templatePath = path.join(
    __dirname,
    "../templates/resetPasswordTemplate.html"
  );

  let emailTemplate = fs.readFileSync(templatePath, "utf8");
  emailTemplate = emailTemplate.replace("{{email}}", email);
  emailTemplate = emailTemplate.replace("{{token}}", token);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password",
    html: emailTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
