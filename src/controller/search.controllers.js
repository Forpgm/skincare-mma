const { searchService } = require("../services/search.service.js");

exports.searchController = async (req, res) => {
  console.log("Entering searchController");
  console.log("Query content:", req.query.content);

  try {
    const result = await searchService.search({
      content: req.query.content,
    });
    console.log("Search result:", result);
    res.json({
      message: "Search successfully",
      result,
    });
  } catch (error) {
    console.error("Error in searchController:", error.message);
    res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
};
