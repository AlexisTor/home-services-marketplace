// backend/user-service/src/controllers/user.mjs
import User from '../models/user.mjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: req.__('user_already_exists') });
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role
    });
    
    await user.save();
    
    res.status(201).json({ message: req.__('user_created') });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: req.__('auth_failed') });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: req.__('auth_failed') });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: req.__('user_not_found') });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this endpoint
    
    const user = await User.findByIdAndUpdate(
      req.userData.userId,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: req.__('user_not_found') });
    }
    
    res.status(200).json({ user, message: req.__('profile_updated') });
  } catch (error) {
    res.status(500).json({ message: req.__('server_error'), error: error.message });
  }
};
