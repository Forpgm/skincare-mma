const { checkSchema } = require("express-validator");
const { validate } = require("../utils/validator");

exports.getFeeMiddleware = validate(
  checkSchema(
    {
      service_id: {
        isString: {
          errorMessage: "Service id must be a string",
        },
        notEmpty: {
          errorMessage: "Service id is required",
        },
      },
      to_district_id: {
        isString: {
          errorMessage: "District id must be a string",
        },
        notEmpty: {
          errorMessage: "District id is required",
        },
      },
      to_ward_code: {
        isString: {
          errorMessage: "Ward code must be a string",
        },
        notEmpty: {
          errorMessage: "Ward code is required",
        },
      },
      receiver_name: {
        isString: {
          errorMessage: "Receiver name must be a string",
        },
        notEmpty: {
          errorMessage: "Receiver name is required",
        },
      },
      phone_number: {
        isString: {
          errorMessage: "Phone number must be a string",
        },
        notEmpty: {
          errorMessage: "Phone number is required",
        },
      },
      address: {
        isString: {
          errorMessage: "Address must be a string",
        },
        notEmpty: {
          errorMessage: "Address is required",
        },
      },
      voucher_code: {
        isString: {
          errorMessage: "Voucher code must be a string",
        },
        optional: true,
        // custom: {
        //   options: async (value) => {
        //     if (value) {
        //       const voucher = await voucherService.getVoucherByCode(value);
        //       // kiểm tra voucher code có tồn tại không
        //       if (!voucher) {
        //         throw new Error(SHIP_MESSAGES.VOUCHER_CODE_IS_INVALID);
        //       }
        //       // kiểm tra voucher code đã hết hạn chưa
        //       if (voucher.expired_at < new Date()) {
        //         throw new Error(SHIP_MESSAGES.VOUCHER_CODE_IS_EXPIRED);
        //       }
        //       // kiểm tra voucher code đã được sử dụng chưa
        //       if (voucher.quantity === 0) {
        //         throw new Error(SHIP_MESSAGES.VOUCHER_CODE_IS_OUT_OF_STOCK);
        //       }
        //     }
        //     return true;
        //   },
        // },
      },
    },
    ["body"]
  )
);
