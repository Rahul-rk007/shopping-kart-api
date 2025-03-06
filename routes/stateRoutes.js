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

module.exports = router;
