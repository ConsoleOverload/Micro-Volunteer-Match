const User = require('../models/User');
const Task = require('../models/Task');
const Participation = require('../models/Participation');

// @desc    Get system administration statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const openTasks = await Task.countDocuments({ status: 'OPEN' });
    const completedTasks = await Task.countDocuments({ status: 'COMPLETED' });
    const totalParticipations = await Participation.countDocuments();

    // Total contribution minutes across all users
    const result = await User.aggregate([
      { $group: { _id: null, totalMinutes: { $sum: '$contributionMinutes' } } },
    ]);
    const totalContributionMinutes = result[0] ? result[0].totalMinutes : 0;

    return res.json({
      totalUsers,
      totalTasks,
      openTasks,
      completedTasks,
      totalParticipations,
      totalContributionMinutes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin view)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or profile
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) user.role = role;
    await user.save();

    return res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, updateUserRole };
