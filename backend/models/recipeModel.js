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
        required: true,
        min: [5, 'calories must be at least 5g'],
        max: [3000, 'calories must be under 3000g'] 
    },
    protein: { 
        type: Number, 
        required: true,
        min: [0, 'protein must be at least 0g'],
        max: [500, 'protein must be under 500g']  
    },
    carbs: { 
        type: Number, 
        required: true,
        min: [1, 'carbs must be at least 0g'],
        max: [500, 'carbs must be under 500g']
    },
    fat: { 
        type: Number, 
        required: true,
        min: [1, 'fat must be at least 0g'],
        max: [500, 'fat must be under 500g']
    },
    image: { 
        type: String,
        default: ''
    }
}, {
     timestamps: true 
});

module.exports = mongoose.model('Recipe', recipeSchema);