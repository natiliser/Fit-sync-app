const FoodItem = require('../models/foodItemModel');
const User = require('../models/userModel');

// שליפת כל פריטי המזון
const getAllFoodItems = async (req, res) => {
    try {
        const foodItems = await FoodItem.find().sort({ name: 1 });
        res.status(200).json({ foodItems });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// הוספת פריט מזון חדש (אדמין בלבד - SUC-8)
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

        // הסתעפות SUC-8: מניעת פריט כפול
        // שימוש ב-RegEx כדי לוודא ש"חזה עוף" ו-"חזה  עוף" יזוהו כאותו פריט
        const existingItem = await FoodItem.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingItem) {
            return res.status(409).json({ msg: "פריט בשם זה כבר קיים." }); // ההודעה המדויקת מהאפיון!
        }

        const newFoodItem = await FoodItem.create({
            name, calories, protein, carbs, fat
        });

        res.status(201).json({ msg: "הפריט מזון נוסף בהצלחה", foodItem: newFoodItem });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// מחיקת פריט מזון (אדמין בלבד)
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
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

module.exports = { getAllFoodItems, addFoodItem, deleteFoodItem };