const User = require('../models/User');
const Task = require('../models/Task');
const Participation = require('../models/Participation');
const { evaluateAndAwardBadges } = require('../services/badgeEngine');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public or Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tasksCreated = await Task.countDocuments({ creator: user._id });
    const participations = await Participation.find({ volunteer: user._id })
      .populate('task')
      .sort({ createdAt: -1 });

    return res.json({
      user,
      stats: {
        tasksCreated,
        completedTasksCount: user.completedTasksCount,
        contributionMinutes: user.contributionMinutes,
        contributionScore: user.contributionScore,
        streakDays: user.streakDays,
        badgesCount: user.badges ? user.badges.length : 0,
      },
      participations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      bio,
      skills,
      interests,
      availability,
      location,
      avatar,
      preferredDuration,
    } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : [skills];
    }
    if (interests !== undefined) {
      user.interests = Array.isArray(interests) ? interests : [interests];
    }
    if (availability !== undefined) user.availability = availability;
    if (location !== undefined) user.location = location;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferredDuration !== undefined) user.preferredDuration = Number(preferredDuration);

    const updatedUser = await user.save();
    await evaluateAndAwardBadges(updatedUser);

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      interests: updatedUser.interests,
      availability: updatedUser.availability,
      location: updatedUser.location,
      completedTasksCount: updatedUser.completedTasksCount,
      contributionMinutes: updatedUser.contributionMinutes,
      contributionScore: updatedUser.contributionScore,
      streakDays: updatedUser.streakDays,
      badges: updatedUser.badges,
      preferredDuration: updatedUser.preferredDuration,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateUserProfile };
