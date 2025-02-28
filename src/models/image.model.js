const mongoose = require("mongoose");
const { IMAGE_TYPE } = require("../constants/enum");

const ImageSchema = mongoose.Schema(
  {
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Parent id is required"],
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(IMAGE_TYPE),
      required: [true, "Image type is required!!!"],
    },
    image_url: {
      type: String,
      required: [true, "Image url is required!!!"],
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", ImageSchema);

module.exports = Image;
