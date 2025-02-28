const db = require("../models/index");

class BrandService {
  async getAllBrands() {
    return await db.Brand.find();
  }
  async addBrand(payload) {
    return await db.Brand.create({ name: payload.name });
  }
}
const brandService = new BrandService();
exports.brandService = brandService;
