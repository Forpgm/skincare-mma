const mongoose = require("mongoose");

const ProductVariationSchema = mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product id is required!!!"],
    },
    images: [
      {
        type: String,
        required: [true, "Image is required!!!"],
      },
    ],
    price: {
      type: Number,
      required: [true, "Price is required!!!"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required!!!"],
    },
    attributes: { type: Map, of: String },

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

const ProductVariation = mongoose.model(
  "ProductVariation",
  ProductVariationSchema
);

module.exports = ProductVariation;
