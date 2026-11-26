import express from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import { ensureRole } from '../middleware/roleMiddleware.js';
import { createJob, listJobs, listMyJobs, getJobById, updateJob, deleteJob, completeJob } from '../controllers/jobController.js';

const router = express.Router();

// POST /api/jobs - create job (client only)
router.post('/', authenticateToken, ensureRole('client'), createJob);

// GET /api/jobs - list with filters and pagination
router.get('/', listJobs);

// GET /api/jobs/mine - authenticated client's own jobs
router.get('/mine', authenticateToken, ensureRole('client'), listMyJobs);
router.post('/:id/complete', authenticateToken, ensureRole('client'), completeJob);

// GET /api/jobs/:id - single job with populated client
router.get('/:id', getJobById);

// PUT /api/jobs/:id - update (owner only)
router.put('/:id', authenticateToken, updateJob);

// DELETE /api/jobs/:id - soft delete (owner only)
router.delete('/:id', authenticateToken, deleteJob);

export default router;
