const SavedTask = require('../models/SavedTask');
const Task = require('../models/Task');
const { calculateTaskMatch } = require('../services/matchingService');

// @desc    Save a task to bookmarks
// @route   POST /api/tasks/:id/save
// @access  Private
const saveTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const existing = await SavedTask.findOne({ user: userId, task: taskId });
    if (existing) {
      return res.status(400).json({ message: 'Task is already saved' });
    }

    const saved = await SavedTask.create({ user: userId, task: taskId });
    return res.status(201).json({ message: 'Task saved successfully', saved });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a task from bookmarks
// @route   DELETE /api/tasks/:id/save
// @access  Private
const unsaveTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;

    await SavedTask.findOneAndDelete({ user: userId, task: taskId });
    return res.json({ message: 'Task removed from saved items' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved tasks for user
// @route   GET /api/saved
// @access  Private
const getSavedTasks = async (req, res, next) => {
  try {
    const saved = await SavedTask.find({ user: req.user._id })
      .populate({
        path: 'task',
        populate: { path: 'creator', select: 'name avatar role location' },
      })
      .sort({ createdAt: -1 });

    const tasks = saved
      .filter((item) => item.task != null)
      .map((item) => {
        const taskObj = item.task.toObject();
        const matchInfo = calculateTaskMatch(req.user, item.task);

        return {
          ...taskObj,
          matchPercentage: matchInfo.matchPercentage,
          matchReasons: matchInfo.reasons,
          isSaved: true,
        };
      });

    return res.json(tasks);
  } catch (error) {
    next(error);
  }
};

module.exports = { saveTask, unsaveTask, getSavedTasks };
