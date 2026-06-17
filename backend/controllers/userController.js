const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

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
        res.status(400).json({ msg: "User register failed" });
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
            return res.status(401).json({ msg: "Incorrect email or password" }); 
        }

        // Step C: Compare the typed password with the hashed password in the database
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ msg: "Incorrect email or password" });
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
        const { token } = req.body; // The token received from React

        // Verify the token with Google's servers
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        // Extract the details the user authorized Google to share with us
        const { name, email } = ticket.getPayload();

        // Check if the user already exists in our database
        let user = await User.findOne({ email });

        if (!user) {
            // If they don't exist, create a new user record
            // Generate a random password 
            const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
            user = await User.create({
                username: name,
                email: email,
                password: randomPassword
            });
        }

        // Generate our system's standard token, just like a regular login!
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
        res.status(500).json({ msg: 'Server Error in updateProfile', error: error.message });
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
        res.status(500).json({ msg: "Error getting user profile data", error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // find email by user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "There is no user with this email" });
        }

        // create special token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // saving the token for 15 minutes
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save();

        // config nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 5. link for reset password 
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // 6. send email for the user
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'FitSync - reset passsword',
            html: `
                <h1>FitSync website - reset password</h1>
                <p>You wanted to reset password , please click on the link to choose new password</p>
                <a href="${resetUrl}" target="_blank">Click here for reset password/a>
                <p>The link is availible for 15 minutes</p>
                <p>If you didnt ask for reset password, please ignore this mail</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Email for reset password successfully sended" });

    } catch (error) {
        res.status(500).json({ message: "Forgot Password Error, please try again." });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Find user by token and check if notexpired yet
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "The link is unvalible or expired" });
        }

        user.password = password;

        // Remove the token from the database to prevent reuse
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated" });

    } catch (error) {
        res.status(500).json({ message: "Reset Password Error, please try again." });
    }
}


module.exports = {
    register,
    login,
    googleAuth,
    updateProfile,
    getUserProfile,
    forgotPassword,
    resetPassword
};