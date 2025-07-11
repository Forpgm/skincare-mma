const { IMAGE_TYPE } = require("../constants/enum");
const db = require("../models/index");
const _ = require("lodash");
const { ObjectId } = require("mongodb");

class ProductService {
  async getAllProducts() {
    const products = await db.Product.aggregate([
      {
        $lookup: {
          from: "productvariations",
          localField: "_id",
          foreignField: "product_id",
          as: "variations",
          pipeline: [
            {
              $project: {
                _id: 0,
                images: 1,
                price: 1,
                quantity: 1,
                attributes: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          __v: 0,
          createdBy: 0,
          updatedBy: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ]);

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
  async getProductByCriteria(query) {
    if ("category_id" in query) {
      const products = await db.Product.find({
        category_id: query.category_id,
      });
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
              product_id: product._id,
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
    } else if ("variation_id" in query) {
      const productVariation = await db.ProductVariation.findOne({
        _id: query.variation_id,
      });

      const variations = await db.ProductVariation.find({
        product_id: productVariation.product_id,
      });

      const products = await db.Product.findById({
        _id: productVariation.product_id,
      });
      const thumbnail = await db.Image.find({
        parent_id: productVariation.product_id,
      }).select("image_url _id parent_id");

      // Lấy brand name
      const brandNames = await db.Brand.findOne({
        _id: products.brand_id,
      }).select("name");

      let finalProducts = [];

      const img = thumbnail.map((thumb) => thumb.image_url);
      variations.forEach((variation) => {
        const attrText = Array.from(variation.attributes.entries())
          .map(([key, value]) => `${key} ${value}`)
          .join(" ");
        finalProducts.push({
          _id: variation._id,
          product_id: products._id,
          category_id: products.category_id,
          name: `${products.name} ${attrText}`,
          brandName: brandNames.name,
          thumbnails: img,
          attributes: variation.attributes,
          description: products.description,
          instruction: products.instruction,
          origin: products.origin,
          total_rating: products.total_rating,
          images: variation.images.length > 0 ? variation.images : img,
          price: variation.price,
          quantity: variation.quantity,
        });
      });
      finalProducts.sort((a, b) =>
        a._id.toString() === query.variation_id
          ? -1
          : b._id.toString() === query.variation_id
          ? 1
          : 0
      );

      return finalProducts;
    } else if ("brand_id" in query) {
      const products = await db.Product.find({
        brand_id: query.brand_id,
      });
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
              product_id: product._id,
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
          return finalProducts;
        }
      });
      return finalProducts;
    }
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

  async getProductDetail(productId) {
    const product = await db.Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const thumbnails = await db.Image.find({
      parent_id: product._id,
      type: IMAGE_TYPE.PRODUCT,
    });

    const productVariations = await db.ProductVariation.find({
      product_id: product._id,
    });

    const brand = await db.Brand.findById(product.brand_id);

    return {
      ...product._doc,
      images: thumbnails.map((thumbnail) => thumbnail.image_url),
      variations: productVariations.map((variation) => {
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
      }),
      brand: brand.name,
    };
  }
}

const productService = new ProductService();
module.exports = productService;
