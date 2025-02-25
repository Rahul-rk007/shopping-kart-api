const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating reset tokens

const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

// Signup Endpoint
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, mobileNumber, password } = req.body;
    try {
        const newUser  = new User({ firstName, lastName, email, mobileNumber, password });
        await newUser .save();

        // Create a token
        const token = jwt.sign({ id: newUser ._id, firstName, lastName, email, mobileNumber }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User  registered successfully', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(404).json({ message: 'User  not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, mobileNumber: user.mobileNumber }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User  not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Profile
router.put('/profile', verifyToken, async (req, res) => {
    const { firstName, lastName, mobileNumber, birthdate, gender } = req.body;
    try {
        const updatedUser  = await User.findByIdAndUpdate(req.userId, { firstName, lastName, mobileNumber, birthdate, gender }, { new: true });
        res.status(200).json(updatedUser );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User  not found' });

        // Generate a reset token
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Set up Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email service
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `http://localhost:5000/api/users/reset-password/${token}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset Password Endpoint
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Check if the token is still valid
        });

        if (!user) return res.status(400).json({ message: 'Password reset token is invalid or has expired' });

        // Hash the new password
        user.password = password;
        user.resetPasswordToken = null; // Clear the reset token
        user.resetPasswordExpires = null; // Clear the expiration date

        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change Password Endpoint
router.put('/change-password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.userId).select('+password');
        if (!user) return res.status(404).json({ message: 'User  not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        // Hash the new password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password has been changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;