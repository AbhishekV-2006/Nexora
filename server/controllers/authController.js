/**
 * Authentication Controller
 * 
 * TECHNOLOGY: Express.js Controller Pattern, JWT, bcryptjs
 * WHY: Controllers separate business logic from routes, improving code organization and reusability
 * - JWT tokens generated for secure session management
 * - Password hashing via bcryptjs ensures security
 * - Controller methods can be reused across different route patterns
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Handles user registration (freelancers, clients)
 * - Manages login authentication and token generation
 * - Foundation for role-based access control
 * - Supports multi-device login via token-based sessions
 */

import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 * Creates a signed JWT token valid for 7 days
 */
const generateToken = (userId) => {
  // Sign token with 24 hour expiry for session balance between security and usability
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "client",
    });

    await user.save();

    // Generate token and return standardized response without password
    const token = generateToken(user._id);

    res.status(201).json({
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user and include password field for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate token and return standardized response without password
    const token = generateToken(user._id);

    res.status(200).json({
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is attached by auth middleware and contains { userId }
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};
