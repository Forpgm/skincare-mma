const { IMAGE_TYPE } = require("../constants/enum");
const db = require("../models/index");
const _ = require("lodash");
const { ObjectId } = require("mongodb");

class ProductService {
  async getAllProducts() {
    const products = await db.Product.find();
    return products;
  }

  async addProduct(payload, userId) {
    const result = await db.Product.create({
      name: payload.name,
      category_id: payload.category_id,
      brand_id: payload.brand_id,
      description: payload.description ? payload.description : null,
      instruction: payload.instruction ? payload.instruction : null,
      origin: payload.origin,
      createdBy: userId,
      updatedBy: userId,
    });

    let thumbnails = [];
    if (payload.images && payload.images.length > 0) {
      thumbnails = await Promise.all(
        payload.images.map(async (image) => {
          const productImage = await db.Image.create({
            parent_id: result._id,
            image_url: image,
            type: IMAGE_TYPE.PRODUCT,
          });
          return productImage;
        })
      );
    }
    const img = thumbnails.map((thumbnail) => thumbnail.image_url);
    const productVariations = payload.variations.map((variation) => ({
      product_id: result._id,
      attributes: variation.attributes,
      price: variation.price,
      quantity: variation.quantity,
      images: variation.images,
      createdBy: userId,
      updatedBy: userId,
    }));
    let variations = await db.ProductVariation.insertMany(productVariations);
    variations = variations.map((variation) => {
      return {
        ..._.omit(variation._doc, [
          "product_id",
          "createdBy",
          "updatedBy",
          "createdAt",
          "updatedAt",
          "__v",
        ]),
        images: variation.images,
      };
    });
    return {
      ..._.omit(result._doc, [
        "createdBy",
        "updatedBy",
        "createdAt",
        "updatedAt",
        "__v",
      ]),
      images: img,
      variations,
    };
  }
  async getProductsByCate(category_id) {
    const products = await db.Product.find({ category_id });
    const thumbnail = await db.Image.find({
      parent_id: { $in: products.map((product) => product._id) },
    }).select("image_url _id parent_id");

    const productVariations = await db.ProductVariation.find({
      product_id: { $in: products.map((product) => product._id) },
    });

    // Nhóm variations theo product_id
    const productVariationsGroup = _.groupBy(productVariations, "product_id");

    // Lấy brand name
    const brandNames = await db.Brand.find({
      _id: { $in: products.map((product) => product.brand_id) },
    });

    let finalProducts = [];

    products.forEach((product) => {
      const img = thumbnail
        .filter(
          (thumb) => thumb.parent_id.toString() === product._id.toString()
        )
        .map((thumb) => thumb.image_url);

      const brandName = brandNames.find(
        (brand) => brand._id.toString() === product.brand_id.toString()
      )?.name;

      // Nếu có variations, tạo các sản phẩm riêng biệt
      const variations = productVariationsGroup[product._id] || [];
      if (variations.length > 0) {
        variations.forEach((variation) => {
          const attrText = Array.from(variation.attributes.entries())
            .map(([key, value]) => `${key} ${value}`)
            .join(" ");
          finalProducts.push({
            _id: variation._id,
            name: `${product.name} ${attrText}`,
            category_id: product.category_id,
            description: product.description,
            thumbnails: img,
            instruction: product.instruction,
            origin: product.origin,
            total_rating: product.total_rating,
            brandName: brandName,
            images: variation.images.length > 0 ? variation.images : img,
            price: variation.price,
            quantity: variation.quantity,
          });
        });
      } else {
        // Trường hợp không có variation
        finalProducts.push({
          _id: product._id,
          name: product.name,
          category_id: product.category_id,
          description: product.description,
          instruction: product.instruction,
          origin: product.origin,
          total_rating: product.total_rating,
          brandName: brandName,
          images: img,
          price: null,
          quantity: null,
        });
      }
    });

    return finalProducts;
  }
  async updateProduct(userId, payload) {
    const updatedProduct = await db.Product.updateOne(
      {
        _id: new ObjectId(String(payload.id)),
        deletedAt: null,
        deletedBy: null,
      },
      {
        name: payload.name,
        description: payload.description,
        instruction: payload.instruction,
        origin: payload.origin,
        updatedBy: userId,
      },
      { new: true }
    );

    return updatedProduct;
  }
}

const productService = new ProductService();
module.exports = productService;
