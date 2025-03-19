const { ObjectId } = require("mongodb");
const db = require("../models/index");

class SearchService {
  async search({ content }) {
    console.log(`SearchService: Starting search with content: ${content}`);

    if (!content || content.trim() === "") {
      console.log("SearchService: Content is empty, returning empty results");
      return {
        products: [],
        orders: [],
        feedbacks: [],
      };
    }

    const searchQuery = content.trim();
    const isObjectId = ObjectId.isValid(searchQuery);
    console.log(`SearchService: Is content an ObjectId? ${isObjectId}`);

    let productResults = [];
    let orderResults = [];
    let feedbackResults = [];

    try {
      console.log("SearchService: Searching products...");
      const productQuery = isObjectId
        ? { _id: new ObjectId(searchQuery) }
        : {
            $or: [
              { name: { $regex: searchQuery, $options: "i" } },
              { description: { $regex: searchQuery, $options: "i" } },
              { origin: { $regex: searchQuery, $options: "i" } },
            ],
          };

      const products = await db.Product.find({
        ...productQuery,
        deletedAt: null,
      })
        .populate("brand_id", "name")
        .populate("category_id", "name")
        .lean();

      productResults = products.map((product) => ({
        type: "product",
        id: product._id.toString(),
        name: product.name || "N/A",
        description: product.description || "N/A",
        origin: product.origin || "N/A",
        brand: product.brand_id?.name || "Unknown",
        category: product.category_id?.name || "Unknown",
      }));
      console.log(`SearchService: Found ${productResults.length} products`);
    } catch (error) {
      console.error("SearchService: Error searching products:", error.message);
    }

    try {
      console.log("SearchService: Searching orders...");
      const orderQuery = isObjectId ? { _id: new ObjectId(searchQuery) } : {};

      const orders = await db.Order.find(orderQuery)
        .populate("user_id", "email")
        .lean();

      orderResults = orders.map((order) => ({
        type: "order",
        id: order._id.toString(),
        userEmail: order.user_id?.email || "Unknown",
        totalQuantity: order.total_quantity || 0,
        endPrice: order.end_price || 0,
        status: order.status || "N/A",
      }));
      console.log(`SearchService: Found ${orderResults.length} orders`);
    } catch (error) {
      console.error("SearchService: Error searching orders:", error.message);
    }

    try {
      console.log("SearchService: Searching feedbacks...");
      const feedbackQuery = isObjectId
        ? { _id: new ObjectId(searchQuery) }
        : { content: { $regex: searchQuery, $options: "i" } };

      const feedbacks = await db.Feedback.find(feedbackQuery)
        .populate("user_id", "email")
        .lean();

      feedbackResults = feedbacks.map((feedback) => ({
        type: "feedback",
        id: feedback._id.toString(),
        userEmail: feedback.user_id?.email || "Unknown",
        rating: feedback.rating_number || 0,
        comment: feedback.content || "N/A",
      }));
      console.log(`SearchService: Found ${feedbackResults.length} feedbacks`);
    } catch (error) {
      console.error("SearchService: Error searching feedbacks:", error.message);
    }

    console.log("SearchService: Search completed");
    return {
      products: productResults,
      orders: orderResults,
      feedbacks: feedbackResults,
    };
  }
}

const searchService = new SearchService();
module.exports = { searchService }; // Export dưới dạng object với key searchService
