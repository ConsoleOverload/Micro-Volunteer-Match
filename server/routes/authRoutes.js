import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { computeTrustBadges } from '../utils/badges.js';
import { getKarmaTier } from '../utils/karma.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_micro_volunteer_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, skills, interests, campusLocation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'both',
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      campusLocation: campusLocation || 'North Campus Library'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        interests: user.interests,
        campusLocation: user.campusLocation,
        trustBadges: user.trustBadges,
        karmaScore: user.karmaScore,
        karmaTier: getKarmaTier(user.karmaScore),
        streakCount: user.streakCount
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Refresh trust badges on login
    const computedBadges = await computeTrustBadges(user);
    if (JSON.stringify(user.trustBadges) !== JSON.stringify(computedBadges)) {
      user.trustBadges = computedBadges;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        interests: user.interests,
        campusLocation: user.campusLocation,
        trustBadges: user.trustBadges,
        karmaScore: user.karmaScore,
        karmaTier: getKarmaTier(user.karmaScore),
        streakCount: user.streakCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const computedBadges = await computeTrustBadges(user);
    if (JSON.stringify(user.trustBadges) !== JSON.stringify(computedBadges)) {
      user.trustBadges = computedBadges;
      await user.save();
    }

    res.json({
      ...user.toObject(),
      karmaTier: getKarmaTier(user.karmaScore)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

export default router;
