// backend/job-service/src/routes/job.mjs
import express from 'express';
import * as jobController from '../controllers/job.mjs';
import auth from '../middleware/auth.mjs';

const router = express.Router();

// Create a new job
router.post('/', auth, jobController.createJob);

// Get all jobs (with optional filters)
router.get('/', auth, jobController.getJobs);

// Get a specific job by ID
router.get('/:id', auth, jobController.getJobById);

// Update a job
router.put('/:id', auth, jobController.updateJob);

// Submit a proposal for a job
router.post('/:id/proposals', auth, jobController.submitProposal);

// Accept a proposal
router.put('/:jobId/proposals/:proposalId/accept', auth, jobController.acceptProposal);

// Mark a job as complete
router.put('/:id/complete', auth, jobController.completeJob);

export default router;
