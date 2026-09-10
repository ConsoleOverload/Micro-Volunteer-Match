const Task = require('../models/Task');
const SavedTask = require('../models/SavedTask');
const { calculateTaskMatch } = require('../services/matchingService');

// @desc    Create a new micro-task
// @route   POST /api/tasks
// @access  Private (Creator or Volunteer)
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      duration,
      difficulty,
      location,
      isRemote,
      preferredDate,
      preferredTime,
      maxVolunteers,
      contactInstructions,
      imageUrl,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const task = await Task.create({
      title,
      description,
      category,
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills
        ? requiredSkills.split(',').map((s) => s.trim())
        : [],
      duration: duration ? Number(duration) : 15,
      difficulty: difficulty || 'Easy',
      location: location || 'Campus / Remote',
      isRemote: isRemote !== undefined ? isRemote : true,
      preferredDate: preferredDate || Date.now(),
      preferredTime: preferredTime || 'Flexible',
      creator: req.user._id,
      maxVolunteers: maxVolunteers ? Number(maxVolunteers) : 1,
      contactInstructions: contactInstructions || 'Contact details shared upon acceptance.',
      imageUrl: imageUrl || '',
    });

    const populatedTask = await Task.findById(task._id).populate('creator', 'name email avatar role');

    return res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filtering, search, sorting & pagination
// @route   GET /api/tasks
// @access  Public (Optional auth for match percentage)
const getTasks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      skill,
      duration,
      difficulty,
      location,
      status,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter status (default to OPEN if not explicitly requested all)
    if (status) {
      query.status = status;
    } else {
      query.status = 'OPEN';
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Skill filter
    if (skill && skill !== 'All') {
      query.requiredSkills = { $elemMatch: { $regex: skill, $options: 'i' } };
    }

    // Duration filter
    if (duration && duration !== 'All') {
      query.duration = Number(duration);
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Location filter
    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Execute query
    let tasksQuery = Task.find(query).populate('creator', 'name avatar role location');

    // Sorting
    if (sort === 'shortest') {
      tasksQuery = tasksQuery.sort({ duration: 1, createdAt: -1 });
    } else if (sort === 'oldest') {
      tasksQuery = tasksQuery.sort({ createdAt: 1 });
    } else {
      // Default newest
      tasksQuery = tasksQuery.sort({ createdAt: -1 });
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    tasksQuery = tasksQuery.skip(skip).limit(Number(limit));

    const [rawTasks, totalTasks] = await Promise.all([
      tasksQuery.exec(),
      Task.countDocuments(query),
    ]);

    // Attach match metadata if user is logged in
    let userSavedTaskIds = new Set();
    if (req.user) {
      const savedTasks = await SavedTask.find({ user: req.user._id }).select('task');
      userSavedTaskIds = new Set(savedTasks.map((s) => s.task.toString()));
    }

    const tasks = rawTasks.map((task) => {
      const taskObj = task.toObject();
      let matchInfo = { matchPercentage: 75, reasons: ['Micro-volunteering task'] };

      if (req.user) {
        matchInfo = calculateTaskMatch(req.user, task);
      }

      return {
        ...taskObj,
        matchPercentage: matchInfo.matchPercentage,
        matchReasons: matchInfo.reasons,
        isSaved: req.user ? userSavedTaskIds.has(task._id.toString()) : false,
      };
    });

    // If sort by match percentage requested
    if (sort === 'match' && req.user) {
      tasks.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return res.json({
      tasks,
      page: Number(page),
      pages: Math.ceil(totalTasks / Number(limit)) || 1,
      totalTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Public (Optional Auth)
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('creator', 'name email avatar role bio location')
      .populate('volunteers', 'name avatar role skills');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskObj = task.toObject();
    let matchInfo = { matchPercentage: 75, reasons: ['Micro-volunteering task'] };
    let isSaved = false;

    if (req.user) {
      matchInfo = calculateTaskMatch(req.user, task);
      const saved = await SavedTask.findOne({ user: req.user._id, task: task._id });
      isSaved = !!saved;
    }

    return res.json({
      ...taskObj,
      matchPercentage: matchInfo.matchPercentage,
      matchReasons: matchInfo.reasons,
      isSaved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Creator or Admin)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check ownership or admin
    if (task.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    Object.assign(task, req.body);
    const updatedTask = await task.save();

    return res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Creator or Admin)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Task removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
