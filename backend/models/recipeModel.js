const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    // The name of the recipe
    title: {
        type: String,
        required: [true, 'Please provide a recipe title'],
        trim: true
    },
    // Recipe category based on the SRS document
    category: {
        type: String,
        enum: ['High Protein', 'Pre-Workout', 'Post-Workout', 'Recovery', 'General'],
        default: 'General'
    },
    // Preparation time in minutes
    prepTime: {
        type: Number,
        required: [true, 'Please provide preparation time']
    },
    // Array of ingredients needed for the recipe
    ingredients: {
        type: [String],
        required: [true, 'Please provide ingredients']
    },
    // Total calories per serving
    calories: {
        type: Number,
        required: true
    },
    // Difficulty level of preparation
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    }
}, {
    // Automatically creates 'createdAt' and 'updatedAt' fields
    timestamps: true 
});

module.exports = mongoose.model('Recipe', RecipeSchema);