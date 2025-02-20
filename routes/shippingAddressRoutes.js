const express = require('express');
const ShippingAddress = require('../models/ShippingAddress');
const verifyToken = require('../middleware/auth'); // Assuming you have an authentication middleware

const router = express.Router();

// Get Shipping Addresses List API
router.get('/', verifyToken, async (req, res) => {
    try {
        const shippingAddresses = await ShippingAddress.find({ user: req.user.id });
        res.status(200).json(shippingAddresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Shipping Address Details API
router.get('/:addressId', verifyToken, async (req, res) => {
    const { addressId } = req.params;

    try {
        const shippingAddress = await ShippingAddress.findById(addressId);
        if (!shippingAddress || shippingAddress.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Shipping address not found' });
        }
        res.status(200).json(shippingAddress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;