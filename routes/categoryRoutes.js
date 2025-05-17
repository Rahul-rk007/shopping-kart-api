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

router.get('/admin', async (req, res) => {
    try {
        // Fetch all categories for admin users
        const categories = await Category.find(); // You can add filters if needed
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the category ID from the request parameters

        // Find the category by ID
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ error: "Category not found" }); // Handle case where category is not found
        }

        res.status(200).json(category); // Respond with the found category
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST API to add a new category
router.post('/admin', async (req, res) => {
    try {
        const { CategoryName, Description, IsActive } = req.body;

        // Create a new category instance
        const newCategory = new Category({
            CategoryName,
            Description,
            IsActive: IsActive !== undefined ? IsActive : true, // Default to true if not provided
            createdAt: new Date() // Add createdAt timestamp
        });

        // Save the category to the database
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory); // Respond with the created category
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the category ID from the request parameters

        // Find the category by ID and remove it
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found" }); // Handle case where category is not found
        }

        res.status(200).json({ message: "Category deleted successfully" }); // Respond with success message
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT API to update an existing category
router.put('/admin/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the category ID from the request parameters
        const { CategoryName, Description, IsActive } = req.body; // Get the updated data from the request body

        // Find the category by ID and update it
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                CategoryName,
                Description,
                IsActive: IsActive !== undefined ? IsActive : true, // Default to true if not provided
            },
            { new: true } // Return the updated document
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found" }); // Handle case where category is not found
        }

        res.status(200).json(updatedCategory); // Respond with the updated category
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get total number of categories
router.get('/admin/count', async (req, res) => {
    try {
        const count = await Category.countDocuments(); // Count all categories
        res.status(200).json({ totalCategories: count }); // Respond with the count
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;