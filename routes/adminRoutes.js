const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Adjust the path as necessary
const router = express.Router();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const verifyAdminToken = require('../middleware/adminAuth')
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // For sending emails
dotenv.config();


// Register a new admin
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, mobileNumber, gender, password, adminType } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).send("Admin already exists");
    }


    const newAdmin = new Admin({ 
      firstName, 
      lastName, 
      email, 
      mobileNumber, 
      gender, 
      password, // Save the hashed password
      adminType 
    });
    await newAdmin.save();

    // Create a token
    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email, adminType: newAdmin.adminType },
      process.env.JWT_ADMIN_SECRET, // Use the appropriate secret for admin
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Admin registered successfully", token });
  } catch (error) {
    res.status(500).send("Server error");
  }
});
// Login admin
router.post("/login", async (req, res) => {
  const { email, password, adminType } = req.body; // Include adminType in the request body

  try {
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the admin type matches
    if (admin.adminType !== adminType) {
      return res.status(400).json({ message: "Invalid admin type" });
    }

    // Create a token with admin details
    const token = jwt.sign(
      {
        admin: {
          id: admin._id,
          email: admin.email,
          adminType: admin.adminType, // Include adminType in the token payload
        },
      },
      process.env.JWT_ADMIN_SECRET, // Use the appropriate secret for admin
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// // Get admin profile (protected route)
// router.get("/profile", verifyAdminToken, async (req, res) => {
//   try {
//     const admin = await Admin.findById(req.adminId).select("-password");
//     if (!admin) {
//       return res.status(404).send("Admin not found");
//     }
//     res.status(200).json(admin);
//   } catch (error) {
//     res.status(500).send("Server error");
//   }
// });


// Get admin profile (protected route)
router.get("/profile", verifyAdminToken, async (req, res) => {
  try {
    console.log("Admin ID:", req.adminId); // Log the admin ID for debugging

    // Validate the admin ID
    if (!mongoose.Types.ObjectId.isValid(req.adminId)) {
      return res.status(400).send("Invalid admin ID");
    }

    const admin = await Admin.findById(req.adminId).select("-password");
    console.log(admin);
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin:", error); // Log the error for debugging
    res.status(500).send("Server error");
  }
});




// Get all admins (public route)
router.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find().select("-password"); // Exclude password from the response
    console.log(admins);
    res.status(200).json(admins);
   
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Delete an admin by ID (public route)
router.delete("/admins/:id", async (req, res) => {
  const { id } = req.params; // Get the admin ID from the request parameters

  try {
    const admin = await Admin.findByIdAndDelete(id); // Find and delete the admin by ID
    if (!admin) {
      return res.status(404).send("Admin not found"); // Handle case where admin does not exist
    }
    res.status(200).send("Admin deleted successfully"); // Send success response
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).send("Server error"); // Handle server error
  }
});

// Update an admin by ID (public route)
router.put("/admins/:id", async (req, res) => {
  const { id } = req.params; // Get the admin ID from the request parameters
  const { firstName, lastName, email, mobileNumber, gender, password, adminType } = req.body; // Destructure the request body

  try {
    // Find the admin by ID and update their details
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { firstName, lastName, email, mobileNumber, gender, password, adminType },
      { new: true, runValidators: true } // Options: return the updated document and run validators
    );

    if (!updatedAdmin) {
      return res.status(404).send("Admin not found"); // Handle case where admin does not exist
    }

    res.status(200).json(updatedAdmin); // Send the updated admin details as a response
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).send("Server error"); // Handle server error
  }
});


// Get an admin by ID (public route)
router.get("/admins/:id", async (req, res) => {
  const { id } = req.params; // Get the admin ID from the request parameters

  try {
    const admin = await Admin.findById(id).select("-password"); // Find the admin by ID and exclude the password
    if (!admin) {
      return res.status(404).send("Admin not found"); // Handle case where admin does not exist
    }
    res.status(200).json(admin); // Send the admin details as a response
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).send("Server error"); // Handle server error
  }
});



// Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Generate a reset token
    const token = crypto.randomBytes(20).toString("hex");
    admin.resetPasswordToken = token;
    console.log(token);
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await admin.save();

    // Set up Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
            `http://localhost:5173/reset-password/${token}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    // await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password Endpoint
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check token validity
    });

    if (!admin)
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });

    // Update password - the adminSchema pre 'save' middleware will hash this
    admin.password = password;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;

    await admin.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the router
module.exports = router;