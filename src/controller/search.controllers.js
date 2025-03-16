const searchService = require("../services/search.service.js");
exports.searchController = async (req, res) => {
  const result = await searchService.search({
    content: req.query.content,
  });
  res.json({
    message: "Search successfully",
    result,
  });
};
