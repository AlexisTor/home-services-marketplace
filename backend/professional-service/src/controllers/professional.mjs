// backend/professional-service/src/controllers/professional.js
import Professional from '../models/professional.mjs';
import axios from 'axios';

export const createProfile = async (req, res) => {
  try {
    const { businessName, description, services, skills, experience, serviceArea } = req.body;
    
    // Check if profile already exists
    const existingProfile = await Professional.findOne({ userId: req.userData.userId });
    if (existingProfile) {
      return res.status(409).json({ message: req.__('profile_already_exists') });
    }
    
    // Create new professional profile
    const professional = new Professional({
      userId: req.userData.userId,
      businessName,
      description,
      services,
      skills,
      experience,
      serviceArea
    });
    
    await professional.save();
    
    // Update user role in user service
    try {
      await axios.put(`${process.env.USER_SERVICE_URL}/users/role`, {
        userId: req.userData.userId,
        role: 'professional'
      }, {
        headers: { Authorization: req.headers.authorization }
      });
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
    
    res.status(201).json({ message: req.__('profile_created'), professional });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const professional = await Professional.findOne({ userId: req.userData.userId });
    
    if (!professional) {
      return res.status(404).json({ message: req.__('profile_not_found') });
    }
    
    res.status(200).json({ professional });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    const professional = await Professional.findOneAndUpdate(
      { userId: req.userData.userId },
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!professional) {
      return res.status(404).json({ message: req.__('profile_not_found') });
    }
    
    res.status(200).json({ professional, message: req.__('profile_updated') });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const searchProfessionals = async (req, res) => {
  try {
    const { category, location, rating } = req.query;
    
    const query = {};
    
    if (category) {
      query['services.category'] = category;
    }
    
    if (location) {
      query['serviceArea.cities'] = location;
    }
    
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }
    
    const professionals = await Professional.find(query);
    
    res.status(200).json({ professionals });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const professional = await Professional.findById(id);
    
    if (!professional) {
      return res.status(404).json({ message: req.__('professional_not_found') });
    }
    
    res.status(200).json({ professional });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};
