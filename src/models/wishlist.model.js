const { default: mongoose } = require("mongoose");

const wishListSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "User id is required"],
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product id is required"],
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariation",
      required: [true, "Variant id is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Created by is required!!!"],
      ref: "Account",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Account",
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { timestamps: true }
);

const WishList = mongoose.model("WishList", wishListSchema);

module.exports = WishList;
