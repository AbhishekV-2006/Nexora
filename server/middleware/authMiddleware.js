/**
 * JWT Authentication Middleware
 * 
 * TECHNOLOGY: JWT (JSON Web Tokens) with jsonwebtoken library
 * WHY: JWTs provide stateless authentication without server-side session storage
 * - Tokens are self-contained and can be verified without database lookup
 * - Scales horizontally across multiple servers
 * - Secure token signing with secret key prevents tampering
 * - Industry standard for REST APIs
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Protects routes requiring authentication (freelancer/client profiles, escrow operations)
 * - Extracts user ID from token payload for role-based access control
 * - Guards messaging and payment routes
 * - Enables multi-device support (each device can have separate token)
 */

import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    // Verify token and extract payload. Our tokens contain { userId }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired token",
        });
      }

      // Attach user payload to request object for downstream handlers
      // Decoded payload example: { userId: '...', iat: ..., exp: ... }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Authentication error",
    });
  }
};

export default authenticateToken;
