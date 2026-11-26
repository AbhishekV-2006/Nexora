import express from "express";
import fs from "fs";
import authenticateToken from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import { getUserById, updateProfile, uploadAvatar } from "../controllers/userController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve uploaded files from /uploads (handled in server.js)

// GET /api/users/:id - public profile view
router.get("/:id", getUserById);

// Configure multer storage and file validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
    fs.mkdir(uploadDir, { recursive: true }, (error) => cb(error, uploadDir));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = file.fieldname + "-" + Date.now();
    cb(null, base + ext);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed!"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Validation result middleware
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// PUT /api/users/profile - update own profile (protected) with server-side validation
router.put(
  "/profile",
  authenticateToken,
  // validation chain
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('hourlyRate').optional().isFloat({ min: 50, max: 100000 }).withMessage('Hourly rate must be between 50 and 100000'),
  body('linkedin').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('LinkedIn must be a valid URL with http(s)://'),
  body('github').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('GitHub must be a valid URL with http(s)://'),
  body('portfolioWebsite').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Portfolio website must be a valid URL with http(s)://'),
  body('companyWebsite').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Company website must be a valid URL with http(s)://'),
  body('portfolio').optional().isArray().withMessage('Portfolio must be an array'),
  body('portfolio.*.title').optional().isLength({ min: 2 }).withMessage('Portfolio title must be at least 2 chars'),
  body('portfolio.*.description').optional().isLength({ min: 10 }).withMessage('Portfolio description must be at least 10 chars'),
  runValidation,
  updateProfile
);

// POST /api/users/upload-avatar - upload avatar (protected)
router.post("/upload-avatar", authenticateToken, upload.single("avatar"), uploadAvatar);

export default router;
