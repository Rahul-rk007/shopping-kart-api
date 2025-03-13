const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Add to Cart API
router.post("/", verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({ user: req.userId, products: [] });
    }

    // Check if the product is already in the cart
    const existingProduct = cart.products.find(
      (item) => item.product.toString() === productId
    );
    if (existingProduct) {
      // Update the quantity if the product is already in the cart
      existingProduct.quantity += quantity;
    } else {
      // Add the new product to the cart with price and image
      cart.products.push({
        product: productId,
        productName: product.ProductName,
        quantity,
        price: product.Price, // Assuming product has a price field
        image: product.ImageURLs[0], // Assuming product has an image field
      });
    }

    // Calculate the total amount
    cart.cartTotal = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Save the cart
    await cart.save();
    res
      .status(200)
      .json({ cart, message: "Product added to cart successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Cart API
router.get("/", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate({
      path: "products.product",
      select: "ProductName Price",
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const domain = `${req.protocol}://${req.get("host")}/uploads/products/`;

    // Map through the products to update the image URLs
    const updatedProducts = cart.products.map((item) => {
      return {
        ...item.toObject(), // Convert mongoose document to plain object
        image: `${domain}${item.image}`, // Append the domain URL to the image filename
      };
    });

    // Return the cart with updated products
    res.status(200).json({
      ...cart.toObject(), // Convert cart to a plain object
      products: updatedProducts, // Replace products with the new array
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete from Cart API
router.delete("/remove/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the product from the cart
    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    // Recalculate the cart total
    cart.cartTotal = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    res
      .status(200)
      .json({ message: "Product removed from cart successfully!", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Increase product quantity in the cart
router.patch("/increase/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const product = cart.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Increase the quantity
    product.quantity += 1;

    // Recalculate the cart total
    cart.cartTotal = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json({ message: "Product quantity increased", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Decrease product quantity in the cart
router.patch("/decrease/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;
  console.log("====>", req.params);

  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const product = cart.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Decrease the quantity
    if (product.quantity > 1) {
      product.quantity -= 1;
    } else {
      // If quantity is 1, remove the product from the cart
      cart.products = cart.products.filter(
        (item) => item.product.toString() !== productId
      );
    }

    // Recalculate the cart total
    cart.cartTotal = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json({ message: "Product quantity decreased", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Clear Cart API
router.delete("/clear", verifyToken, async (req, res) => {
  try {
    console.log(req.userId);

    const result = await Cart.deleteOne({ user: req.userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart cleared successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
