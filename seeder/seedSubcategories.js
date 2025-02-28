const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; // Import ObjectId correctly
const Subcategory = require('../models/Subcategory'); // Adjust the path accordingly
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

// Dummy subcategories data
const subcategories = [
    {
        SubcategoryName: 'Clothing',
        CategoryID: new ObjectId('67bd98339496c970d120eb6a'), // Use new ObjectId
        Description: 'Men\'s clothing including shirts, pants, and jackets.',
        ImageURL: 'https://example.com/images/men-clothing.jpg',
        IsActive: true,
    },
    {
        SubcategoryName: 'Shoes',
        CategoryID: new ObjectId('67bd98339496c970d120eb6a'), // Use new ObjectId
        Description: 'Men\'s shoes including sneakers, boots, and formal shoes.',
        ImageURL: 'https://example.com/images/men-shoes.jpg',
        IsActive: true,
    },
    {
        SubcategoryName: 'Accessories',
        CategoryID: new ObjectId('67bd98339496c970d120eb6a'), // Use new ObjectId
        Description: 'Men\'s accessories including belts, watches, and wallets.',
        ImageURL: 'https://example.com/images/men-accessories.jpg',
        IsActive: true,
    },
    {
        SubcategoryName: 'Clothing',
        CategoryID: new ObjectId('67bd98339496c970d120eb6b'), // Use new ObjectId
        Description: 'Women\'s clothing including dresses, tops, and skirts.',
        ImageURL: 'https://example.com/images/women-clothing.jpg',
        IsActive: true,
    },
    {
        SubcategoryName: 'Shoes',
        CategoryID: new ObjectId('67bd98339496c970d120eb6b'), // Use new ObjectId
        Description: 'Women\'s shoes including heels, flats, and sandals.',
        ImageURL: 'https://example.com/images/women-shoes.jpg',
        IsActive: true,
    },
    {
        SubcategoryName: 'Accessories',
        CategoryID: new ObjectId('67bd98339496c970d120eb6b'), // Use new ObjectId
        Description: 'Women\'s accessories including bags, jewelry, and scarves.',
        ImageURL: 'https://example.com/images/women-accessories.jpg',
        IsActive: true,
    },
    {
        SubcategoryName: 'Clothing',
        CategoryID: new ObjectId('67bd98339496c970d120eb6c'), // Use new ObjectId
        Description: 'Children\'s clothing including shirts, pants, and dresses.',
        ImageURL: 'https://example.com/images/children-clothing.jpg',
        IsActive: true,
    },
    {
        SubcategoryName: 'Shoes',
        CategoryID: new ObjectId('67bd98339496c970d120eb6c'), // Use new ObjectId
        Description: 'Children\'s shoes including sneakers and sandals.',
        ImageURL: 'https://example.com/images/children-shoes.jpg',
        IsActive: true,
    },
    {
        SubcategoryName: 'Toys',
        CategoryID: new ObjectId('67bd98339496c970d120eb6c'), // Use new ObjectId
        Description: 'Toys for children of all ages.',
        ImageURL: 'https://example.com/images/children-toys.jpg',
        IsActive: true,
    },
];

// Function to seed subcategories
const seedSubcategories = async () => {
    try {
        // Fetch categories to get their IDs
        const categories = await Category.find({});

        // Map category names to their IDs
        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.CategoryName] = category._id;
        });

        // Assign CategoryID to each subcategory
        subcategories.forEach(subcategory => {
            if (subcategory.SubcategoryName.includes('Men')) {
                subcategory.CategoryID = categoryMap['Men'];
            } else if (subcategory.SubcategoryName.includes('Women')) {
                subcategory.CategoryID = categoryMap['Women'];
            } else if (subcategory.SubcategoryName.includes('Children')) {
                subcategory.CategoryID = categoryMap['Children'];
            }
        });

        await Subcategory.deleteMany({}); // Clear existing subcategories
        const result = await Subcategory.insertMany(subcategories);
        console.log('Subcategories seeded:', result);
    } catch (error) {
        console.error('Error seeding subcategories:', error);
    } finally {
        mongoose.connection.close(); // Close the connection
    }
};

// Run the seeding function
seedSubcategories();