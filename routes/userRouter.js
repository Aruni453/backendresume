import express from "express";
import { getUserProfile, loginUser, registerUser, updateUserProfile, logoutUser } from "../controllers/usercontroller.js";
import { protect } from "../middleware/authMiddleware.js";
const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logoutUser);
// protected route as token/session will be required
userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, updateUserProfile);

export default userRouter;
