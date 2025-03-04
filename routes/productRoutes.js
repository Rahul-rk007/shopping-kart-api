const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Subcategory = require("../models/Subcategory"); // Import the Subcategory model
const Category = require("../models/Category");

const router = express.Router();

// Get Product List API
router.get("/", async (req, res) => {
  const { limit = 9, offset = 0, subcategoryId } = req.query; // Default values for limit and offset

  try {
    // Build the query based on the provided subcategoryId
    const query = { IsActive: true }; // Start with active products

    // If subcategoryId is provided, add it to the query
    if (subcategoryId) {
      query.SubcategoryID = subcategoryId; // Filter by subcategory ID
    }

    // Fetch products with pagination
    const products = await Product.find(query)
      .skip(Number(offset)) // Skip the number of documents specified by offset
      .limit(Number(limit)) // Limit the number of documents returned
      .populate("SubcategoryID", "SubcategoryName"); // Populate subcategory name

    const totalProducts = await Product.countDocuments(query); // Get total count of active products

    res.status(200).json({
      total: totalProducts,
      limit: Number(limit),
      offset: Number(offset),
      products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Product Detail API
router.get("/detail/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch product by ID
    const product = await Product.findById(id)
      .populate("SubcategoryID", "SubcategoryName")
      .populate("CategoryID", "CategoryName");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Featured Products API with Offset and Limit
router.get("/featured", async (req, res) => {
  const { limit = 10, offset = 0 } = req.query; // Default values for limit and offset

  try {
    // Fetch featured products with pagination
    const featuredProducts = await Product.find({
      Featured: true,
      IsActive: true,
    })
      .skip(Number(offset)) // Skip the number of documents specified by offset
      .limit(Number(limit)) // Limit the number of documents returned
      .populate("SubcategoryID", "SubcategoryName"); // Populate subcategory name

    const totalFeaturedProducts = await Product.countDocuments({
      Featured: true,
      IsActive: true,
    }); // Get total count of featured products

    res.status(200).json({
      total: totalFeaturedProducts,
      limit: Number(limit),
      offset: Number(offset),
      featuredProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get New Arrivals API with Category Filtering
router.get("/new-arrivals", async (req, res) => {
  const { category, limit = 10, offset = 0 } = req.query; // Default values for limit and offset

  try {
    // Build the query based on the category
    const query = { IsActive: true }; // Start with active products

    // Check if category is provided and is not 'All'
    if (category && category !== "All") {
      // Assuming category is an ObjectId, you might need to convert it
      // If category is a string that matches the ObjectId format, you can use it directly
      const foundCategory = await Category.findOne({ CategoryName: category });
      if (foundCategory) {
        query.CategoryID = foundCategory._id; // Use the found category's ID
      } else {
        return res.status(400).json({ message: "Category not found" });
      }
    }

    // Fetch new arrivals with pagination
    const newArrivals = await Product.find(query)
      .skip(Number(offset)) // Skip the number of documents specified by offset
      .limit(Number(limit)) // Limit the number of documents returned
      .populate("SubcategoryID", "SubcategoryName"); // Populate subcategory name

    // Get total count of new arrivals
    const totalNewArrivals = await Product.countDocuments(query);

    // Send response
    res.status(200).json({
      total: totalNewArrivals,
      limit: Number(limit),
      offset: Number(offset),
      newArrivals,
    });
  } catch (error) {
    console.error("Error fetching new arrivals:", error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
