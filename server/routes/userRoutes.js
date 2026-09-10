import express from 'express';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { SkillVerification } from '../models/SkillVerification.js';
import { protect } from '../middleware/auth.js';
import { computeTrustBadges } from '../utils/badges.js';
import { getKarmaTier } from '../utils/karma.js';

const router = express.Router();

// @route   GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compute updated badges
    const trustBadges = await computeTrustBadges(user);
    if (JSON.stringify(user.trustBadges) !== JSON.stringify(trustBadges)) {
      user.trustBadges = trustBadges;
      await user.save();
    }

    // Get skill verifications count per skill
    const verifications = await SkillVerification.find({ user: user._id });
    const verifiedSkillsMap = {};
    verifications.forEach(v => {
      verifiedSkillsMap[v.skill] = (verifiedSkillsMap[v.skill] || 0) + 1;
    });

    // Completed task count
    const completedTasksCount = await Task.countDocuments({
      acceptedBy: user._id,
      status: 'completed'
    });

    // Posted tasks count
    const postedTasksCount = await Task.countDocuments({
      postedBy: user._id
    });

    res.json({
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
      streakCount: user.streakCount,
      lastHelpedDate: user.lastHelpedDate,
      createdAt: user.createdAt,
      verifiedSkillsMap,
      completedTasksCount,
      postedTasksCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// @route   PATCH /api/users/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own profile' });
    }

    const { skills, interests, campusLocation, role, name } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (campusLocation) user.campusLocation = campusLocation.trim();
    if (Array.isArray(skills)) user.skills = skills.map(s => s.trim()).filter(Boolean);
    if (Array.isArray(interests)) user.interests = interests.map(i => i.trim()).filter(Boolean);

    await user.save();

    // Recompute badges after profile update
    const trustBadges = await computeTrustBadges(user);
    user.trustBadges = trustBadges;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
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
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
});

// @route   GET /api/users/:id/badges
router.get('/:id/badges', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const badges = await computeTrustBadges(user);
    res.json({ trustBadges: badges });
  } catch (error) {
    res.status(500).json({ message: 'Error computing badges', error: error.message });
  }
});

export default router;
