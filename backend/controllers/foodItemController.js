const FoodItem = require('../models/foodItemModel');
const User = require('../models/userModel');


const getAllFoodItems = async (req, res) => {
    try {
        const foodItems = await FoodItem.find().sort({ name: 1 });
        res.status(200).json({ foodItems });
    } catch (error) {
        res.status(500).json({ msg: "Error fetching all food items", error: error.message });
    }
};


const addFoodItem = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id || req.user.userId;
        const user = await User.findById(userId);

        if (user.role !== 'admin') {
            return res.status(403).json({ msg: "Access denied. Admin only." });
        }

        const { name, calories, protein, carbs, fat } = req.body;

        if (!name || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
            return res.status(400).json({ msg: "Please fill all required fields" });
        }

        // Using RegEx to ensure duplicate items
        const existingItem = await FoodItem.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingItem) {
            return res.status(409).json({ msg: "This food item already exists" }); 
        }

        const newFoodItem = await FoodItem.create({
            name, calories, protein, carbs, fat
        });

        res.status(201).json({ msg: "Food item successfully added", foodItem: newFoodItem });
    } catch (error) {
        res.status(500).json({ msg: "Error adding food item", error: error.message });
    }
};


const deleteFoodItem = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id || req.user.userId;
        const user = await User.findById(userId);

        if (user.role !== 'admin') {
            return res.status(403).json({ msg: "Access denied. Admin only." });
        }

        await FoodItem.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: "Food item deleted successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting food item", error: error.message });
    }
};

module.exports = { getAllFoodItems, addFoodItem, deleteFoodItem };