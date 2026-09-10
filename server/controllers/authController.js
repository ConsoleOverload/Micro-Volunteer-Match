const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { evaluateAndAwardBadges } = require('../services/badgeEngine');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      skills,
      interests,
      availability,
      location,
      bio,
      avatar,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'volunteer',
      skills: Array.isArray(skills) ? skills : skills ? [skills] : [],
      interests: Array.isArray(interests) ? interests : interests ? [interests] : [],
      availability: availability || {
        weekdays: true,
        weekends: true,
        timeSlots: ['Afternoon', 'Evening'],
        hoursPerWeek: 2,
      },
      location: location || 'Campus / Remote',
      bio: bio || 'Excited to contribute micro-volunteering time!',
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    if (user) {
      await evaluateAndAwardBadges(user);
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        availability: user.availability,
        location: user.location,
        completedTasksCount: user.completedTasksCount,
        contributionMinutes: user.contributionMinutes,
        contributionScore: user.contributionScore,
        streakDays: user.streakDays,
        badges: user.badges,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (user && (await user.matchPassword(password))) {
      user.lastActiveDate = new Date();
      await user.save();

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        availability: user.availability,
        location: user.location,
        completedTasksCount: user.completedTasksCount,
        contributionMinutes: user.contributionMinutes,
        contributionScore: user.contributionScore,
        streakDays: user.streakDays,
        badges: user.badges,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        availability: user.availability,
        location: user.location,
        completedTasksCount: user.completedTasksCount,
        contributionMinutes: user.contributionMinutes,
        contributionScore: user.contributionScore,
        streakDays: user.streakDays,
        badges: user.badges,
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe };
