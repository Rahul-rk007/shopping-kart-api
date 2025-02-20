const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    CategoryName: { type: String, required: true },
    Description: { type: String, required: true },
    ImageURL: { type: String, required: false },
    IsActive: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;