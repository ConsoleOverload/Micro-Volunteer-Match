const Task = require('../models/Task');
const SavedTask = require('../models/SavedTask');
const { calculateTaskMatch, rankTasksForUser } = require('../services/matchingService');

// @desc    Get top matches for the logged-in user
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Fetch OPEN tasks excluding those created by the current user
    const openTasks = await Task.find({
      status: 'OPEN',
      creator: { $ne: user._id },
    }).populate('creator', 'name avatar role location');

    // Rank tasks using our matching engine
    const rankedResults = await rankTasksForUser(user, openTasks);

    // Get user's saved tasks set
    const savedTasks = await SavedTask.find({ user: user._id }).select('task');
    const savedSet = new Set(savedTasks.map((s) => s.task.toString()));

    const matches = rankedResults.map((item) => {
      const taskObj = item.task.toObject();
      return {
        ...taskObj,
        matchPercentage: item.matchPercentage,
        matchReasons: item.reasons,
        score: item.score,
        isSaved: savedSet.has(taskObj._id.toString()),
      };
    });

    return res.json({
      matchesCount: matches.length,
      topScore: matches.length > 0 ? matches[0].matchPercentage : 0,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get match score for a specific task ID
// @route   GET /api/matches/:taskId
// @access  Private
const getTaskMatch = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('creator', 'name avatar role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const matchInfo = calculateTaskMatch(req.user, task);

    return res.json({
      taskId: task._id,
      matchPercentage: matchInfo.matchPercentage,
      matchReasons: matchInfo.reasons,
      score: matchInfo.score,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMatches, getTaskMatch };
