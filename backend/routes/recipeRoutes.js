const express = require('express');
const router = express.Router();
const { createRecipe, getAllRecipes } = require('../controllers/recipeController');

// Define routes for /recipes
router.route('/')
    .post(createRecipe)
    .get(getAllRecipes);

module.exports = router;