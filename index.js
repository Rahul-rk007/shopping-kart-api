const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Import category routes
const subcategoryRoutes = require('./routes/subcategoryRoutes'); // Import subcategory routes
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shippingAddressRoutes = require('./routes/shippingAddressRoutes');
const contactUsRoutes = require('./routes/contactUsRoutes');
const connectDB = require('./config/db'); // Import the database connection
require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your React app
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    credentials: true // Allow credentials (if needed)
}));

// Connect to MongoDB
connectDB(); // Call the connectDB function

// Use user routes
app.use('/api/user', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subcategoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/shipping-addresses', shippingAddressRoutes);
app.use('/api/contact', contactUsRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});