const mongoose = require("mongoose");
const Country = require("../models/Country"); // Adjust the path as necessary
const State = require("../models/State"); // Adjust the path as necessary

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/shopping-kart", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    // Clear existing countries and states
    await State.deleteMany();
    await Country.deleteMany();

    // Define the nested structure
    const countryStateData = [
      {
        countryName: "India",
        states: [
          "Andhra Pradesh",
          "Arunachal Pradesh",
          "Assam",
          "Bihar",
          "Chhattisgarh",
          "Goa",
          "Gujarat",
          "Haryana",
          "Himachal Pradesh",
          "Jharkhand",
          "Karnataka",
          "Kerala",
          "Madhya Pradesh",
          "Maharashtra",
          "Manipur",
          "Meghalaya",
          "Mizoram",
          "Nagaland",
          "Odisha",
          "Punjab",
          "Rajasthan",
          "Sikkim",
          "Tamil Nadu",
          "Telangana",
          "Tripura",
          "Uttar Pradesh",
          "Uttarakhand",
          "West Bengal",
        ],
      },
      {
        countryName: "USA",
        states: ["California", "Texas"],
      },
      {
        countryName: "Canada",
        states: ["Ontario", "British Columbia"],
      },
      {
        countryName: "Australia",
        states: ["New South Wales", "Victoria"],
      },
    ];

    // Insert countries and states into the database
    for (const countryData of countryStateData) {
      const country = await Country.create({
        countryName: countryData.countryName,
      });

      const states = countryData.states.map((stateName) => ({
        stateName,
        countryId: country._id,
      }));

      await State.insertMany(states);
    }

    console.log("Countries and states added successfully!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error(err);
    mongoose.connection.close();
  });
