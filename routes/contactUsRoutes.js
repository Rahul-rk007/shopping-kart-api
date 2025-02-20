const express = require('express');
const nodemailer = require('nodemailer');
const ContactUs = require('../models/ContactUs'); // Optional
const router = express.Router();

// Contact Us API
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // Optional: Save the inquiry to the database
        const contactUsEntry = new ContactUs({ name, email, subject, message });
        await contactUsEntry.save();

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
            from: process.env.EMAIL_USER, // Sender address
            to: email, // User's email address
            subject: `Thank you for contacting us: ${subject}`,
            text: `Hello ${name},\n\nThank you for reaching out to us. We have received your message:\n\n${message}\n\nWe will get back to you shortly.\n\nBest regards,\nYour Company Name`,
        };

        // Send email to the user
        await transporter.sendMail(mailOptions);

        // Optionally, send an email to the admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL, // Admin's email address
            subject: `New Contact Us Inquiry: ${subject}`,
            text: `You have received a new inquiry from ${name} (${email}):\n\n${message}`,
        };

        await transporter.sendMail(adminMailOptions);

        res.status(201).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;