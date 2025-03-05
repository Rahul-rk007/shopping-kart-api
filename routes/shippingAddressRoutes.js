const express = require("express");
const ShippingAddress = require("../models/ShippingAddress");
const verifyToken = require("../middleware/auth"); // Assuming you have an authentication middleware
const State = require("../models/State"); // Adjust the path as necessary
const Country = require("../models/Country"); // Adjust the path as necessary

const router = express.Router();

// Get Shipping Addresses List API
router.get("/", verifyToken, async (req, res) => {
  try {
    const shippingAddresses = await ShippingAddress.find({ user: req.user.id })
      .populate("state", "stateName") // Populate state name
      .populate("country", "countryName"); // Populate country name
    res.status(200).json(shippingAddresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Shipping Address Details API
router.get("/:addressId", verifyToken, async (req, res) => {
  const { addressId } = req.params;

  try {
    const shippingAddress = await ShippingAddress.findById(addressId)
      .populate("state", "stateName") // Populate state name
      .populate("country", "countryName"); // Populate country name
    if (!shippingAddress || shippingAddress.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Shipping address not found" });
    }
    res.status(200).json(shippingAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add Shipping Address API
router.post("/", verifyToken, async (req, res) => {
  const {
    fullName,
    phoneNumber,
    address1,
    address2,
    city,
    state, // This should be the ObjectId of the state
    zipCode,
    country, // This should be the ObjectId of the country
    defaultAddress,
  } = req.body;

  // Validate the input
  if (
    !fullName ||
    !phoneNumber ||
    !address1 ||
    !city ||
    !state || // Ensure state is provided
    !zipCode ||
    !country // Ensure country is provided
  ) {
    return res
      .status(400)
      .json({ message: "All fields except address2 are required" });
  }

  try {
    // Create a new shipping address
    const newShippingAddress = new ShippingAddress({
      user: req.user.id, // Set the user from the token
      fullName,
      phoneNumber,
      address1,
      address2,
      city,
      state, // Use the ObjectId for state
      zipCode,
      country, // Use the ObjectId for country
      defaultAddress: defaultAddress || false, // Set defaultAddress if provided, otherwise false
    });

    // Save the shipping address to the database
    const savedAddress = await newShippingAddress.save();
    res.status(201).json(savedAddress); // Respond with the created address
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
