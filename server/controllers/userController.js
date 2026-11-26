import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * User Controller
 * - GET /api/users/:id -> public profile view
 * - PUT /api/users/profile -> update own profile (protected)
 * - POST /api/users/upload-avatar -> upload avatar image (protected)
 *
 * Explanations:
 * - Multer is an Express middleware for handling multipart/form-data (files).
 * - File uploads are validated for type and size to prevent malicious uploads
 *   and excessive disk usage. We only accept images and limit to 10MB.
 */

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    // Load user document so pre-save hooks (password hash, completion calc) run
    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Common fields
  // Do not allow role updates via this endpoint (requires admin action)
  const fields = ['name','email','bio','country','city','linkedin','verificationBadge'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });

    // Password change (if provided)
    if (req.body.password) {
      user.password = req.body.password; // will be hashed in pre-save
    }

    // Freelancer-specific fields
    if (req.body.title !== undefined) user.title = req.body.title;
    if (req.body.skills !== undefined) user.skills = Array.isArray(req.body.skills) ? req.body.skills : (typeof req.body.skills === 'string' ? req.body.skills.split(',').map(s=>s.trim()).filter(Boolean) : []);
    if (req.body.hourlyRate !== undefined) user.hourlyRate = Number(req.body.hourlyRate) || 0;
    if (req.body.experienceLevel !== undefined) user.experienceLevel = req.body.experienceLevel;
    if (req.body.availability !== undefined) user.availability = req.body.availability;
    if (req.body.github !== undefined) user.github = req.body.github;
    if (req.body.portfolioWebsite !== undefined) user.portfolioWebsite = req.body.portfolioWebsite;
    if (req.body.portfolio !== undefined) user.portfolio = Array.isArray(req.body.portfolio) ? req.body.portfolio : JSON.parse(req.body.portfolio || '[]');

    // Client-specific fields
    if (req.body.companyName !== undefined) user.companyName = req.body.companyName;
    if (req.body.industry !== undefined) user.industry = req.body.industry;
    if (req.body.companyWebsite !== undefined) user.companyWebsite = req.body.companyWebsite;

    // If avatar was uploaded, multer sets req.file
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();
    const out = await User.findById(userId).select('-password');
    return res.json({ user: out });
  } catch (err) {
    next(err);
  }
};

// Upload avatar handler: multer middleware handles file saving
export const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Validate file type and size were already handled by multer config
    const imagePath = `/uploads/${req.file.filename}`;

    // Update user profileImage and recalc completion via pre-save hook
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Optionally remove old image file to save disk
    if (user.profileImage) {
      // user.profileImage is like /uploads/filename.ext
      const rel = user.profileImage.replace(/^\//, '');
      const oldPath = path.join(process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'), path.basename(rel));
      fs.unlink(oldPath, (err) => { /* ignore errors */ });
    }

    user.profileImage = imagePath;
    await user.save();

    return res.json({ user });
  } catch (err) {
    next(err);
  }
};
