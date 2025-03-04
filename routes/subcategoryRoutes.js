const express = require("express");
const Subcategory = require("../models/Subcategory");
const Category = require("../models/Category"); // Import the Category model

const router = express.Router();

// Get Subcategories by CategoryID API
router.get("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Fetch subcategories based on the provided CategoryID
    const subcategories = await Subcategory.find({
      CategoryID: categoryId,
      IsActive: true,
    }); // Fetch only active subcategories
    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Combined API to get categories with their subcategories
router.get("/list/categories-subcategories", async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Category.find();

    // Fetch all subcategories in one go
    const subcategories = await Subcategory.find({ IsActive: true });

    // Create a mapping of subcategories by category ID
    const subcategoryMap = subcategories.reduce((acc, sub) => {
      if (!acc[sub.CategoryID]) {
        acc[sub.CategoryID] = [];
      }
      acc[sub.CategoryID].push({
        id: sub._id,
        name: sub.SubcategoryName,
      });
      return acc;
    }, {});

    // Construct the response with categories and their corresponding subcategories
    const categoriesWithSubcategories = categories.map((category) => ({
      id: category._id,
      name: category.CategoryName,
      subcategories: subcategoryMap[category._id] || [], // Get subcategories or an empty array
    }));

    res.json(categoriesWithSubcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
