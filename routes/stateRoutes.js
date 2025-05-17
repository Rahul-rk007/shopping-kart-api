const express = require("express");
const Country = require("../models/Country"); // Adjust the path as necessary
const State = require("../models/State"); // Adjust the path as necessary

const router = express.Router();

// Get all countries API
router.get("/countries", async (req, res) => {
  try {
    const countries = await Country.find();
    res.status(200).json(countries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get states by country ID API
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const states = await State.find({ countryId: id });
    res.status(200).json(states);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



// Get all states API
router.get("/admin/states", async (req, res) => {
  try {
    const states = await State.find();
    res.status(200).json(states);
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ message: "Server error while fetching states" });
  }
});

// Get a state by ID API
router.get("/admin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    res.status(200).json(state);
  } catch (error) {
    console.error("Error fetching state:", error);
    res.status(500).json({ message: "Server error while fetching state" });
  }
});

// Get states by country ID API
router.get("/:countryId", async (req, res) => {
  const { countryId } = req.params;
  if (!countryId) {
    return res.status(400).json({ message: "Country ID is required" });
  }
  try {
    const states = await State.find({ countryId: countryId });
    if (states.length === 0) {
      return res.status(404).json({ message: "No states found for this country" });
    }
    res.status(200).json(states);
  } catch (error) {
    console.error("Error fetching states by country ID:", error);
    res.status(500).json({ message: "Server error while fetching states by country ID" });
  }
});

// Add a new state API
router.post("/admin", async (req, res) => {
  const newState = new State(req.body);
  try {
    const savedState = await newState.save();
    res.status(201).json(savedState);
  } catch (error) {
    console.error("Error creating state:", error);
    res.status(400).json({ message: "Error creating state" });
  }
});

// Update a state by ID API
router.put("/admin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedState = await State.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedState) {
      return res.status(404).json({ message: "State not found" });
    }
    res.status(200).json(updatedState);
  } catch (error) {
    console.error("Error updating state:", error);
    res.status(400).json({ message: "Error updating state" });
  }
});

// Delete a state by ID API
router.delete("/admin/states/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedState = await State.findByIdAndDelete(id);
    res.status(200).json({ message: "State deleted successfully" });
  } catch (error) {
    console.error("Error deleting state:", error);
    res.status(500).json({ message: "Server error while deleting state" });
  }
});

module.exports = router;
