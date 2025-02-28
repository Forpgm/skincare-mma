const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required!!!"],
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category id is required!!!"],
    },
    description: {
      type: String,
    },
    instruction: {
      type: String,
    },
    origin: {
      type: String,
      required: [true, "Product origin is required!!!"],
    },
    total_rating: {
      type: Number,
      default: 0,
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Product brand is required!!!"],
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

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
