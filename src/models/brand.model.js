const mongoose = require("mongoose");

const BrandSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
  },
  { timestamps: true }
);

const Brand = mongoose.model("Brand", BrandSchema);

module.exports = Brand;
