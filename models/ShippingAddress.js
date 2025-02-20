const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true }, // Reference to the User model
    name: { type: String, required: true }, // Name of the recipient
    addressLine1: { type: String, required: true }, // Primary address line
    addressLine2: { type: String, default: null }, // Secondary address line (optional)
    city: { type: String, required: true }, // City
    state: { type: String, required: true }, // State
    postalCode: { type: String, required: true }, // Postal code
    country: { type: String, required: true }, // Country
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

module.exports = mongoose.model('ShippingAddress', shippingAddressSchema);