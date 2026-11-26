/**
 * User Model (Mongoose Schema)
 * 
 * TECHNOLOGY: Mongoose Schema with Pre-save Hook
 * WHY: Provides schema validation, password hashing, and type safety
 * - Schema defines required fields and data types
 * - Pre-save middleware automatically hashes passwords before storage
 * - Timestamps track user account creation and last update
 * - Role field enables role-based access control (RBAC)
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Core model for both freelancers and clients
 * - Role-based access: "freelancer", "client", or "admin"
 * - Stores essential user info for authentication and profile display
 * - Foundation for escrow transactions and messaging authorization
 * - Password hashing ensures secure credential storage
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["freelancer", "client", "admin"],
      default: "client",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    portfolio: {
      type: [
        {
          title: String,
          description: String,
          link: String,
        },
      ],
      default: [],
    },
    profileImage: {
      type: String,
      default: null,
    },
    // Freelancer-specific fields
    title: {
      type: String,
      default: "",
    },
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead"],
      default: "mid",
    },
    availability: {
      type: String,
      enum: ["immediate", "part-time", "full-time"],
      default: "immediate",
    },
    github: {
      type: String,
      default: "",
    },
    portfolioWebsite: {
      type: String,
      default: "",
    },
    // Client-specific fields
    companyName: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    companyWebsite: {
      type: String,
      default: "",
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    verificationBadge: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save middleware: Hash password before storing
userSchema.pre("save", async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware: calculate profile completion percentage
userSchema.pre("save", function (next) {
  try {
    // Base fields counted for everyone
    const baseFields = [this.name, this.email, this.bio, this.country, this.city, this.linkedin];
    let filled = baseFields.reduce((acc, v) => acc + (v ? 1 : 0), 0);

    if (this.role === 'freelancer') {
      const freelancerFields = [this.title, (Array.isArray(this.skills) && this.skills.length > 0) ? 1 : 0, (this.hourlyRate && this.hourlyRate > 0) ? 1 : 0, this.experienceLevel, this.availability, this.github, this.portfolioWebsite, (Array.isArray(this.portfolio) && this.portfolio.length > 0) ? 1 : 0, this.profileImage || this.profilePicture ? 1 : 0];
      filled += freelancerFields.reduce((acc, v) => acc + (v ? 1 : 0), 0);
      const total = baseFields.length + freelancerFields.length;
      this.completionPercentage = Math.round((filled / total) * 100);
    } else {
      // client
      const clientFields = [this.companyName, this.industry, this.companyWebsite, this.profileImage || this.profilePicture ? 1 : 0];
      filled += clientFields.reduce((acc, v) => acc + (v ? 1 : 0), 0);
      const total = baseFields.length + clientFields.length;
      this.completionPercentage = Math.round((filled / total) * 100);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
