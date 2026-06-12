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
        min: [30, 'Weight must be realistic at least 30kg)' ]
    },
    //מוֹתן
    waist: { 
        type: Number, 
        required: false,
        min: [40, 'Waist measurement must be at least 40cm']
    },
    //צוור
    neck: { 
        type: Number, 
        required: false,
        min: [25, 'Neck measurement must be at least 25cm']
    },
    //ירך
    hip: { 
        type: Number, 
        required: false,
        min: [60, 'Hip measurement must be at least 60cm']
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Measurement', MeasurementSchema);