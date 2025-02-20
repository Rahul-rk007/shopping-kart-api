const express = require('express');
const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category'); // Import the Category model

const router = express.Router();

// Get Subcategories by CategoryID API
router.get('/:categoryId', async (req, res) => {
    const { categoryId } = req.params;

    try {
        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Fetch subcategories based on the provided CategoryID
        const subcategories = await Subcategory.find({ CategoryID: categoryId, IsActive: true }); // Fetch only active subcategories
        res.status(200).json(subcategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;