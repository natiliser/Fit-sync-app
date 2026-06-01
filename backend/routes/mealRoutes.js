const express = require('express');
const router = express.Router();

// Import the authentication middleware
const authMiddleware = require('../middleware/auth');

// Import all controller functions
const { createMeal, getAllMeals, getTodaySummary } = require('../controllers/mealController');

// Define the route for today's summary (Protected)
router.get('/today', authMiddleware, getTodaySummary);

// Define standard routes for /meals (Protected)
// Added authMiddleware here to fix the 500 Internal Server Error
router.route('/')
    .post(authMiddleware, createMeal)
    .get(authMiddleware, getAllMeals);

module.exports = router;