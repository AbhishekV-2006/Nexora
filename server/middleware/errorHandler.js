/**
 * Error Handling Middleware
 * 
 * TECHNOLOGY: Express.js Error Middleware Pattern
 * WHY: Centralized error handling ensures consistent error responses across the API
 * - Catches all errors thrown in route handlers and passes to this middleware
 * - Prevents server crashes from unhandled errors
 * - Provides standardized error response format for client consumption
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Applied globally to catch authentication errors, validation errors, and runtime errors
 * - Supports secure error logging without exposing sensitive information to clients
 * - Foundation for monitoring and debugging in production
 */

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
