const Recipe = require('../models/recipeModel');
const User = require('../models/userModel');


const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        res.status(200).json({ recipes });
    } catch (error) {
        res.status(500).json({ msg: "Error fetching all recipes!", error: error.message });
    }
};


const addRecipe = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id || req.user.userId;
        const user = await User.findById(userId);

        if (user.role !== 'admin' && user.role !== 'SiteAdmin') {
            return res.status(403).json({ msg: "Access denied. Admin only." });
        }

        const { name, category, ingredients, calories, protein, carbs, fat, image } = req.body;

        if (!name || !category || !ingredients || !calories) {
            return res.status(400).json({ msg: "Please fill all required fields" });
        }

        // In case ingredients are provided as a comma-separated string, convert them into an array
        const ingredientsArray = Array.isArray(ingredients) 
            ? ingredients 
            : ingredients.split(',')
            .map(item => item.trim())
            .filter(item => item !== '');

        const newRecipe = await Recipe.create({
            name,
            category,
            ingredients: ingredientsArray,
            calories,
            protein,
            carbs,
            fat,
            image
        });

        res.status(201).json({ msg: "Recipe published successfully", recipe: newRecipe });
    } catch (error) {
        res.status(500).json({ msg: "Error publishing recipe", error: error.message });
    }
};

// Delete recipe (Admin only)
const deleteRecipe = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id || req.user.userId;
        const user = await User.findById(userId);

        if (user.role !== 'admin') {
            return res.status(403).json({ msg: "Access denied. Admin only." });
        }

        const recipeId = req.params.id;
        await Recipe.findByIdAndDelete(recipeId);

        res.status(200).json({ msg: "Recipe deleted successfully", id: recipeId });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting recipe!", error: error.message });
    }
};

module.exports = { getAllRecipes, addRecipe, deleteRecipe };