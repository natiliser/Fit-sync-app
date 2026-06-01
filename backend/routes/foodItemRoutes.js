const express = require('express');
const router = express.Router();
const { createFoodItem, getAllFoodItems } = require('../controllers/foodItemController');

// Define routes for /food-items
router.route('/')
    .post(createFoodItem)
    .get(getAllFoodItems);

module.exports = router;