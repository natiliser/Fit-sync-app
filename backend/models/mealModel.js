const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    // The user who logged the meal (Links to the User collection)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The specific food item selected from the database (Links to the FoodItem collection)
    foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        // Optional, because the user might enter a manual item instead
        required: false 
    },
    // Allows the user to type a food name manually if it's not in the DB
    manualFoodName: {
        type: String,
        trim: true
    },
    // Type of meal 
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        default: 'Snack'
    },
    // Quantity consumed (in grams or units)
    quantity: {
        type: Number,
        required: [true, 'Please provide the quantity'],
        // Prevents users from entering 0 or negative numbers, as required by SUC-6
        min: [1, 'Quantity must be greater than 0']
    },
    // Calculated nutritional values for this specific portion (Quantity * Base Values)
    totalCalories: {
        type: Number,
        required: true,
        min: 0
    },
    totalProtein: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    totalCarbs: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    totalFats: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    // The date the meal was consumed
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Meal', MealSchema);