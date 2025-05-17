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

router.get('/', async (req, res) => {
    try {
        const messages = await ContactUs.find(); // Fetch all messages from the database
        res.status(200).json(messages); // Return the messages as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch a single Contact Us inquiry by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Received ID:', id);
    try {
        // Find the inquiry by ID
        const message = await ContactUs.findById(id);

        if (!message) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.status(200).json(message); // Return the message as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a Contact Us inquiry by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Find the inquiry by ID and delete it
        const result = await ContactUs.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.status(200).json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;