const db = require("../models/index");
const { ObjectId } = require("mongodb");

/**
 * Hàm xây dựng cây danh mục theo parent_category_id
 */
function buildCategoryTree(categories, parentId = null) {
  return categories
    .filter(
      (category) => String(category.parent_category_id) === String(parentId)
    )
    .map((category) => {
      // Đệ quy lấy danh mục con
      const subCategories = buildCategoryTree(categories, category._id);
      const categoryData = { ...category.toObject() };

      if (subCategories.length > 0) {
        categoryData.subCate = subCategories;
      } else {
        // Nếu không có danh mục con thì loại bỏ trường subCate (leaf category)
        delete categoryData.subCate;
      }
      return categoryData;
    });
}

/**
 * Hàm gán image cho từng leaf category (danh mục con không có subCate)
 */
function attachImagesToCateTree(cateTree, subCateImages) {
  cateTree.forEach((category) => {
    if (!category.subCate) {
      // Nếu là leaf category, tìm image từ subCateImages (được lấy từ aggregate)
      const imgData = subCateImages.find(
        (item) => String(item._id) === String(category._id)
      );
      if (imgData) {
        category.image = imgData.image;
      }
    } else {
      // Nếu có danh mục con, đệ quy cho các subCate
      attachImagesToCateTree(category.subCate, subCateImages);
    }
  });
}

class CategoryService {
  async getAllCategories() {
    // 1. Lấy danh mục
    const categories = await db.Category.find({
      deleteBy: { $exists: false },
    }).select("_id name parent_category_id");

    // 2. Xây dựng cây danh mục
    const cateTree = buildCategoryTree(categories);

    // 3. Lấy ra tất cả các sub category là leaf
    const subCateLeaf = await db.Category.find({
      parent_category_id: { $ne: null },
    }).select("_id name parent_category_id");

    // 4. Dùng aggregate để lấy ảnh cho từng sub category từ bảng Product (join với images)
    const subCateImages = await db.Product.aggregate([
      {
        $match: {
          category_id: {
            $in: subCateLeaf.map((cate) => cate._id),
          },
        },
      },
      {
        $lookup: {
          from: "images",
          localField: "_id",
          foreignField: "parent_id",
          as: "images",
        },
      },
      {
        $unwind: "$images",
      },
      {
        $group: {
          _id: "$category_id",
          image: { $first: "$images.image_url" },
        },
      },
    ]);

    // 5. Gán image vào cây danh mục (cho leaf category)
    attachImagesToCateTree(cateTree, subCateImages);

    return cateTree;
  }

  async getCategoryDetail(id) {
    const category = await db.Category.findOne({
      _id: new ObjectId(String(id)),
      deleteBy: { $exists: false },
    });
    return category;
  }

  async addCategory(payload, userId) {
    const result = await db.Category.create({
      parent_category_id: payload.parent_category_id,
      name: payload.name,
      status: payload.status,
      createBy: userId,
    });
    return result;
  }

  async updateCategory(payload, userId) {
    const category = await db.Category.updateOne(
      { _id: payload.category_id },
      {
        $set: {
          name: payload.name,
          status: payload.status,
          updateBy: userId,
        },
      }
    );
    return category;
  }

  async deleteCategory(payload, userId) {
    const category = await db.Category.updateOne(
      { _id: payload.category_id },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      }
    );
    await db.Category.updateMany(
      {
        parent_category_id: payload.category_id,
      },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      }
    );
    await db.Product.updateMany(
      { category: payload.category_id },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      }
    );
    return category;
  }

  async getSubCateByParentCateId(parent_category_id) {
    let subCategories = await db.Category.find({
      parent_category_id: new ObjectId(String(parent_category_id)),
      deleteBy: { $exists: false },
    }).select("_id name parent_category_id");

    for (let i = 0; i < subCategories.length; i++) {
      let subCate = await this.getSubCateByParentCateId(subCategories[i]._id); // Gọi đệ quy
      if (subCate.length > 0) {
        const subCateImages = await db.Product.aggregate([
          {
            $match: {
              category_id: {
                $in: subCate.map((cate) => cate._id),
              },
            },
          },
          {
            $lookup: {
              from: "images",
              localField: "_id",
              foreignField: "parent_id",
              as: "images",
            },
          },
          {
            $unwind: "$images",
          },
          {
            $group: {
              _id: "$category_id",
              image: { $first: "$images.image_url" },
            },
          },
        ]);

        subCategories[i] = {
          _id: subCategories[i]._id,
          name: subCategories[i].name,
          parent_category_id: subCategories[i].parent_category_id,
          subCate: subCate.map((cate) => ({
            _id: cate._id,
            name: cate.name,
            parent_category_id: cate.parent_category_id,
            image: subCateImages.find(
              (item) => String(item._id) === String(cate._id)
            )?.image,
          })),
        };
      }
    }

    return subCategories;
  }
}

const categoryService = new CategoryService();
exports.categoryService = categoryService;
