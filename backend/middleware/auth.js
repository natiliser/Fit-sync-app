const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. תופסים את הטוקן מהבקשה שנשלחה מ-React
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. פותחים את הטוקן בעזרת המפתח הסודי שלך
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. מצמידים את ה-ID של המשתמש לבקשה כדי שה-Controller יוכל להשתמש בו
        req.user = { userId: decoded.userId }; 
        
        // 4. מעבירים את השרביט לפונקציה הבאה (updateProfile)
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Not authorized to access this route' });
    }
};

module.exports = authMiddleware;