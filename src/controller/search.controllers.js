const searchService = require("../services/search.service.js");
exports.searchController = async (req, res, next) => {
  try {
    const result = await searchService.search(req.query.content);
    res.json({
      message: "Search successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
