const { ObjectId } = require("mongodb");
const db = require("../models/index");

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

    return result;
  }
}
const searchService = new SearchService();
module.exports = searchService;
