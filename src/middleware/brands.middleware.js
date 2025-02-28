const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");

exports.addBrandValidation = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: "Name is required",
        },
        custom: {
          options: (value) => {
            console.log(value);

            if (typeof value !== "string" || /^\d+$/.test(value)) {
              throw new error("Name must be a string");
            }
            return true;
          },
        },
      },
    },
    ["body"]
  )
);
