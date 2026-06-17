const Meal = require('../models/mealModel');

// Log a new meal (or multiple items as one meal) for a user
const createMeal = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Check if the request body is an array (multiple items submitted together)
        if (Array.isArray(req.body)) {
            // Add the userId to every item in the array
            const mealsData = req.body.map(item => ({
                ...item,
                user: userId
            }));

            // Insert all items into the database at once (Bulk Insert)
            const savedMeals = await Meal.insertMany(mealsData);
            return res.status(201).json({ msg: "Meals logged successfully", meals: savedMeals });
        } 
        // Fallback for single item submission
        else {
            const mealData = {
                ...req.body,
                user: userId
            };
            const meal = await Meal.create(mealData);
            return res.status(201).json({ msg: "Meal logged successfully", meals: [meal] });
        }
    } catch (error) {
        console.error("Error creating meal:", error);
        res.status(400).json({ msg: error.message });
    }
};

// Get all meals for the specific logged-in user
const getAllMeals = async (req, res) => {
    try {
        // Extract user ID from token to only fetch their personal meals
        const userId = req.user.userId;
        
        // Find meals belonging to this user, sorted by newest first
        const meals = await Meal.find({ user: userId }).sort({ createdAt: -1 });
        
        res.status(200).json({ meals });
    } catch (error) {
        console.error("Error fetching all meals:", error);
        res.status(500).json({ msg: error.message });
    }
};

const getTodaySummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Set the time range for "today" (from midnight to midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch all meals created by this user today from the database
        const todayMeals = await Meal.find({
            user: userId,
            createdAt: { $gte: today, $lt: tomorrow }
        });

        // Calculate the total sum of calories and macros
        const summary = todayMeals.reduce((acc, meal) => {
            acc.calories += meal.calories;
            acc.protein += meal.protein;
            acc.carbs += meal.carbs;
            acc.fat += meal.fat;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        res.json(summary);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching today's summary" });
    }
};

module.exports = {
    createMeal,
    getAllMeals,
    getTodaySummary
};