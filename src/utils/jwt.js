const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signToken = ({
  payload,
  privateKey,
  options = { algorithm: "HS256" },
}) => {
  return new Promise((resolve) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) return reject(error);
      resolve(token);
    });
  });
};

exports.verifyToken = ({ token, secretOrPublicKey }) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};
