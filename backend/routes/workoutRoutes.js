const express = require('express');
const router = express.Router();
const { addWorkout, getWorkoutsHistory } = require('../controllers/workoutController');
const authMiddleware = require('../middleware/auth');


router.post('/', authMiddleware, addWorkout);
router.get('/', authMiddleware, getWorkoutsHistory);

module.exports = router;