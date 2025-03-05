const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    countryName: { type: String, required: true, unique: true }, // Name of the country
  },
  { timestamps: true }
);

module.exports = mongoose.model("Country", countrySchema);
