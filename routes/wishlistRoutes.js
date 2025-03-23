// routes/wishlistRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const verifyToken = require('../middleware/auth');

// Function to construct the full image URL
const constructImageUrl = (req, image) => {
  return `${req.protocol}://${req.get("host")}/uploads/products/${image}`;
};

// Get a user's wishlist
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Find the wishlist for the user
    const wishlist = await Wishlist.findOne({ user: userId }).populate("products.product");

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    // Construct the full image URLs for each product
    const fullWishlist = {
      ...wishlist._doc, // Spread the existing wishlist properties
      products: wishlist.products.map(item => ({
        ...item._doc, // Spread the existing product properties
        image: `${req.protocol}://${req.get("host")}/uploads/products/${item.image}` // Construct the full image URL
      }))
    };

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a product to the wishlist
router.post("/products", verifyToken, async (req, res) => {
  try {
    const { product, productName, price, image } = req.body;
    const userId = req.userId;
    console.log(req.body);
    

    // Construct the full image URL
    const fullImageUrl = constructImageUrl(req, image[0]);

    // Check if the wishlist exists for the user
    let wishlist = await Wishlist.findOne({ user: userId });

    // If the wishlist does not exist, create a new one
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Check if the product already exists in the wishlist
    const existingProductIndex = wishlist.products.findIndex(
      (p) => p.product.toString() === product
    );

    if (existingProductIndex > -1) {
      // If the product already exists, send a response indicating it
      return res.status(201).json({ message: "Product is already exist in the wishlist." });
    } else {
      // If the product does not exist, add it to the wishlist
      wishlist.products.push({
        product,
        productName,
        price,
        image: image, // Use the full image URL
        quantity: 1,
      });
    }

    await wishlist.save();
    res.status(200).json({ message: "Product is added to the wishlist." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;

  try {
    const userId = req.userId;

    // Find the wishlist for the user
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    // Remove the product from the wishlist
    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId
    );
    await wishlist.save();

    res.status(200).json({ message: "Product removed from wishlist successfully!", wishlist });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;