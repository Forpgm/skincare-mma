const { USERS_MESSAGES } = require("../constants/message");

class ErrorWithStatus {
  message;
  status;
  constructor({ message, status }) {
    this.message = message;
    this.status = status;
  }
}

class EntityError extends ErrorWithStatus {
  errors;
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }) {
    super({ message, status: 422 });
    this.errors = errors;
  }
}

module.exports = { ErrorWithStatus, EntityError };
