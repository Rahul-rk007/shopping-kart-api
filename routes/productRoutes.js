const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Subcategory = require("../models/Subcategory"); // Import the Subcategory model
const Category = require("../models/Category");
const multer = require("multer");
const path = require("path");

const router = express.Router();


// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/"); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the file name
  },
});

const upload = multer({ storage: storage });


// Get Product List API
router.get("/", async (req, res) => {
  console.log(req.query);

  const {
    limit = 9,
    offset = 0,
    subcategoryId,
    minPrice,
    maxPrice,
    color, // Extract the color parameter
  } = req.query; // Default values for limit and offset

  try {
    // Build the query based on the provided parameters
    const query = { IsActive: true }; // Start with active products

    // If subcategoryId is provided, add it to the query
    if (subcategoryId) {
      query.SubcategoryID = subcategoryId; // Filter by subcategory ID

      // If minPrice and maxPrice are provided, add them to the query
      if (minPrice && maxPrice) {
        query.Price = { $gte: Number(minPrice), $lte: Number(maxPrice) }; // Filter by price range
      }
    }

    // If color is provided, add it to the query
    if (color) {
      query.Color = color; // Assuming your product schema has a Color field
    }

    // Fetch products with pagination
    const products = await Product.find(query)
      .skip(Number(offset)) // Skip the number of documents specified by offset
      .limit(Number(limit)) // Limit the number of documents returned
      .populate("SubcategoryID", "SubcategoryName"); // Populate subcategory name

    const totalProducts = await Product.countDocuments(query); // Get total count of active products

    const productsWithImages = products.map((product) => {
      return {
        ...product.toObject(), // Convert mongoose document to plain object
        ImageURLs: product.ImageURLs.map((image) => {
          // Assuming images are stored in 'uploads/products/<productId>/imageName'
          return `${req.protocol}://${req.get(
            "host"
          )}/uploads/products/${image}`;
        }),
      };
    });

    res.status(200).json({
      total: totalProducts,
      limit: Number(limit),
      offset: Number(offset),
      products: productsWithImages,
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
    const productWithImageUrls = {
      ...product.toObject(), // Convert mongoose document to plain object
      ImageURLs: product.ImageURLs.map((image) => {
        // Construct the full URL for each image
        return `${req.protocol}://${req.get("host")}/uploads/products/${image}`;
      }),
    };
    res.status(200).json(productWithImageUrls);
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

    const productsWithImageUrls = featuredProducts.map((product) => {
      return {
        ...product.toObject(), // Convert mongoose document to plain object
        ImageURLs: product.ImageURLs.map((image) => {
          // Construct the full URL for each image
          return `${req.protocol}://${req.get(
            "host"
          )}/uploads/products/${image}`;
        }),
      };
    });

    res.status(200).json({
      total: totalFeaturedProducts,
      limit: Number(limit),
      offset: Number(offset),
      featuredProducts: productsWithImageUrls,
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

    const productsWithImageUrls = newArrivals.map((product) => {
      return {
        ...product.toObject(), // Convert mongoose document to plain object
        ImageURLs: product.ImageURLs.map((image) => {
          // Construct the full URL for each image
          return `${req.protocol}://${req.get(
            "host"
          )}/uploads/products/${image}`;
        }),
      };
    });

    // Send response
    res.status(200).json({
      total: totalNewArrivals,
      limit: Number(limit),
      offset: Number(offset),
      newArrivals: productsWithImageUrls,
    });
  } catch (error) {
    console.error("Error fetching new arrivals:", error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
});

router.get("/colors", async (req, res) => {
  const { subcategoryId, minPrice, maxPrice } = req.query;

  try {
    // Build the query based on the provided parameters
    const query = { IsActive: true }; // Start with active products

    // If subcategoryId is provided, add it to the query
    if (subcategoryId) {
      query.SubcategoryID = subcategoryId; // Filter by subcategory ID
    }

    // If minPrice and maxPrice are provided, add them to the query
    if (minPrice && maxPrice) {
      query.Price = { $gte: Number(minPrice), $lte: Number(maxPrice) }; // Filter by price range
    }

    // Aggregate to get color counts
    const colorCounts = await Product.aggregate([
      { $match: query }, // Match the query
      { $group: { _id: "$Color", count: { $sum: 1 } } }, // Group by color and count
      { $project: { color: "$_id", count: "$count", _id: 0 } }, // Format the output
    ]);

    res.status(200).json(colorCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:subcategoryId", async (req, res) => {
  const { subcategoryId } = req.params;

  try {
    const products = await Product.find({ SubcategoryID: subcategoryId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});





// // Create a new Product (POST)
// router.post("/admin/products", async (req, res) => {
//   const { SubcategoryID, CategoryID, ProductName, Price, Description, ImageURLs, Color, Featured, IsActive } = req.body;

//   try {
//     const newProduct = new Product({
//       SubcategoryID,
//       CategoryID,
//       ProductName,
//       Price,
//       Description,
//       ImageURLs,
//       Color,
//       Featured,
//       IsActive,
//     });

//     const savedProduct = await newProduct.save();
//     res.status(201).json(savedProduct);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/admin/products", upload.array("ImageURLs"), async (req, res) => {
  const { SubcategoryID, CategoryID, ProductName, Price, Description, Color, Featured, IsActive, SKU, StockQuantity } = req.body;

  // Check if files were uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded." });
  }

  // Extract image file names from the request
  const imageURLs = req.files.map(file => file.filename); // Get the filenames of the uploaded images

  try {
    const newProduct = new Product({
      SubcategoryID,
      CategoryID,
      ProductName,
      Price,
      Description,
      ImageURLs: imageURLs, // Store the filenames in the database
      Color,
      Featured,
      IsActive,
      SKU, // Include SKU
      StockQuantity // Include StockQuantity
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Products API
router.get("/admin/products", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("SubcategoryID", "SubcategoryName")
      .populate("CategoryID", "CategoryName");

    console.log("Fetched products:", products); // Log fetched products

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    const productsWithImages = products.map((product) => {
      return {
        ...product.toObject(),
        ImageURLs: product.ImageURLs.map((image) => {
          return `${req.protocol}://${req.get("host")}/uploads/products/${image}`;
        }),
      };
    });

    res.status(200).json(productsWithImages);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a Product by ID (GET)
router.get("/admin/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .populate("SubcategoryID", "SubcategoryName")
      .populate("CategoryID", "CategoryName");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Construct the full URLs for each image
    const productWithImageUrls = {
      ...product.toObject(), // Convert mongoose document to plain object
      ImageURLs: product.ImageURLs.map((image) => {
        return `${req.protocol}://${req.get("host")}/uploads/products/${image}`;
      }),
    };

    res.status(200).json(productWithImageUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a Product (PUT)
router.put("/admin/products/:id", async (req, res) => {
  const { id } = req.params;
  const { SubcategoryID, CategoryID, ProductName, Price, Description, ImageURLs, Color, Featured, IsActive } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        SubcategoryID,
        CategoryID,
        ProductName,
        Price,
        Description,
        ImageURLs,
        Color,
        Featured,
        IsActive,
      },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a Product (DELETE)
router.delete("/admin/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
