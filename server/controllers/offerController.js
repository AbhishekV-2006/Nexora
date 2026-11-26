import mongoose from "mongoose";
import Job from "../models/Job.js";
import Offer from "../models/Offer.js";
import User from "../models/User.js";

export const createOffer = async (req, res, next) => {
  try {
    const freelancerId = req.user.userId;
    const { jobId } = req.params;
    const amount = Number(req.body.amount);
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ error: "Invalid job" });
    if (!Number.isFinite(amount) || amount < 1) return res.status(400).json({ error: "Enter a valid offer amount" });
    if (message.length < 10 || message.length > 2000) return res.status(400).json({ error: "Proposal must be between 10 and 2000 characters" });

    const freelancer = await User.findById(freelancerId).select("role");
    if (freelancer?.role !== "freelancer") return res.status(403).json({ error: "Only freelancers can send offers" });
    const job = await Job.findById(jobId);
    if (!job || job.status !== "open") return res.status(404).json({ error: "This job is not accepting offers" });
    if (String(job.clientId) === String(freelancerId)) return res.status(403).json({ error: "You cannot offer on your own job" });

    const offer = await Offer.create({ job: jobId, freelancer: freelancerId, amount, message });
    await offer.populate("freelancer", "name role profileImage title");
    return res.status(201).json({ offer });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "You have already sent an offer for this job" });
    return next(error);
  }
};

export const listJobOffers = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ error: "Invalid job" });
    const job = await Job.findOne({ _id: jobId, clientId: req.user.userId }).select("_id");
    if (!job) return res.status(404).json({ error: "Job not found" });
    const offers = await Offer.find({ job: jobId }).sort({ createdAt: -1 }).populate("freelancer", "name role profileImage title").lean();
    return res.json({ offers });
  } catch (error) {
    return next(error);
  }
};

export const listMyOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ freelancer: req.user.userId }).sort({ createdAt: -1 })
      .populate({ path: "job", select: "title status clientId", populate: { path: "clientId", select: "name" } }).lean();
    return res.json({ offers });
  } catch (error) {
    return next(error);
  }
};

export const acceptOffer = async (req, res, next) => {
  try {
    const { jobId, offerId } = req.params;
    if (!mongoose.isValidObjectId(jobId) || !mongoose.isValidObjectId(offerId)) return res.status(400).json({ error: "Invalid job or offer" });
    const job = await Job.findOneAndUpdate(
      { _id: jobId, clientId: req.user.userId, status: "open" },
      { $set: { status: "in-progress", freelancerId: null, acceptedOfferId: offerId } },
      { new: true }
    );
    if (!job) return res.status(409).json({ error: "This job is no longer open" });
    const offer = await Offer.findOne({ _id: offerId, job: jobId, status: "pending" });
    if (!offer) {
      job.status = "open";
      job.acceptedOfferId = null;
      await job.save();
      return res.status(404).json({ error: "Pending offer not found" });
    }
    job.freelancerId = offer.freelancer;
    await job.save();
    offer.status = "accepted";
    await offer.save();
    await Offer.updateMany({ job: jobId, _id: { $ne: offerId }, status: "pending" }, { $set: { status: "rejected" } });
    await job.populate("freelancerId", "name role profileImage");
    return res.json({ job, offer });
  } catch (error) {
    return next(error);
  }
};

export const rejectOffer = async (req, res, next) => {
  try {
    const { jobId, offerId } = req.params;
    if (!mongoose.isValidObjectId(jobId) || !mongoose.isValidObjectId(offerId)) return res.status(400).json({ error: "Invalid job or offer" });
    const job = await Job.findOne({ _id: jobId, clientId: req.user.userId, status: "open" }).select("_id");
    if (!job) return res.status(404).json({ error: "Open job not found" });
    const offer = await Offer.findOneAndUpdate({ _id: offerId, job: jobId, status: "pending" }, { $set: { status: "rejected" } }, { new: true });
    if (!offer) return res.status(404).json({ error: "Pending offer not found" });
    return res.json({ offer });
  } catch (error) {
    return next(error);
  }
};
