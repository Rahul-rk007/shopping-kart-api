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

// Example of the API response structure
router.get("/admin/categories-subcategories", async (req, res) => {
  try {
      const categories = await Category.find();
      const subcategories = await Subcategory.find();

      const subcategoryMap = subcategories.reduce((acc, sub) => {
          if (!acc[sub.CategoryID]) {
              acc[sub.CategoryID] = [];
          }
          acc[sub.CategoryID].push({
              id: sub._id,
              name: sub.SubcategoryName,
              description: sub.Description || 'No description available', // Ensure description is included
          });
          return acc;
      }, {});

      const categoriesWithSubcategories = categories.map((category) => ({
          id: category._id,
          name: category.CategoryName,
          subcategories: subcategoryMap[category._id] || [],
      }));

      res.json(categoriesWithSubcategories);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// POST: Create a new subcategory
router.post("/admin", async (req, res) => {
  const { SubcategoryName, CategoryID, Description, IsActive } = req.body;

  try {
    const newSubcategory = new Subcategory({
      SubcategoryName,
      CategoryID,
      Description,
      IsActive: IsActive !== undefined ? IsActive : true, // Default to true if not provided
    });

    const savedSubcategory = await newSubcategory.save();
    res.status(201).json(savedSubcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT: Update a subcategory by ID
router.put("/admin/:id", async (req, res) => {
  const { id } = req.params;
  const { SubcategoryName, CategoryID, Description, IsActive } = req.body;

  try {
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      {
        SubcategoryName,
        CategoryID,
        Description,
        IsActive,
      },
      { new: true } // Return the updated document
    );

    if (!updatedSubcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json(updatedSubcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Delete a subcategory by ID
router.delete("/admin/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubcategory = await Subcategory.findByIdAndDelete(id);

    if (!deletedSubcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Get a subcategory by ID
router.get("/admin/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json(subcategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// // Get Subcategories by CategoryID API
// router.get("/admin/:categoryId", async (req, res) => {
//   const { categoryId } = req.params;

//   try {
//     // Check if the category exists
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     // Fetch subcategories based on the provided CategoryID
//     const subcategories = await Subcategory.find({
//       CategoryID: categoryId,
//       IsActive: true,
//     }); // Fetch only active subcategories
//     res.status(200).json(subcategories);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


module.exports = router;
