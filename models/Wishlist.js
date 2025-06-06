const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User ",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Added price
        image: { type: String, required: true }, // Added image URL
      },
    ],
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);