const { ObjectId } = require("mongodb");
const db = require("../models/index");
const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const addressSchema = {
  notEmpty: {
    errorMessage: "Address ID is required",
  },
  isMongoId: {
    errorMessage: "Address id is invalid",
  },
  custom: {
    options: async (value) => {
      console.log(value);

      const address = await db.Address.findOne({
        _id: new ObjectId(String(value)),
      });
      if (!address) {
        return Promise.reject("Address not found");
      }

      return true;
    },
  },
};
exports.addAddressValidator = validate(
  checkSchema({
    receiver_name: {
      trim: true,
      isString: {
        errorMessage: "Receiver name must be a string",
      },
      notEmpty: {
        errorMessage: "Receiver name is required",
      },
    },
    phone_number: {
      trim: true,
      notEmpty: {
        errorMessage: "Phone number is required",
      },
    },
    is_default: {
      isBoolean: {
        errorMessage: "is_default must be a boolean",
      },
      optional: true,
    },
    address: {
      trim: true,
      isString: {
        errorMessage: "Address must be a string",
      },
      notEmpty: {
        errorMessage: "Address is required",
      },
    },
    ward_code: {
      trim: true,
      isNumeric: {
        errorMessage: "Ward code must be a number",
      },
      notEmpty: {
        errorMessage: "Ward code is required",
      },
    },
    district_code: {
      trim: true,
      isNumeric: {
        errorMessage: "District code must be a number",
      },
      notEmpty: {
        errorMessage: "District ID is required",
      },
    },
    province_code: {
      trim: true,
      isNumeric: {
        errorMessage: "Province code must be a number",
      },
      notEmpty: {
        errorMessage: "Province code is required",
      },
    },
  })
);
exports.deleteAddressValidator = validate(
  checkSchema(
    {
      address_id: addressSchema,
    },
    ["params"]
  )
);
exports.updateAddressValidator = validate(
  checkSchema({
    address_id: {
      in: ["params"],

      optional: true,
      isString: {
        errorMessage: "Address id must be a string",
      },
      custom: {
        options: async (value, { req }) => {
          const address = await db.Address.findOne({
            _id: new ObjectId(String(value)),
            user_id: req.decoded_authorization.userId,
          });
          if (!address) {
            return Promise.reject("Address not found");
          }
          return true;
        },
      },
    },
    receiver_name: {
      optional: true,
      trim: true,
      isString: {
        errorMessage: "Receiver name must be a string",
      },
    },
    phone_number: {
      optional: true,
      trim: true,
    },
    is_default: {
      optional: true,
      isBoolean: {
        errorMessage: "is_default must be a boolean",
      },
    },
    address: {
      trim: true,
      optional: true,
      isString: {
        errorMessage: "Address must be a string",
      },
    },
    ward_code: {
      optional: true,
      trim: true,
      isNumeric: {
        errorMessage: "Ward code must be a number",
      },
    },
    district_code: {
      trim: true,
      optional: true,
      isNumeric: {
        errorMessage: "District code must be a number",
      },
    },
    province_code: {
      optional: true,
      trim: true,
      isNumeric: {
        errorMessage: "Province code must be a number",
      },
    },
  })
);
