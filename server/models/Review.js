import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1500 },
}, { timestamps: true });

reviewSchema.index({ job: 1, reviewer: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
