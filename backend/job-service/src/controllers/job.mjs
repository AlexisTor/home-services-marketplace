// backend/job-service/src/controllers/job.js
import Job from '../models/job.mjs';
import axios from 'axios';

export const createJob = async (req, res) => {
  try {
    const { title, description, category, location, budget, timeframe, attachments } = req.body;
    
    const job = new Job({
      title,
      description,
      category,
      clientId: req.userData.userId,
      location,
      budget,
      timeframe,
      attachments
    });
    
    await job.save();
    
    // Notify relevant professionals about new job
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/job-created`, {
        jobId: job._id,
        category: job.category,
        location: job.location
      });
    } catch (error) {
      console.error('Failed to send job notifications:', error);
    }
    
    res.status(201).json({ message: req.__('job_created'), job });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    
    if (req.userData.role === 'client') {
      query.clientId = req.userData.userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ message: req.__('job_not_found') });
    }
    
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ message: req.__('job_not_found') });
    }
    
    // Only client who created the job can update it
    if (job.clientId !== req.userData.userId) {
      return res.status(403).json({ message: req.__('not_authorized') });
    }
    
    // Update job
    Object.keys(updates).forEach(key => {
      job[key] = updates[key];
    });
    job.updatedAt = Date.now();
    
    await job.save();
    
    res.status(200).json({ message: req.__('job_updated'), job });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const submitProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, description, estimatedDuration, availableStartDate } = req.body;
    
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ message: req.__('job_not_found') });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({ message: req.__('job_not_open') });
    }
    
    // Check if professional already submitted a proposal
    const existingProposal = job.proposals.find(p => p.professionalId === req.userData.userId);
    if (existingProposal) {
      return res.status(409).json({ message: req.__('proposal_already_exists') });
    }
    
    // Add proposal
    job.proposals.push({
      professionalId: req.userData.userId,
      price,
      description,
      estimatedDuration,
      availableStartDate: new Date(availableStartDate)
    });
    
    await job.save();
    
    // Notify client about new proposal
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/proposal-received`, {
        jobId: job._id,
        clientId: job.clientId,
        professionalId: req.userData.userId
      });
    } catch (error) {
      console.error('Failed to send proposal notification:', error);
    }
    
    res.status(201).json({ message: req.__('proposal_submitted') });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const acceptProposal = async (req, res) => {
  try {
    const { jobId, proposalId } = req.params;
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: req.__('job_not_found') });
    }
    
    // Only client who created the job can accept proposals
    if (job.clientId !== req.userData.userId) {
      return res.status(403).json({ message: req.__('not_authorized') });
    }
    
    const proposal = job.proposals.id(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ message: req.__('proposal_not_found') });
    }
    
    // Update proposal status
    proposal.status = 'accepted';
    job.status = 'in_progress';
    job.selectedProposal = proposalId;
    
    await job.save();
    
    // Notify professional about accepted proposal
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/proposal-accepted`, {
        jobId: job._id,
        clientId: job.clientId,
        professionalId: proposal.professionalId
      });
    } catch (error) {
      console.error('Failed to send proposal acceptance notification:', error);
    }
    
    res.status(200).json({ message: req.__('proposal_accepted'), job });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const completeJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({ message: req.__('job_not_found') });
    }
    
    // Only client who created the job can mark it as complete
    if (job.clientId !== req.userData.userId) {
      return res.status(403).json({ message: req.__('not_authorized') });
    }
    
    job.status = 'completed';
    job.updatedAt = Date.now();
    
    await job.save();
    
    // Notify professional about job completion
    if (job.selectedProposal) {
      const selectedProposal = job.proposals.id(job.selectedProposal);
      try {
        await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/job-completed`, {
          jobId: job._id,
          clientId: job.clientId,
          professionalId: selectedProposal.professionalId
        });
      } catch (error) {
        console.error('Failed to send job completion notification:', error);
      }
    }
    
    res.status(200).json({ message: req.__('job_completed'), job });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};
