import mongoose from "mongoose";

const virtualPaymentSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, unique: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: "INR" },
  mode: { type: String, enum: ["simulated"], default: "simulated" },
  status: { type: String, enum: ["completed"], default: "completed" },
  receiptCode: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model("VirtualPayment", virtualPaymentSchema);
