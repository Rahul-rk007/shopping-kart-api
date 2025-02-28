const mongoose = require('mongoose');
const Category = require('../models/Category'); // Adjust the path accordingly

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/shopping-kart', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Dummy categories data for Men, Women, and Children
const categories = [
    {
        CategoryName: 'Men',
        Description: 'Clothing, shoes, and accessories for men.',
        ImageURL: 'https://example.com/images/men.jpg',
        IsActive: true,
    },
    {
        CategoryName: 'Women',
        Description: 'Clothing, shoes, and accessories for women.',
        ImageURL: 'https://example.com/images/women.jpg',
        IsActive: true,
    },
    {
        CategoryName: 'Children',
        Description: 'Clothing, shoes, and accessories for children.',
        ImageURL: 'https://example.com/images/children.jpg',
        IsActive: true,
    },
];

// Function to seed categories
const seedCategories = async () => {
    try {
        await Category.deleteMany({}); // Clear existing categories
        const result = await Category.insertMany(categories);
        console.log('Categories seeded:', result);
    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        mongoose.connection.close(); // Close the connection
    }
};

// Run the seeding function
seedCategories();