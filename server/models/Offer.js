import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 1 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

offerSchema.index({ job: 1, freelancer: 1 }, { unique: true });

export default mongoose.model("Offer", offerSchema);
