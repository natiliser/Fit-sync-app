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
        min: [5, 'calories must be at least 100cm'],
        max: [3000, 'calories must be under 100cm']
    },
    // Protein amount in grams
    protein: {
        type: Number,
        required: [true, 'Please provide protein amount'],
        min: [0, 'protein must be at least 100cm'],
        max: [500, 'protein must be under 100cm']
    },
    // Carbohydrates amount in grams
    carbs: {
        type: Number,
        required: [true, 'Please provide carbs amount'],
        min: [0, 'carbs must be at least 100cm'],
        max: [500, 'carbs must be under 100cm']
    },
    // Fats amount in grams
    fat: {
        type: Number,
        required: [true, 'Please provide fats amount'],
        min: [0, 'fats must be at least 100cm'],
        max: [500, 'fats must be under 100cm']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FoodItem', FoodItemSchema);