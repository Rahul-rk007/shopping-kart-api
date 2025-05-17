const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const Country = require('../models/Country');

// GET all countries
router.get('/admin', async (req, res) => {
  try {
    const countries = await Country.find(); // Fetch all countries from the database
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching countries', error });
  }
});

// GET a country by ID
router.get('/:id', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id); // Find country by ID
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching country', error });
  }
});

// POST a new country
router.post('/', async (req, res) => {
  const newCountry = new Country(req.body); // Create a new country instance
  try {
    const savedCountry = await newCountry.save(); // Save the country to the database
    res.status(201).json(savedCountry);
  } catch (error) {
    res.status(400).json({ message: 'Error creating country', error });
  }
});

// PUT (edit) a country by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedCountry = await Country.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Update country
    if (!updatedCountry) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.status(200).json(updatedCountry);
  } catch (error) {
    res.status(400).json({ message: 'Error updating country', error });
  }
});

// DELETE a country by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCountry = await Country.findByIdAndDelete(req.params.id); // Delete country
    if (!deletedCountry) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting country', error });
  }
});


module.exports = router;