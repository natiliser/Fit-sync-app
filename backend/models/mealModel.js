const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    // The user who logged the meal
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Optional link to the DB item (good for future analytics)
    foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: false 
    },
    // Unified name field 
    name: {
        type: String,
        required: true,
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
        min: [1, 'Quantity must be greater than 0']
    },
    // Nutritional values 
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fat: { type: Number, default: 0, min: 0 },
    
    // The date the meal was consumed
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Meal', MealSchema);