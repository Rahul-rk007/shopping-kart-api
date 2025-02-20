const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// Get Category List API
router.get('/', async (req, res) => {
    try {
        // Fetch categories from the database
        const categories = await Category.find({ IsActive: true }); // Fetch only active categories
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;