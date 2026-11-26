import mongoose from "mongoose";
import Job from "../models/Job.js";
import Offer from "../models/Offer.js";
import VirtualPayment from "../models/VirtualPayment.js";

export const simulateJobPayment = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ error: "Invalid job" });
    const job = await Job.findOne({ _id: jobId, clientId: req.user.userId });
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (!job.acceptedOfferId || !job.freelancerId) return res.status(409).json({ error: "Accept a freelancer offer before recording demo payment" });
    if (job.status !== "in-progress") return res.status(409).json({ error: "Only active jobs can be paid" });

    const existing = await VirtualPayment.findOne({ job: job._id }).populate("payer recipient", "name email").populate("job", "title");
    if (existing) return res.json({ payment: existing, alreadyRecorded: true });
    const offer = await Offer.findOne({ _id: job.acceptedOfferId, job: job._id, status: "accepted" });
    if (!offer) return res.status(409).json({ error: "Accepted offer could not be found" });

    const receiptCode = `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const payment = await VirtualPayment.create({
      job: job._id,
      offer: offer._id,
      payer: job.clientId,
      recipient: offer.freelancer,
      amount: offer.amount,
      receiptCode,
    });
    await payment.populate("payer recipient", "name email");
    await payment.populate("job", "title");
    return res.status(201).json({ payment, notice: "Simulated payment recorded. No real money was transferred." });
  } catch (error) {
    if (error.code === 11000) {
      const payment = await VirtualPayment.findOne({ job: req.params.jobId }).populate("payer recipient", "name email").populate("job", "title");
      return res.json({ payment, alreadyRecorded: true });
    }
    return next(error);
  }
};

export const listMyPayments = async (req, res, next) => {
  try {
    const payments = await VirtualPayment.find({ $or: [{ payer: req.user.userId }, { recipient: req.user.userId }] })
      .sort({ createdAt: -1 }).populate("payer recipient", "name role").populate("job", "title status").lean();
    return res.json({ payments });
  } catch (error) {
    return next(error);
  }
};
