const Meal = require('../models/mealModel');

// Log a new meal for a user
const createMeal = async (req, res) => {
    try {
        const meal = await Meal.create(req.body);
        res.status(201).json({ msg: "Meal logged successfully", meal });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

// Get all meals (Later we will filter this by specific user ID and date)
const getAllMeals = async (req, res) => {
    try {
        const meals = await Meal.find({});
        res.status(200).json({ meals });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createMeal,
    getAllMeals
};