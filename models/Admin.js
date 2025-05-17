const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the Admin schema
const adminSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, max: 25 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    resetPasswordToken: { type: String, default: null }, // Token for password reset
    resetPasswordExpires: { type: Date, default: null }, // Expiration date for the reset token
    adminType: { type: String, required: true, enum: ['superadmin', 'subadmin'] } // New field for admin type
  },
  { timestamps: true }
);

// Hash the password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create a method to compare passwords
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the Admin model
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;