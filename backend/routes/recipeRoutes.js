const express = require('express');
const router = express.Router();
const { getAllRecipes, addRecipe, deleteRecipe } = require('../controllers/recipeController');
const authMiddleware = require('../middleware/auth');

router.get('/', getAllRecipes); // פתוח לכולם (או למחוברים בלבד, לבחירתך)
router.post('/', authMiddleware, addRecipe); // מוגן באימות (הקונטרולר בודק Admin)
router.delete('/:id', authMiddleware, deleteRecipe); // מוגן באימות

module.exports = router;