const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    duration: { 
        type: Number, 
        required: true,
        min: [1, 'Duration must be at least 1 minute'],
        max: [600, 'Duration must be under 600 minutes']
    },
    workoutType: { 
        type: String, 
        enum: ['Strength', 'Running', 'Walking', 'Yoga', 'Mixed'], 
        required: true 
    },
    caloriesBurned: { 
        type: Number,
        min: [1, 'caloriesBurned must be at least 1 minute'],
        max: [5000, 'caloriesBurned must be under 600 minutes']
    },
    notes: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);