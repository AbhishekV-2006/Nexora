import express from "express";
import authenticateToken from "../middleware/authMiddleware.js";
import { createReview, listJobReviews, listUserReviews } from "../controllers/reviewController.js";

const router = express.Router();
router.get("/user/:userId", listUserReviews);
router.get("/job/:jobId", listJobReviews);
router.post("/job/:jobId", authenticateToken, createReview);

export default router;
