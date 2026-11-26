import mongoose from "mongoose";
import Job from "../models/Job.js";
import Review from "../models/Review.js";
import VirtualPayment from "../models/VirtualPayment.js";

export const createReview = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ error: "Invalid job" });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: "Choose a rating from 1 to 5" });
    if (comment.length < 5 || comment.length > 1500) return res.status(400).json({ error: "Review must be between 5 and 1500 characters" });

    const job = await Job.findOne({ _id: jobId, status: "completed" });
    if (!job) return res.status(409).json({ error: "Reviews open after the job is completed" });
    const userId = String(req.user.userId);
    const clientId = String(job.clientId);
    const freelancerId = String(job.freelancerId || "");
    const reviewee = userId === clientId ? freelancerId : userId === freelancerId ? clientId : "";
    if (!reviewee) return res.status(403).json({ error: "Only the client and accepted freelancer can review this job" });
    if (!await VirtualPayment.exists({ job: job._id })) return res.status(409).json({ error: "A simulated payment must be recorded before reviews are available" });

    const review = await Review.create({ job: job._id, reviewer: userId, reviewee, rating, comment });
    await review.populate("reviewer reviewee", "name role profileImage");
    return res.status(201).json({ review });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "You have already reviewed this job" });
    return next(error);
  }
};

export const listJobReviews = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ error: "Invalid job" });
    const reviews = await Review.find({ job: jobId }).sort({ createdAt: 1 }).populate("reviewer reviewee", "name role profileImage").lean();
    return res.json({ reviews });
  } catch (error) {
    return next(error);
  }
};

export const listUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ error: "Invalid user" });
    const reviews = await Review.find({ reviewee: userId }).sort({ createdAt: -1 })
      .populate("reviewer", "name role profileImage").populate("job", "title").lean();
    return res.json({ reviews });
  } catch (error) {
    return next(error);
  }
};
