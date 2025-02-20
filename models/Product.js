const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    ProductName: { type: String, required: true },
    SubcategoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
    Price: { type: Number, required: true },
    StockQuantity: { type: Number, required: true },
    Description: { type: String, required: false },
    ImageURLs: [{ type: String, required: false }], // Array of image URLs
    SKU: { type: String, required: true, unique: true },
    IsActive: { type: Boolean, default: true },
    ProductType: { type: String, required: false },
    Brand: { type: String, required: false },       
    Color: { type: String, required: false },       
    Size: { type: String, required: false },
    Featured: { type: Boolean, default: false },    
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;