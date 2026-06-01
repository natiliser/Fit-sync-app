const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    // Name of the food item (e.g., "Chicken Breast")
    name: {
        type: String,
        required: [true, 'Please provide food name'],
        unique: true, // Prevents the admin from adding the exact same food twice
        trim: true
    },
    // Calories per 100g or per unit
    calories: {
        type: Number,
        required: [true, 'Please provide calories'],
        min: 0
    },
    // Protein amount in grams
    protein: {
        type: Number,
        required: [true, 'Please provide protein amount'],
        min: 0
    },
    // Carbohydrates amount in grams
    carbs: {
        type: Number,
        required: [true, 'Please provide carbs amount'],
        min: 0
    },
    // Fats amount in grams
    fats: {
        type: Number,
        required: [true, 'Please provide fats amount'],
        min: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FoodItem', FoodItemSchema);