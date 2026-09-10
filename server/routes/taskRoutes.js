import express from 'express';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { calculateKarmaPoints, calculateUpdatedStreak } from '../utils/karma.js';
import { computeTrustBadges } from '../utils/badges.js';
import { calculateWalkTimeEstimate } from '../utils/campusZones.js';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all open/active tasks (filterable by category, sorted by urgent first then newest)
router.get('/', async (req, res) => {
  try {
    const { category, search, userLocation } = req.query;
    let query = { status: { $ne: 'cancelled' } };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { campusLocation: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort: Urgent tasks first (-1), then newest createdAt (-1)
    const tasks = await Task.find(query)
      .populate('postedBy', 'name email campusLocation trustBadges karmaScore')
      .populate('acceptedBy', 'name email campusLocation trustBadges karmaScore')
      .sort({ isUrgent: -1, createdAt: -1 });

    // Enrich tasks with walk time estimate
    const enrichedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      taskObj.walkTimeEstimate = calculateWalkTimeEstimate(
        userLocation || 'North Campus Library',
        task.campusLocation
      );
      return taskObj;
    });

    res.json(enrichedTasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// @route   GET /api/tasks/mine
// @desc    Get posted and accepted tasks for logged in user
router.get('/mine', protect, async (req, res) => {
  try {
    const posted = await Task.find({ postedBy: req.user.id })
      .populate('acceptedBy', 'name email skills trustBadges')
      .sort({ createdAt: -1 });

    const accepted = await Task.find({ acceptedBy: req.user.id })
      .populate('postedBy', 'name email skills trustBadges')
      .sort({ createdAt: -1 });

    res.json({ posted, accepted });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user tasks', error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Post a new micro task
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, isUrgent, estimatedMinutes, campusLocation } = req.body;

    if (!title || !description || !campusLocation) {
      return res.status(400).json({ message: 'Title, description, and campus location are required' });
    }

    const task = await Task.create({
      title,
      description,
      category: category || 'Other',
      postedBy: req.user.id,
      isUrgent: Boolean(isUrgent),
      estimatedMinutes: Number(estimatedMinutes) || 15,
      campusLocation
    });

    const populatedTask = await Task.findById(task._id).populate('postedBy', 'name email trustBadges karmaScore');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task details
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('postedBy', 'name email skills trustBadges karmaScore campusLocation')
      .populate('acceptedBy', 'name email skills trustBadges karmaScore campusLocation');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskObj = task.toObject();
    taskObj.walkTimeEstimate = calculateWalkTimeEstimate(
      task.postedBy?.campusLocation || 'North Campus Library',
      task.campusLocation
    );

    res.json(taskObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task details', error: error.message });
  }
});

// @route   PATCH /api/tasks/:id/accept
// @desc    Accept an open task
router.patch('/:id/accept', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: `Task cannot be accepted (current status: ${task.status})` });
    }

    if (task.postedBy.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot accept your own posted task' });
    }

    task.status = 'accepted';
    task.acceptedBy = req.user.id;
    task.acceptedAt = new Date();
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('postedBy', 'name email trustBadges')
      .populate('acceptedBy', 'name email trustBadges');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting task', error: error.message });
  }
});

// @route   PATCH /api/tasks/:id/complete
// @desc    Mark task as completed (dual confirmation / requester confirmation)
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'accepted' && task.status !== 'completed') {
      return res.status(400).json({ message: 'Only accepted tasks can be marked complete' });
    }

    const isPoster = task.postedBy.toString() === req.user.id;
    const isAcceptor = task.acceptedBy?.toString() === req.user.id;

    if (!isPoster && !isAcceptor) {
      return res.status(403).json({ message: 'Only task poster or assigned volunteer can mark as completed' });
    }

    if (isPoster) task.postedByConfirmed = true;
    if (isAcceptor) task.acceptedByConfirmed = true;

    // Task is marked complete when requester confirms, or both confirm
    if (task.postedByConfirmed || (task.postedByConfirmed && task.acceptedByConfirmed)) {
      task.status = 'completed';
      task.completedAt = new Date();

      // Award Karma & update streak to the volunteer helper (acceptedBy)
      if (task.acceptedBy) {
        const helper = await User.findById(task.acceptedBy);
        if (helper) {
          const earnedKarma = calculateKarmaPoints(task);
          helper.karmaScore = (helper.karmaScore || 0) + earnedKarma;

          const streakInfo = calculateUpdatedStreak(helper);
          helper.streakCount = streakInfo.streakCount;
          helper.lastHelpedDate = streakInfo.lastHelpedDate;

          // Recompute badges for helper
          helper.trustBadges = await computeTrustBadges(helper);
          await helper.save();
        }
      }

      // Recompute badges for requester
      const requester = await User.findById(task.postedBy);
      if (requester) {
        requester.trustBadges = await computeTrustBadges(requester);
        await requester.save();
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('postedBy', 'name email skills trustBadges karmaScore')
      .populate('acceptedBy', 'name email skills trustBadges karmaScore');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error marking task complete', error: error.message });
  }
});

// @route   PATCH /api/tasks/:id/cancel
// @desc    Cancel a task
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.postedBy.toString() !== req.user.id && task.acceptedBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this task' });
    }

    task.status = 'cancelled';
    await task.save();

    res.json({ message: 'Task cancelled successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling task', error: error.message });
  }
});

// @route   POST /api/tasks/:id/chat
// @desc    Send a message in direct task chat (requester, volunteer, or participant)
router.post('/:id/chat', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newMessage = {
      sender: req.user.id,
      senderName: req.user.name,
      text: text.trim(),
      createdAt: new Date()
    };

    task.messages.push(newMessage);
    await task.save();

    res.status(201).json({ message: 'Message sent', messages: task.messages });
  } catch (error) {
    res.status(500).json({ message: 'Error sending task chat message', error: error.message });
  }
});

// @route   GET /api/tasks/:id/chat
// @desc    Get direct task chat messages
router.get('/:id/chat', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ messages: task.messages || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task chat', error: error.message });
  }
});

export default router;
