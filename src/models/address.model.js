const mongoose = require("mongoose");
const { ROLE } = require("../constants/enum");

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "User ID is required"],
    },
    receiver_name: {
      type: String,
      required: [true, "Receiver name is required"],
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
    },
    is_default: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    district_code: {
      type: String,
      required: [true, "District code is required"],
    },
    ward_code: {
      type: String,
      required: [true, "Ward code is required"],
    },
    province_code: {
      type: String,
      required: [true, "Province code is required"],
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
