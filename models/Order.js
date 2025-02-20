const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
    orderNumber: { type: String, required: true, unique: true }, // Unique order number
    orderDate: { type: Date, default: Date.now, required: true }, // Date of order placement
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true }
    }],
    subTotal: { type: Number, required: true }, // Total amount before applying coupon
    couponCode: { type: String, default: null }, // Coupon code applied
    couponDetails: { type: Object, default: null }, // Details of the coupon (e.g., discount percentage)
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingAddress', required: true }, // Reference to ShippingAddress
    phoneNumber: { type: String, required: true }, // Customer's phone number
    shippingMethod: { type: String, required: true }, // Shipping method selected
    shippingCharges: { type: Number, required: true }, // Shipping charges
    totalAmount: { type: Number, required: true }, // Total amount after applying coupon and adding shipping charges
    paymentMethod: { type: String, required: true }, // Payment method (e.g., Credit Card, PayPal)
    status: { type: String, default: 'Pending' }, // Order status
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);