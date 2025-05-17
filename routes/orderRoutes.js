const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const ShippingAddress = require("../models/ShippingAddress");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Checkout API
router.post("/checkout", verifyToken, async (req, res) => {
  const {
    shippingAddressId,
    shippingAddress,
    paymentMethod,
    couponCode,
    couponDetails,
    phoneNumber,
    shippingMethod,
    shippingCharges, // This may be a string
  } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const subTotal = cart.cartTotal;

    let shippingAddressIdToUse;

    if (shippingAddressId) {
      const existingShippingAddress = await ShippingAddress.findById(
        shippingAddressId
      );
      if (
        !existingShippingAddress ||
        existingShippingAddress.user.toString() !== req.userId
      ) {
        return res.status(400).json({ message: "Invalid shipping address" });
      }
      shippingAddressIdToUse = existingShippingAddress._id;
    } else if (shippingAddress) {
      const newShippingAddress = new ShippingAddress({
        user: req.userId,
        ...shippingAddress,
      });
      await newShippingAddress.save();
      shippingAddressIdToUse = newShippingAddress._id;
    } else {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // Convert shippingCharges to a number
    const shippingChargesValue = parseFloat(shippingCharges);
    if (isNaN(shippingChargesValue)) {
      return res.status(400).json({ message: "Invalid shipping charges" });
    }

    let totalAmount = subTotal + shippingChargesValue; // Use the converted shipping charges

    // Apply coupon discount if applicable
    if (couponDetails && couponDetails.value) {
      let discountAmount;
      const couponValue = parseFloat(couponDetails.value); // Convert to float

      if (isNaN(couponValue)) {
        return res.status(400).json({ message: "Invalid coupon value" });
      }
      if (couponDetails.type === "percentage") {
        discountAmount = (subTotal * couponValue) / 100;
      } else if (couponDetails.type === "amount") {
        discountAmount = couponValue;
      }
      totalAmount -= discountAmount; // Subtract discount from total amount
    }

    const order = new Order({
      user: req.userId,
      orderNumber: `ORD-${Date.now()}`,
      products: cart.products,
      subTotal: subTotal,
      couponCode: couponCode || null,
      couponDetails: couponDetails || null,
      shippingAddress: shippingAddressIdToUse,
      phoneNumber: phoneNumber,
      shippingMethod: shippingMethod,
      shippingCharges: shippingChargesValue, // Store the numeric value
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
    });

    await order.save();

    // Clear the cart after successful checkout
    await Cart.deleteOne({ user: req.userId });

    res.status(201).json({ message: "Your order placed successfully!", order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try after sometime." });
  }
});

// Get My Orders API
router.get("/list", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("products.product")
      .populate("shippingAddress"); // Populate shipping address details
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Order Details API
router.get("/detail/:orderId", verifyToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId)
      .populate("products.product")
      .populate("shippingAddress"); // Populate shipping address details

    if (!order || order.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Map through the products to include image URLs
    const productsWithImageUrls = order.products.map((item) => {
      const product = item.product; // Get the populated product
      // console.log("od==>",item)
      return {
        quantity: item.quantity,
        price: item.price,
        ProductName: product.ProductName,
        ImageURLs: product.ImageURLs.map((image) => {
          // Construct the full URL for each image
          return `${req.protocol}://${req.get("host")}/uploads/products/${image}`;
        }),
      };
    });

    // Return the order with products including image URLs
    const responseOrder = {
      ...order.toObject(), // Convert order to plain object
      products: productsWithImageUrls, // Replace products with the new array
    };

    res.status(200).json(responseOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Order API
router.delete("/:orderId", verifyToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Delete the order
    await Order.deleteOne({ _id: orderId });
    res.status(200).json({ message: "Order deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:orderId/cancel", verifyToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status to 'canceled'
    order.status = 'canceled'; // Assuming 'status' is the field that holds the order status
    await order.save();

    res.status(200).json({ message: "Order canceled successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.product")
      .populate("shippingAddress"); 
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



// Update Order Status API (Public)
router.patch("/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // Expecting the new status in the request body

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate the new status
    const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully!", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get Order Details API (Public)
router.get("/admin/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId)
      .populate("products.product")
      .populate("shippingAddress"); // Populate shipping address details

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Map through the products to include image URLs
    const productsWithImageUrls = order.products.map((item) => {
      const product = item.product; // Get the populated product
      return {
        quantity: item.quantity,
        price: item.price,
        ProductName: product.ProductName,
        ImageURLs: product.ImageURLs.map((image) => {
          // Construct the full URL for each image
          return `${req.protocol}://${req.get("host")}/uploads/products/${image}`;
        }),
      };
    });

    // Return the order with products including image URLs
    const responseOrder = {
      ...order.toObject(), // Convert order to plain object
      products: productsWithImageUrls, // Replace products with the new array
    };

    res.status(200).json(responseOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
