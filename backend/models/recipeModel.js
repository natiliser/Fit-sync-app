const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    ingredients: { 
        type: [String], 
        required: true 
    },
    calories: { 
        type: Number, 
        required: true 
    },
    protein: { 
        type: Number, 
        required: true 
    },
    carbs: { 
        type: Number, 
        required: true 
    },
    fat: { 
        type: Number, 
        required: true 
    },
    image: { 
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);