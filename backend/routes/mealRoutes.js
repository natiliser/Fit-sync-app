const express = require('express');
const router = express.Router();
const { createMeal, getAllMeals } = require('../controllers/mealController');

// Define routes for /meals
router.route('/')
    .post(createMeal)
    .get(getAllMeals);

module.exports = router;