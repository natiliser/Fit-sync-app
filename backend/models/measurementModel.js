const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        type: Number,
        required: [true, 'Please provide your current weight'],
        min: [30, 'Weight must be at least 30kg' ],
        max: [300, 'Weight must be under 300kg' ]
    },
    //מוֹתן
    waist: { 
        type: Number, 
        required: false,
        min: [40, 'Waist measurement must be at least 40cm'],
        max: [200, 'Waist must be under 300cm' ]
    },
    //צוור
    neck: { 
        type: Number, 
        required: false,
        min: [25, 'Neck measurement must be at least 25cm'],
        max: [100, 'Neck must be under 100cm']
    },
    //ירך
    hip: { 
        type: Number, 
        required: false,
        min: [60, 'Hip measurement must be at least 60cm'],
        max: [250, 'Neck must be under 250cm']
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Measurement', MeasurementSchema);