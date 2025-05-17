const express = require("express");
const ShippingAddress = require("../models/ShippingAddress");
const verifyToken = require("../middleware/auth"); // Assuming you have an authentication middleware
const State = require("../models/State"); // Adjust the path as necessary
const Country = require("../models/Country"); // Adjust the path as necessary

const router = express.Router();

// Get Shipping Addresses List API
router.get("/", verifyToken, async (req, res) => {
  try {
    const shippingAddresses = await ShippingAddress.find({ user: req.userId })
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
  console.log(req.body);

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
      user: req.userId, // Set the user from the token
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

// Edit Shipping Address API
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
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
    // Find the shipping address by ID
    const shippingAddress = await ShippingAddress.findById(id);

    // Check if the address exists and belongs to the user
    if (!shippingAddress || shippingAddress.user.toString() !== req.userId) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    // Update the shipping address with new data
    shippingAddress.fullName = fullName;
    shippingAddress.phoneNumber = phoneNumber;
    shippingAddress.address1 = address1;
    shippingAddress.address2 = address2;
    shippingAddress.city = city;
    shippingAddress.state = state; // Use the ObjectId for state
    shippingAddress.zipCode = zipCode;
    shippingAddress.country = country; // Use the ObjectId for country
    shippingAddress.defaultAddress = defaultAddress || false; // Update defaultAddress if provided

    // Save the updated shipping address to the database
    const updatedAddress = await shippingAddress.save();
    res.status(200).json(updatedAddress); // Respond with the updated address
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Shipping Address API
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the shipping address exists and belongs to the user
    const shippingAddress = await ShippingAddress.findOne({
      _id: id,
      user: req.userId,
    });

    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    // Delete the shipping address
    await ShippingAddress.deleteOne({ _id: id });

    res.status(200).json({ message: "Shipping address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// router.get("/:userId", async (req, res) => {
//   try {
//     const shippingAddresses = await ShippingAddress.find({ user: req.params.userId })
//       .populate("state", "stateName") // Populate state name
//       .populate("country", "countryName"); // Populate country name
//     res.status(200).json(shippingAddresses);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// Get ALL Shipping Addresses (No Authentication - Admin Only)
router.get("/admin/all-addresses", async (req, res) => {
  try {
    const shippingAddresses = await ShippingAddress.find()
      .populate("state", "stateName")
      .populate("country", "countryName");
    
    res.status(200).json(shippingAddresses);
  } catch (error) {
    console.error("Error fetching all addresses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Shipping Address API without token
router.delete("/admin/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the shipping address exists
    const shippingAddress = await ShippingAddress.findById(id);

    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    // Delete the shipping address
    await ShippingAddress.deleteOne({ _id: id });

    res.status(200).json({ message: "Shipping address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Shipping Address Details API without token
router.get("/admin/:addressId", async (req, res) => {
  const { addressId } = req.params;

  try {
    const shippingAddress = await ShippingAddress.findById(addressId)
      .populate("state", "stateName") // Populate state name
      .populate("country", "countryName"); // Populate country name

    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }
    res.status(200).json(shippingAddress);
    console.log(shippingAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Shipping Address API without token
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
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
    // Find the shipping address by ID
    const shippingAddress = await ShippingAddress.findById(id);

    // Check if the address exists
    if (!shippingAddress) {
      return res.status(404).json({ message: "Shipping address not found" });
    }

    // Update the shipping address with new data
    shippingAddress.fullName = fullName;
    shippingAddress.phoneNumber = phoneNumber;
    shippingAddress.address1 = address1;
    shippingAddress.address2 = address2;
    shippingAddress.city = city;
    shippingAddress.state = state; // Use the ObjectId for state
    shippingAddress.zipCode = zipCode;
    shippingAddress.country = country; // Use the ObjectId for country
    shippingAddress.defaultAddress = defaultAddress || false; // Update defaultAddress if provided

    // Save the updated shipping address to the database
    const updatedAddress = await shippingAddress.save();
    res.status(200).json(updatedAddress); // Respond with the updated address
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
