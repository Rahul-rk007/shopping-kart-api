const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    stateName: { type: String, required: true }, // Name of the state
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    }, // Reference to the Country model
  },
  { timestamps: true }
);

module.exports = mongoose.model("State", stateSchema);
