const Recipe = require('../models/recipeModel');

// Create a new recipe (Admin only in the future)
const createRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.create(req.body);
        res.status(201).json({ msg: "Recipe created successfully", recipe });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

// Get all recipes based on categories
const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({});
        res.status(200).json({ recipes });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createRecipe,
    getAllRecipes
};