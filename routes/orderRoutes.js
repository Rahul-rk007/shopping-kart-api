const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const ShippingAddress = require('../models/ShippingAddress');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Checkout API
router.post('/checkout', verifyToken, async (req, res) => {
    const {
        shippingAddressId, // ID of the existing shipping address (optional)
        shippingAddress, // New shipping address details (optional)
        paymentMethod,
        couponCode,
        couponDetails,
        phoneNumber,
        shippingMethod,
        shippingCharges // New field for shipping charges
    } = req.body;

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate subtotal
        const subTotal = cart.cartTotal; // Assuming cartTotal is the subtotal before any discounts

        let shippingAddressIdToUse;

        // Check if an existing shipping address ID is provided
        if (shippingAddressId) {
            // Validate the existing shipping address
            const existingShippingAddress = await ShippingAddress.findById(shippingAddressId);
            if (!existingShippingAddress || existingShippingAddress.user.toString() !== req.user.id) {
                return res.status(400).json({ message: 'Invalid shipping address' });
            }
            shippingAddressIdToUse = existingShippingAddress._id; // Use the existing shipping address ID
        } else if (shippingAddress) {
            // Create a new shipping address if no ID is provided
            const newShippingAddress = new ShippingAddress({
                user: req.user.id,
                ...shippingAddress // Spread the shipping address fields
            });

            // Save the new shipping address
            await newShippingAddress.save();
            shippingAddressIdToUse = newShippingAddress._id; // Use the new shipping address ID
        } else {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        // Calculate total amount
        let totalAmount = subTotal + shippingCharges; // Start with subtotal and add shipping charges

        // Apply coupon discount if applicable
        if (couponDetails && couponDetails.discount) {
            const discountAmount = (subTotal * couponDetails.discount) / 100; // Assuming discount is a percentage
            totalAmount -= discountAmount; // Subtract discount from total amount
        }

        // Create a new order
        const order = new Order({
            user: req.user.id,
            orderNumber: `ORD-${Date.now()}`, // Generate a unique order number
            products: cart.products,
            subTotal: subTotal,
            couponCode: couponCode || null,
            couponDetails: couponDetails || null,
            shippingAddress: shippingAddressIdToUse, // Reference to the shipping address
            phoneNumber: phoneNumber,
            shippingMethod: shippingMethod,
            shippingCharges: shippingCharges,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
        });

        // Save the order
        await order.save();

        // Clear the cart after successful checkout
        await Cart.deleteOne({ user: req.user.id });

        res.status(201).json({ message: 'Order placed successfully!', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get My Orders API
router.get('/', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('products.product')
            .populate('shippingAddress'); // Populate shipping address details
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Order Details API
router.get('/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId)
            .populate('products.product')
            .populate('shippingAddress'); // Populate shipping address details

        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Order API
router.delete('/:orderId', verifyToken, async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Delete the order
        await Order.deleteOne({ _id: orderId });
        res.status(200).json({ message: 'Order deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;