const Workout = require('../models/workoutModel');

// Log a new workout for a user
const createWorkout = async (req, res) => {
    try {
        const workout = await Workout.create(req.body);
        res.status(201).json({ msg: "Workout logged successfully", workout });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

// Get all workouts (Later we will filter this by specific user ID)
const getAllWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({});
        res.status(200).json({ workouts });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createWorkout,
    getAllWorkouts
};