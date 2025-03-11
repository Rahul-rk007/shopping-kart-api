// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Import fs to create directories
const Product = require("../models/Product"); // Adjust the path as necessary

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { productId } = req.params; // Get productId from request parameters
    const dir = path.join("uploads/products", productId); // Create a directory for the product

    // Create the directory if it doesn't exist
    fs.mkdirSync(dir, { recursive: true }); // Create directory recursively
    cb(null, dir); // Set the destination to the product's directory
  },
  filename: (req, file, cb) => {
    // Remove single quotes from the original file name
    const sanitizedFileName = file.originalname.replace(/'/g, ""); // Remove single quotes
    cb(null, sanitizedFileName); // Append timestamp to filename
  },
});

const upload = multer({ storage });

const formattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");

  // Format the date as YYYYMMDD
  const formattedDateValue = `${year}${month}${day}`;
  return formattedDateValue;
};

// Serve the upload page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/upload.html")); // Serve the HTML page
});

// Route to upload images for a product
router.post(
  "/product/:productId",
  upload.array("images", 10),
  async (req, res) => {
    console.log("here");

    const { productId } = req.params;

    // Create URLs for uploaded images
    const imageUrls = req.files.map((file) => {
      // Remove single quotes from the filename for the URL
      const sanitizedFileName = file.originalname.replace(/'/g, ""); // Remove single quotes

      return `${sanitizedFileName}`; // Create URL with sanitized name
    });

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Clear existing images
      product.ImageURLs = [];

      // Add new image URLs to the product
      product.ImageURLs.push(...imageUrls);
      await product.save();

      res
        .status(200)
        .json({ message: "Images uploaded successfully", imageUrls });
    } catch (error) {
      res.status(500).json({ message: "Error uploading images", error });
    }
  }
);

module.exports = router;
