const Workout = require('../models/workoutModel');
const Measurement = require('../models/measurementModel'); 
const User = require('../models/userModel'); 

// מילון MET (Metabolic Equivalent of Task) לחישוב שריפת קלוריות
const MET_VALUES = {
    'Strength': 3.0, 
    'Running': 9.8,   
    'Walking': 3.8,   
    'Yoga': 3.0,      
    'Mixed': 6.0      
};

const addWorkout = async (req, res) => {
    try {
        const { date, duration, workoutType, caloriesBurned, notes } = req.body;
        const userId = req.user.id || req.user.userId || req.user._id;

        
        if (!duration || !workoutType) {
            return res.status(400).json({ msg: "Duration and workout type are required" });
        }

        let finalCalories = caloriesBurned;

        
        if (!finalCalories) {
            
            const latestMeasurement = await Measurement.findOne({ user: userId }).sort({ date: -1 });
            const userData = await User.findById(userId);
            
            
            const currentWeight = latestMeasurement?.weight || userData?.startWeight || 70;
            
            const metValue = MET_VALUES[workoutType] || 5.0; 
            
            // הנוסחה המדעית לחישוב קלוריות מבוסס MET
            // (MET * 3.5 * weight in kg) / 200 * duration in minutes
            finalCalories = Math.round(((metValue * 3.5 * currentWeight) / 200) * duration);
        }

        const newWorkout = await Workout.create({
            user: userId,
            date: date || Date.now(),
            duration,
            workoutType,
            caloriesBurned: finalCalories,
            notes
        });

        res.status(201).json({
            msg: "Workout added successfully",
            workout: newWorkout
        });

    } catch (error) {
        console.error("Error adding workout:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

const getWorkoutsHistory = async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId || req.user._id;
        
        // שליפת כל האימונים מהחדש לישן
        const workouts = await Workout.find({ user: userId }).sort({ date: -1 });
        
        res.status(200).json({ workouts });

    } catch (error) {
        console.error("Error fetching workouts:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

module.exports = {
    addWorkout,
    getWorkoutsHistory
};