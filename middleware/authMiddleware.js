import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // FIX: Check for both 'id' and 'userId' to be safe
            const userId = decoded.id || decoded.userId;
            
            req.user = await User.findById(userId).select('-password');
        } 
        
        if (!req.user && req.session?.userId) {
            req.user = await User.findById(req.session.userId).select('-password');
        }

        if (!req.user) {
            console.log("❌ Auth Failed: No user found for this token/session");
            return res.status(401).json({ message: 'Not authorized, please login' });
        }

        next();
    } catch (error) {
        console.error("❌ Auth Middleware Error:", error.message);
        // This usually triggers if JWT_SECRET is wrong or token is expired
        return res.status(401).json({ message: 'Invalid token or session expired' });
    }
};