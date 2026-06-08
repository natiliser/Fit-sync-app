const express = require('express');
const router = express.Router();
const { getAllFoodItems, addFoodItem, deleteFoodItem } = require('../controllers/foodItemController');
const authMiddleware = require('../middleware/auth');

// Define routes for /food-items
router.get('/', getAllFoodItems);
router.post('/', authMiddleware, addFoodItem);
router.delete('/:id', authMiddleware, deleteFoodItem);

module.exports = router;