const { ObjectId } = require("mongodb");
const db = require("../models/index");
const { IMAGE_TYPE } = require("../constants/enum");

class SearchService {
  async search(content) {
    const result = await db.Product.aggregate([
      {
        $lookup: {
          from: "productvariations",
          localField: "_id",
          foreignField: "product_id",
          as: "variations",
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: content, $options: "i" } },
            { description: { $regex: content, $options: "i" } },
            {
              "variations.attributes.size": { $regex: content, $options: "i" },
            },
            {
              "variations.attributes.color": { $regex: content, $options: "i" },
            },
            {
              "variations.attributes.weight": {
                $regex: content,
                $options: "i",
              },
            },
          ],
        },
      },
    ]);
    const thumbnails = await db.Image.find({
      parent_id: { $in: result.map((product) => product._id) },
      type: IMAGE_TYPE.PRODUCT,
    }).select("image_url parent_id");

    const brandNames = await db.Brand.find().select("name");
    const catesNames = await db.Category.find().select("name");

    const products = result
      .map((product) => {
        return product.variations.map((variation) => ({
          category_id: product.category_id,
          category_name: catesNames.find((cate) =>
            cate._id.equals(product.category_id)
          ).name,
          description: product.description,
          instruction: product.instruction,
          origin: product.origin,
          total_rating: product.total_rating,
          brand_id: product.brand_id,
          brand_name: brandNames.find((brand) =>
            brand._id.equals(product.brand_id)
          ).name,
          product_id: product._id,
          variation_id: variation._id,
          name: `${product.name} ${Object.entries(variation.attributes)
            .map(([key, value]) => `${key} ${value}`)
            .join(" ")}`,
          price: variation.price,
          images: thumbnails
            .filter((thumbnail) => thumbnail.parent_id.equals(product._id))
            .map((thumbnail) => thumbnail.image_url),
          quantity: variation.quantity,
        }));
      })
      .flat();

    return products;
  }
}
const searchService = new SearchService();
module.exports = searchService;
