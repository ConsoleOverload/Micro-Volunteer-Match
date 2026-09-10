const Task = require('../models/Task');
const Participation = require('../models/Participation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { evaluateAndAwardBadges } = require('../services/badgeEngine');

// @desc    Accept a task (Volunteer)
// @route   POST /api/tasks/:id/accept
// @access  Private
const acceptTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const volunteerId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.creator.toString() === volunteerId.toString()) {
      return res.status(400).json({ message: 'You cannot accept your own created task' });
    }

    if (task.status !== 'OPEN' && task.status !== 'MATCHED') {
      return res.status(400).json({ message: `Task is not open for acceptance (Current status: ${task.status})` });
    }

    // Check existing participation
    const existingParticipation = await Participation.findOne({
      volunteer: volunteerId,
      task: taskId,
    });

    if (existingParticipation) {
      return res.status(400).json({ message: 'You have already accepted this task' });
    }

    // Create participation record
    const participation = await Participation.create({
      volunteer: volunteerId,
      task: taskId,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    });

    // Add volunteer to task and update status
    if (!task.volunteers.includes(volunteerId)) {
      task.volunteers.push(volunteerId);
    }

    if (task.volunteers.length >= task.maxVolunteers) {
      task.status = 'ACCEPTED';
    } else {
      task.status = 'MATCHED';
    }
    await task.save();

    // Create notification for task creator
    await Notification.create({
      recipient: task.creator,
      type: 'TASK_ACCEPTED',
      title: 'Task Accepted!',
      message: `${req.user.name} accepted your task: "${task.title}".`,
      relatedTask: task._id,
    });

    return res.status(201).json({
      message: 'Task accepted successfully!',
      participation,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start working on an accepted task
// @route   POST /api/tasks/:id/start
// @access  Private
const startTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const volunteerId = req.user._id;

    const participation = await Participation.findOne({
      volunteer: volunteerId,
      task: taskId,
    });

    if (!participation) {
      return res.status(404).json({ message: 'Participation record not found' });
    }

    participation.status = 'IN_PROGRESS';
    await participation.save();

    await Task.findByIdAndUpdate(taskId, { status: 'IN_PROGRESS' });

    return res.json({ message: 'Task marked as in progress', participation });
  } catch (error) {
    next(error);
  }
};

// @desc    Volunteer marks task as completed
// @route   POST /api/tasks/:id/complete
// @access  Private
const completeTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const volunteerId = req.user._id;

    const participation = await Participation.findOne({
      volunteer: volunteerId,
      task: taskId,
    });

    if (!participation) {
      return res.status(404).json({ message: 'Participation record not found' });
    }

    participation.status = 'COMPLETED';
    participation.completedAt = new Date();
    await participation.save();

    const task = await Task.findById(taskId);
    if (task) {
      // Notify creator to confirm completion
      await Notification.create({
        recipient: task.creator,
        type: 'TASK_COMPLETED',
        title: 'Task Completed by Volunteer',
        message: `${req.user.name} marked "${task.title}" as completed. Please confirm to grant impact credit!`,
        relatedTask: task._id,
      });
    }

    return res.json({
      message: 'Task marked completed! Waiting for creator confirmation.',
      participation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Creator confirms task completion & awards contribution stats securely
// @route   POST /api/tasks/:id/confirm
// @access  Private (Creator or Admin)
const confirmTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Allow creator or admin
    if (task.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to confirm this task' });
    }

    const participations = await Participation.find({ task: taskId });
    if (participations.length === 0) {
      return res.status(400).json({ message: 'No volunteers found for this task' });
    }

    // Process completion for each volunteer
    const updatedVolunteers = [];
    for (const part of participations) {
      part.status = 'COMPLETED';
      part.confirmedAt = new Date();
      if (!part.completedAt) part.completedAt = new Date();
      await part.save();

      const volunteer = await User.findById(part.volunteer);
      if (volunteer) {
        // Securely calculate & update contribution metrics on backend
        volunteer.completedTasksCount += 1;
        volunteer.contributionMinutes += task.duration || 15;
        // Contribution score: minutes * 10 + 25 bonus
        volunteer.contributionScore += (task.duration || 15) * 10 + 25;
        
        // Calculate streak (if last active within 48h increment streak, else reset to 1)
        const now = new Date();
        const lastActive = volunteer.lastActiveDate ? new Date(volunteer.lastActiveDate) : null;
        if (lastActive) {
          const diffHours = (now - lastActive) / (1000 * 60 * 60);
          if (diffHours <= 48) {
            volunteer.streakDays = (volunteer.streakDays || 0) + 1;
          } else {
            volunteer.streakDays = 1;
          }
        } else {
          volunteer.streakDays = 1;
        }
        volunteer.lastActiveDate = now;

        await volunteer.save();
        const awardedBadges = await evaluateAndAwardBadges(volunteer);
        updatedVolunteers.push({ volunteer: volunteer.name, awardedBadges });

        // Notify volunteer
        await Notification.create({
          recipient: volunteer._id,
          type: 'TASK_COMPLETED',
          title: 'Impact Confirmed! 🎉',
          message: `Your ${task.duration}-minute contribution for "${task.title}" has been confirmed! +${task.duration} mins added to your profile.`,
          relatedTask: task._id,
        });
      }
    }

    task.status = 'COMPLETED';
    await task.save();

    return res.json({
      message: 'Task completion confirmed successfully!',
      task,
      updatedVolunteers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  acceptTask,
  startTask,
  completeTask,
  confirmTask,
};
