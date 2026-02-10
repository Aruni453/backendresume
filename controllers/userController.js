import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this";
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

// ------------------- REGISTER USER -------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    if (trimmedPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

    // Create user
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
    });

    console.log(`New user registered: ${user.email}`);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------- LOGIN USER -------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log(`User logged in: ${user.email}`);

    // Set session if using session auth
    if (req.body.authType === 'session') {
      req.session.userId = user._id;
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------- GET USER PROFILE -------------------
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------- UPDATE USER PROFILE -------------------
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.toLowerCase().trim();

    // Check for duplicate email
    if (trimmedEmail) {
      const existingUser = await User.findOne({ email: trimmedEmail, _id: { $ne: req.user._id } });
      if (existingUser) return res.status(400).json({ message: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(trimmedName && { name: trimmedName }),
        ...(trimmedEmail && { email: trimmedEmail }),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------- LOGOUT USER -------------------
export const logoutUser = async (req, res) => {
  try {
    // For JWT-based authentication, logout is typically handled on the client side by removing the token.
    // Server-side, we can just respond with success.
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
