const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter an email address'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // physical data
    gender: { type: String, enum: ['male', 'female'], default: null },
    age: { type: Number, default: null, min: 14 , max: 120 },
    height: { type: Number, default: null, min: 100 , max: 250 },
    startWeight: { type: Number, default: null, min: 30 , max: 300 },
    goalWeight: { type: Number, default: null, min: 30 , max: 300 },

    // Dynamic Nutrition Data
    dailyTargets: {
        calories: { type: Number, default: null },
        protein: { type: Number, default: null },
        carbs: { type: Number, default: null },
        fat: { type: Number, default: null }
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }
    
}, {
    timestamps: true
});

// Middleware: Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method: Create JWT
UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, username: this.username, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
    );
};

// Method: Compare Password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);