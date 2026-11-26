/**
 * Authentication Routes
 * 
 * TECHNOLOGY: Express.js Router
 * WHY: Router provides modular, maintainable route organization
 * - Routes are organized by feature (auth), separate from main server file
 * - Routes can be mounted at different base paths (e.g., /api/auth)
 * - Supports middleware chaining for specific route protection
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Public routes: /register (create accounts), /login (get tokens)
 * - Foundation for all other authenticated routes
 * - Routes reference controllers for business logic separation
 */

import express from "express";
import { body, validationResult } from "express-validator";
import { register, login, getMe } from "../controllers/authController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (freelancer or client)
 * Public route
 */
router.post(
	"/register",
	// Server-side validation using express-validator
	body("name").trim().notEmpty().withMessage("Name is required"),
	body("email").isEmail().withMessage("Valid email is required"),
	body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		return register(req, res, next);
	}
);

/**
 * POST /api/auth/login
 * Authenticate user and receive JWT token
 * Public route
 */
router.post(
	"/login",
	body("email").isEmail().withMessage("Valid email is required"),
	body("password").notEmpty().withMessage("Password is required"),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		return login(req, res, next);
	}
);

/**
 * GET /api/auth/me
 * Protected route to return current authenticated user
 */
router.get("/me", authenticateToken, getMe);

export default router;
