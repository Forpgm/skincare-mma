const validationResult = require("express-validator").validationResult;

// import { EntityError, ErrorWithStatus } from "~/models/Errors";
const { EntityError, ErrorWithStatus } = require("../models/errors");
const validate = (validations) => {
  return async (req, res, next) => {
    await validations.run(req);

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorObjects = errors.mapped();
    const entityError = new EntityError({ errors: {} });

    for (const key in errorObjects) {
      const { msg } = errorObjects[key];
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg);
      }

      entityError.errors[key] = msg;
    }

    next(entityError);
  };
};
exports.validate = validate;
