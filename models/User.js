const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, max: 25 },
    lastName: { type: String, required: true, max: 25 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true },
    birthdate: { type: Date, default: null }, // Make birthdate optional
    gender: { type: String, default: null }, // Make gender optional
    password: { type: String, required: true, select: false },
    resetPasswordToken: { type: String, default: null }, // Token for password reset
    resetPasswordExpires: { type: Date, default: null } // Expiration date for the reset token
}, { timestamps: true });

// Hash the password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Create a method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User ', userSchema);
module.exports = User;