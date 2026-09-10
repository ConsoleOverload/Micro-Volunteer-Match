const Task = require('../models/Task');
const Participation = require('../models/Participation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { rankTasksForUser } = require('../services/matchingService');

// @desc    Get dashboard metrics & recommendations for logged-in user
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Refresh user record
    const user = await User.findById(userId);

    // 1. Fetch tasks posted by this user (Creator side)
    const userPostedTasks = await Task.find({ creator: userId })
      .populate('volunteers', 'name avatar email role skills')
      .sort({ createdAt: -1 });

    // 2. Fetch upcoming tasks accepted by this user (Volunteer side)
    const upcomingParticipations = await Participation.find({
      volunteer: userId,
      status: { $in: ['ACCEPTED', 'IN_PROGRESS'] },
    })
      .populate({
        path: 'task',
        populate: { path: 'creator', select: 'name avatar role location' },
      })
      .sort({ createdAt: -1 });

    const upcomingTasks = upcomingParticipations
      .filter((p) => p.task != null)
      .map((p) => ({
        ...p.task.toObject(),
        participationId: p._id,
        participationStatus: p.status,
      }));

    // 3. Fetch top 6 AI recommended existing tasks posted by OTHER users
    const openTasks = await Task.find({
      status: 'OPEN',
      creator: { $ne: userId },
    })
      .populate('creator', 'name avatar role location')
      .limit(25);

    const rankedTasks = await rankTasksForUser(user, openTasks);
    const recommendedTasks = rankedTasks.slice(0, 6).map((item) => ({
      ...item.task.toObject(),
      matchPercentage: item.matchPercentage,
      matchReasons: item.reasons,
    }));

    // 4. People helped calculation
    const createdTasksCompleted = await Task.find({ creator: userId, status: 'COMPLETED' });
    const peopleHelpedCount = user.completedTasksCount + createdTasksCompleted.length;

    // 5. Fetch recent activity (Notifications)
    const recentNotifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(6);

    return res.json({
      greeting: getGreetingTime(user.name),
      user: {
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
      },
      stats: {
        completedTasksCount: user.completedTasksCount,
        contributionMinutes: user.contributionMinutes,
        contributionScore: user.contributionScore,
        peopleHelped: peopleHelpedCount,
        streakDays: user.streakDays,
        postedTasksCount: userPostedTasks.length,
        recommendedCount: recommendedTasks.length,
      },
      userPostedTasks,
      recommendedTasks,
      upcomingTasks,
      recentActivity: recentNotifications,
    });
  } catch (error) {
    next(error);
  }
};

function getGreetingTime(name) {
  const hour = new Date().getHours();
  let timeOfDay = 'day';
  if (hour < 12) timeOfDay = 'morning';
  else if (hour < 17) timeOfDay = 'afternoon';
  else timeOfDay = 'evening';

  return `Good ${timeOfDay}, ${name} 👋`;
}

module.exports = { getDashboard };
