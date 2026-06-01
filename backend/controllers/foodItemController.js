const FoodItem = require('../models/foodItemModel');

// Create a new food item (Admin only in the future)
const createFoodItem = async (req, res) => {
    try {
        const foodItem = await FoodItem.create(req.body);
        res.status(201).json({ msg: "Food item created successfully", foodItem });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

// Get all food items for the search/menu
const getAllFoodItems = async (req, res) => {
    try {
        const foodItems = await FoodItem.find({});
        res.status(200).json({ foodItems });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createFoodItem,
    getAllFoodItems
};