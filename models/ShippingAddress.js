const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User ",
      required: true,
    }, // Reference to the User model
    fullName: { type: String, required: true }, // Full name of the recipient
    phoneNumber: { type: String, required: true }, // Phone number of the recipient
    address1: { type: String, required: true }, // Primary address line
    address2: { type: String, default: null }, // Secondary address line (optional)
    city: { type: String, required: true }, // City
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    }, // Reference to the State model
    zipCode: { type: String, required: true }, // Zip code
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    }, // Reference to the Country model
    defaultAddress: { type: Boolean, default: false }, // Flag for default address
  },
  { timestamps: true }
); // Automatically manage createdAt and updatedAt fields

module.exports = mongoose.model("ShippingAddress", shippingAddressSchema);
