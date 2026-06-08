const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// 1. Register a new user
const register = async (req, res) => {
    try {
        // Mongoose automatically runs the pre('save') middleware here to hash the password
        const user = await User.create(req.body);
        
        // Generate the token for the new user
        const token = user.createJWT();

        // We return the token and basic user info (without the password!)
        res.status(201).json({ 
            msg: "User registered successfully", 
            user: { username: user.username, email: user.email },
            token 
        });
    } catch (error) {
        console.log("Error saving user:", error.message)
        res.status(400).json({ msg: error.message });
    }
};

// 2. Login an existing user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Step A: Check if the user provided both email and password
        if (!email || !password) {
            return res.status(400).json({ msg: "Please provide email and password" });
        }

        // Step B: Find the user in the database by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: "Invalid credentials" }); // 401 = Unauthorized
        }

        // Step C: Compare the typed password with the hashed password in the database
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        // Step D: If everything is correct, generate a token
        const token = user.createJWT();

        // Send the success response with the token
        res.status(200).json({ 
            msg: "Login successful", 
            user: user,
            token 
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body; // האסימון שנקבל מה-React

        // אימות האסימון מול השרתים של גוגל
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        // חילוץ הפרטים שהמשתמש אישר לגוגל לשתף איתנו
        const { name, email } = ticket.getPayload();

        // בדיקה האם המשתמש כבר קיים אצלנו במסד הנתונים
        let user = await User.findOne({ email });

        if (!user) {
            // אם הוא לא קיים, ניצור אותו כמשתמש חדש
            // נייצר סיסמה אקראית כי השדה הוא חובה במודל שלנו
            const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
            user = await User.create({
                username: name,
                email: email,
                password: randomPassword
            });
        }

        // עכשיו נייצר לו את ה-Token הרגיל של המערכת שלנו, בדיוק כמו בהתחברות רגילה!
        const jwtToken = user.createJWT();

        res.status(200).json({ 
            msg: "Google login successful", 
            user: user, 
            token: jwtToken 
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "Google authentication failed" });
    }
};

const updateProfile = async (req, res) => {
    try {
       
        const userId = req.user?.userId; 

        const updatedData = {
            gender: req.body.gender,
            age: req.body.age,
            height: req.body.height,
            startWeight: req.body.startWeight,
            goalWeight: req.body.goalWeight,
            dailyTargets: {
                calories: req.body.calories,
                protein: req.body.protein,
                carbs: req.body.carbs,
                fat: req.body.fat
            }
        };


        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updatedData, 
            { returnDocument: 'after', runValidators: true }
        );
        
        if (!updatedUser) return res.status(404).json({ msg: "User not found" });

        res.json({ msg: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error("Server Error in updateProfile:", error); // זה ידפיס את השגיאה האמיתית!
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};


const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id || req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};


module.exports = {
    register,
    login,
    googleAuth,
    updateProfile,
    getUserProfile
};