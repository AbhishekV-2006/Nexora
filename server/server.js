/**
 * Nexora Backend Server - Main Entry Point
 * 
 * TECHNOLOGY STACK:
 * - Express.js: Lightweight REST API framework, industry standard for Node.js backends
 * - Mongoose: MongoDB ODM for schema validation and data modeling
 * - CORS: Cross-Origin Resource Sharing to allow client (React) requests
 * - dotenv: Environment variable management for sensitive data (API keys, DB credentials)
 * 
 * WHY THESE CHOICES:
 * - Express: Minimal, flexible, best-in-class middleware ecosystem
 * - Mongoose: Type safety, hooks for business logic (password hashing), schema validation
 * - CORS: Enables secure client-server communication across domains
 * - dotenv: Keeps secrets out of version control
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Central hub that initializes database, applies middleware, and mounts routes
 * - Handles cross-origin requests from React frontend
 * - JSON middleware parses incoming request bodies for data exchange
 * - Error handler middleware catches all exceptions for consistent error responses
 * - Ready to scale: routes organized modularly, controllers separate from routes
 * 
 * FEATURES:
 * ✅ MongoDB Atlas connection with error handling
 * ✅ Global middleware: CORS, JSON parsing, error handling
 * ✅ Modular route architecture (auth routes extensible to users, projects, payments, messaging)
 * ✅ Environment-based configuration (dev/production)
 */

import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware: Enable CORS for frontend requests
// Allows React frontend to make requests to this backend
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      const error = new Error("Origin is not allowed by CORS");
      error.status = 403;
      return callback(error);
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware: Parse JSON request bodies
// Converts incoming JSON strings to JavaScript objects
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check endpoint
// Returns 200 if server is running
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Nexora Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
// Mount authentication routes at /api/auth prefix
app.use("/api/auth", authRoutes);

// Serve uploaded files (avatars) statically at /uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads')));

// Mount user routes
app.use('/api/users', userRoutes);

// Mount job routes
app.use('/api/jobs', jobRoutes);

// Placeholder routes for future features
// TODO: Add these routes as we build features
app.use("/api/projects", (req, res) => {
  res.json({ message: "Projects API - Coming soon" });
});

app.use("/api/messages", messageRoutes);

app.use("/api/payments", (req, res) => {
  res.json({ message: "Escrow Payments API - Coming soon" });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Global error handling middleware (must be last)
// Catches all errors thrown in route handlers
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET is required and must be at least 32 characters");
    }
    // Initialize database connection
    await connectDB();

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Nexora Server running on port ${PORT}`);
      console.log(`📍 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
