const db = require("../models/index");
const { ObjectId } = require("mongodb");
const categoryRoute = require("../routes/categoryRoute");
const _ = require("lodash");
class WishListService {
  async addWishList(user_id, payload) {
    const wishlist = await db.WishList.findOneAndUpdate(
      {
        user_id: new ObjectId(String(user_id)),
        variant_id: new ObjectId(String(payload.variation_id)),
        product_id: new ObjectId(String(payload.product_id)),
        createdBy: new ObjectId(String(user_id)),
        updatedBy: new ObjectId(String(user_id)),
        deletedAt: null,
        deletedBy: null,
      },
      {
        $set: { updatedAt: new Date() },
        $setOnInsert: {
          createdBy: new ObjectId(String(user_id)),
          updatedBy: new ObjectId(String(user_id)),
        },
      },
      { new: true, upsert: true }
    );
    return wishlist;
  }

  async deleteWishList(user_id, payload) {
    const wishlist = await db.WishList.findOneAndUpdate(
      {
        user_id: new ObjectId(String(user_id)),
        variant_id: new ObjectId(String(payload.variation_id)),
        product_id: new ObjectId(String(payload.product_id)),
        deletedAt: null,
        deletedBy: null,
      },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: new ObjectId(String(user_id)),
        },
      },
      { new: true }
    );

    return wishlist;
  }
  async getWishList(user_id) {
    const wishlist = await db.WishList.find({
      user_id: new ObjectId(String(user_id)),
      deletedAt: null,
      deletedBy: null,
    });
    const brands = await db.Brand.find().select("name");
    const productIds = wishlist.map((wish) => wish.product_id);
    const variantIds = wishlist.map((wish) => wish.variant_id).filter(Boolean);

    const [images, products, variations] = await Promise.all([
      db.Image.find({ parent_id: { $in: productIds } }),
      db.Product.find({ _id: { $in: productIds } }),
      db.ProductVariation.find({ _id: { $in: variantIds } }),
    ]);

    const result = wishlist.map((wish) => {
      const product = products.find((p) => p._id.equals(wish.product_id)) || {};
      const variation =
        variations.find((v) => v._id.equals(wish.variant_id)) || {};

      const productImages = images
        .filter((img) => img.parent_id.equals(wish.product_id))
        .map((img) => img.image_url);
      console.log(variation.attributes);

      return {
        ...wish.toObject(),
        brand_name: brands.find((brand) => brand._id.equals(product.brand_id))
          .name,
        attribute: variation.attributes,
        ...product.toObject(),
        ...variation.toObject(),
        images: productImages.length ? productImages : [product.image_url], // Nếu không có ảnh thì giữ nguyên ảnh chính
      };
    });

    return result;
  }
}
const wishListService = new WishListService();
module.exports = wishListService;
