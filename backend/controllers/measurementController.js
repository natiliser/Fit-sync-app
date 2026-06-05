const Measurement = require('../models/measurementModel');

const addMeasurement = async (req, res) => {
    try {
        const { weight, waist, neck, hip, date } = req.body;
        console.log(req.user)
        // הדפסה לקונסול כדי שתוכל לראות בדיוק אילו נתונים מגיעים מהטוקן
        console.log("Decoded User from Token:", req.user);

        // משיכה חכמה: בודק את כל האפשרויות הנפוצות לשמירת ID בטוקן
        const userId = req.user.id || req.user.userId || req.user._id; 
        
        // אם עדיין לא מצאנו ID, נעצור פה לפני שמונגו יקרוס
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
        console.error("Error adding measurement:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

const getMeasurementHistory = async (req, res) => {
    try {
        // משיכה חכמה גם כאן
        const userId = req.user.id || req.user.userId || req.user._id; 

        if (!userId) {
             return res.status(401).json({ msg: "User ID not found in token" });
        }

        const measurements = await Measurement.find({ user: userId }).sort({ date: -1 });
        res.status(200).json({ measurements });

    } catch (error) {
        console.error("Error fetching measurement history:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

module.exports = {
    addMeasurement,
    getMeasurementHistory
};