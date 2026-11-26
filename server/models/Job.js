import mongoose from 'mongoose';

/**
 * Job Model
 * Fields:
 * - title, description
 * - requiredSkills: [String]
 * - budget: { min, max }
 * - budgetType: 'fixed' | 'hourly'
 * - deadline: Date
 * - status: 'open' | 'in-progress' | 'completed' | 'cancelled'
 * - clientId: ObjectId (ref: User)
 * - category, tags[]
 * - timestamps
 */

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
    deadline: { type: Date, default: null },
    status: { type: String, enum: ['open', 'in-progress', 'completed', 'cancelled'], default: 'open' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    acceptedOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
    category: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Indexes to help filter queries
jobSchema.index({ 'budget.min': 1, 'budget.max': 1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ category: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
