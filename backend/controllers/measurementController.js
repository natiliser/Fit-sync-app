const Measurement = require('../models/measurementModel');

const addMeasurement = async (req, res) => {
    try {
        const { weight, waist, neck, hip, date } = req.body;
        console.log(req.user)

        // Check all common ways the ID is stored in the token
        const userId = req.user.id || req.user.userId || req.user._id; 
        
        // If an ID is still not found, stop here to prevent database errors
        if (!userId) {
            return res.status(401).json({ msg: "User ID not found in token" });
        }

        if (!weight) return res.status(400).json({ msg: "Please provide your current weight" });

        const newMeasurement = await Measurement.create({
            user: userId,
            weight,
            waist,
            neck,
            hip,
            date: date || Date.now() 
        });
        
        res.status(201).json({
            msg: "Measurement added successfully",
            measurement: newMeasurement
        });
    }
    catch (error) {
        res.status(500).json({ msg: "Error adding measurement", error: error.message });
    }
};

const getMeasurementHistory = async (req, res) => {
    try {
        
        const userId = req.user.id || req.user.userId || req.user._id; 

        if (!userId) {
             return res.status(401).json({ msg: "User ID not found in token" });
        }

        const measurements = await Measurement.find({ user: userId }).sort({ date: -1 });
        res.status(200).json({ measurements });

    } catch (error) {
        res.status(500).json({ msg: "Error fetching measurement history", error: error.message });
    }
};

module.exports = {
    addMeasurement,
    getMeasurementHistory
};