const express = require('express');
const router = express.Router();
const { register, login , forgotPassword , resetPassword , googleAuth , updateProfile , getUserProfile} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google',googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/profile', authMiddleware, updateProfile);
router.get('/profile', authMiddleware, getUserProfile);



module.exports = router;