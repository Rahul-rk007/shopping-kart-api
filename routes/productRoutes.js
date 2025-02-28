const express = require('express');
const Product = require('../models/Product');
const Subcategory = require('../models/Subcategory'); // Import the Subcategory model

const router = express.Router();

// Get Product List API
router.get('/', async (req, res) => {
    const { limit = 9, offset = 0 } = req.query; // Default values for limit and offset

    try {
        // Fetch products with pagination
        const products = await Product.find({ IsActive: true })
            .skip(Number(offset)) // Skip the number of documents specified by offset
            .limit(Number(limit)) // Limit the number of documents returned
            .populate('SubcategoryID', 'SubcategoryName'); // Populate subcategory name

        const totalProducts = await Product.countDocuments({ IsActive: true }); // Get total count of active products

        res.status(200).json({
            total: totalProducts,
            limit: Number(limit),
            offset: Number(offset),
            products
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Product Detail API
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch product by ID
        const product = await Product.findById(id).populate('SubcategoryID', 'SubcategoryName').populate('CategoryID', 'CategoryName');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Featured Products API with Offset and Limit
router.get('/featured', async (req, res) => {
    const { limit = 10, offset = 0 } = req.query; // Default values for limit and offset

    try {
        // Fetch featured products with pagination
        const featuredProducts = await Product.find({ Featured: true, IsActive: true })
            .skip(Number(offset)) // Skip the number of documents specified by offset
            .limit(Number(limit)) // Limit the number of documents returned
            .populate('SubcategoryID', 'SubcategoryName'); // Populate subcategory name

        const totalFeaturedProducts = await Product.countDocuments({ Featured: true, IsActive: true }); // Get total count of featured products

        res.status(200).json({
            total: totalFeaturedProducts,
            limit: Number(limit),
            offset: Number(offset),
            featuredProducts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;