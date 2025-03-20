const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");
const db = require("../models/index");

exports.getFeeMiddleware = validate(
  checkSchema(
    {
      to_district_id: {
        notEmpty: {
          errorMessage: "District id is required",
        },
        isNumeric: {
          errorMessage: "District id must be a number",
        },
      },
      to_ward_code: {
        notEmpty: {
          errorMessage: "Ward code is required",
        },
        isString: {
          errorMessage: "Ward code must be a string",
        },
      },
    },
    ["body"]
  )
);
// exports.getFeeMiddleware = validate(
//   checkSchema(
//     {
//       fromDistrictId: {
//         isString: {
//           errorMessage: "District id must be a string",
//         },
//         notEmpty: {
//           errorMessage: "District id is required",
//         },
//       },
//       toDistrictId: {
//         isString: {
//           errorMessage: "District id must be a string",
//         },
//         notEmpty: {
//           errorMessage: "District id is required",
//         },
//       },
//       weight: {
//         isString: {
//           errorMessage: "Weight must be a string",
//         },
//         notEmpty: {
//           errorMessage: "Weight is required",
//         },
//       },
//     },
//     ["body"]
//   )
// );
