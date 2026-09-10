import express from 'express';
import { SkillVerification } from '../models/SkillVerification.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/verifications
// @desc    Confirm and verify a volunteer's skill post task completion
router.post('/', protect, async (req, res) => {
  try {
    const { skill, userId, taskId } = req.body;

    if (!skill || !userId || !taskId) {
      return res.status(400).json({ message: 'skill, userId, and taskId are required' });
    }

    if (req.user.id === userId) {
      return res.status(400).json({ message: 'You cannot verify your own skill' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Associated task not found' });
    }

    // Check if verification already exists for this task + skill + user combo
    const existing = await SkillVerification.findOne({
      skill,
      user: userId,
      verifiedBy: req.user.id,
      taskId
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already verified this skill for this task' });
    }

    const verification = await SkillVerification.create({
      skill,
      user: userId,
      verifiedBy: req.user.id,
      taskId
    });

    // Calculate total verifications count for this user's skill
    const totalVerifications = await SkillVerification.countDocuments({
      user: userId,
      skill
    });

    // Check if target user has this skill tag in their profile; if not, add it
    const targetUser = await User.findById(userId);
    if (targetUser && !targetUser.skills.includes(skill)) {
      targetUser.skills.push(skill);
      await targetUser.save();
    }

    res.status(201).json({
      message: `Skill '${skill}' successfully verified!`,
      verification,
      totalVerifications,
      isVerifiedBadge: totalVerifications >= 3
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying skill', error: error.message });
  }
});

// @route   GET /api/verifications/user/:userId
// @desc    Get all skill verifications for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const verifications = await SkillVerification.find({ user: req.params.userId });
    const counts = {};
    verifications.forEach(v => {
      counts[v.skill] = (counts[v.skill] || 0) + 1;
    });

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verifications', error: error.message });
  }
});

export default router;
