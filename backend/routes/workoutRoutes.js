const express = require('express');
const router = express.Router();
const { createWorkout, getAllWorkouts } = require('../controllers/workoutController');

// Define routes for /workouts
router.route('/')
    .post(createWorkout)
    .get(getAllWorkouts);

module.exports = router;