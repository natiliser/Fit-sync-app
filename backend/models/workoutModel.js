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
        min: [1, 'Duration must be at least 1 minute'] 
    },
    workoutType: { 
        type: String, 
        enum: ['Strength', 'Running', 'Walking', 'Yoga', 'Mixed'], 
        required: true 
    },
    caloriesBurned: { 
        type: Number,
        min: 0
    },
    notes: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);