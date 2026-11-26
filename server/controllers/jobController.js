import Job from '../models/Job.js';
import User from '../models/User.js';

/**
 * Create a new job (client only)
 */
export const createJob = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Role check: only clients can post jobs
    const actor = await User.findById(userId);
    if (!actor) return res.status(404).json({ error: 'User not found' });
    if (actor.role !== 'client') return res.status(403).json({ error: 'Only clients can post jobs' });

    const payload = {
      title: req.body.title,
      description: req.body.description,
      requiredSkills: Array.isArray(req.body.requiredSkills) ? req.body.requiredSkills : (req.body.requiredSkills ? req.body.requiredSkills.split(',').map(s=>s.trim()).filter(Boolean) : []),
      budget: {
        min: Number(req.body.budget?.min) || 0,
        max: Number(req.body.budget?.max) || 0,
      },
      budgetType: req.body.budgetType || 'fixed',
      deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      clientId: userId,
      category: req.body.category || '',
      tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? req.body.tags.split(',').map(s=>s.trim()).filter(Boolean) : []),
    };

    const job = await Job.create(payload);
    return res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
};

/**
 * List jobs with filters and pagination
 * Filters supported: skill, budget range, category, status, q (text search on title/description)
 */
export const listJobs = async (req, res, next) => {
  try {
    const { skill, minBudget, maxBudget, category, status, q, page = 1, limit = 12 } = req.query;
    const filter = { status: { $ne: 'cancelled' } };

    if (skill) filter.requiredSkills = { $in: [skill] };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (minBudget || maxBudget) {
      filter.$and = [];
      if (minBudget) filter.$and.push({ 'budget.max': { $gte: Number(minBudget) } });
      if (maxBudget) filter.$and.push({ 'budget.min': { $lte: Number(maxBudget) } });
    }
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: { $regex: regex } }, { description: { $regex: regex } }];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Job.countDocuments(filter),
    ]);

    return res.json({ jobs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single job, populate client data
 */
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate({ path: 'clientId', select: '-password' }).lean();
    if (!job) return res.status(404).json({ error: 'Job not found' });
    return res.json({ job });
  } catch (err) {
    next(err);
  }
};

/**
 * Update job (owner only)
 */
export const updateJob = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.clientId.toString() !== userId) return res.status(403).json({ error: 'Only owner can update job' });

    const updatable = ['title','description','requiredSkills','budget','budgetType','deadline','status','category','tags'];
    updatable.forEach(f => {
      if (req.body[f] !== undefined) job[f] = req.body[f];
    });

    // normalize arrays
    if (req.body.requiredSkills !== undefined) job.requiredSkills = Array.isArray(req.body.requiredSkills) ? req.body.requiredSkills : (typeof req.body.requiredSkills === 'string' ? req.body.requiredSkills.split(',').map(s=>s.trim()).filter(Boolean) : []);
    if (req.body.tags !== undefined) job.tags = Array.isArray(req.body.tags) ? req.body.tags : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(s=>s.trim()).filter(Boolean) : []);

    await job.save();
    return res.json({ job });
  } catch (err) {
    next(err);
  }
};

/**
 * Soft-delete job (set status to cancelled)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.clientId.toString() !== userId) return res.status(403).json({ error: 'Only owner can cancel job' });

    job.status = 'cancelled';
    await job.save();
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
