const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    SubcategoryName: { type: String, required: true },
    CategoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    Description: { type: String, required: false },
    ImageURL: { type: String, required: false },
    IsActive: { type: Boolean, default: true },
}, { timestamps: true });

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
module.exports = Subcategory;