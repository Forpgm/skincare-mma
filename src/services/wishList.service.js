const db = require("../models/index");
const { ObjectId } = require("mongodb");

class WishListService {
  async addWishList(user_id, payload) {
    const wishlist = await db.WishList.findOneAndUpdate(
      {
        user_id: new ObjectId(String(user_id)),
        variant_id: new ObjectId(String(payload.variant_id)),
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
        variant_id: new ObjectId(String(payload.variant_id)),
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
    })
      .populate("product_id")
      .populate("variant_id");
    return wishlist;
  }
}
const wishListService = new WishListService();
module.exports = wishListService;
