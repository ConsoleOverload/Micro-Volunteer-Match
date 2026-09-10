const Notification = require('../models/Notification');

const BADGES_DEFINITIONS = [
  {
    id: 'first_step',
    name: '🌱 First Step',
    description: 'Completed your first micro-task!',
    icon: '🌱',
    condition: (user) => user.completedTasksCount >= 1,
  },
  {
    id: 'quick_helper',
    name: '⚡ Quick Helper',
    description: 'Completed 3 micro-tasks.',
    icon: '⚡',
    condition: (user) => user.completedTasksCount >= 3,
  },
  {
    id: 'community_builder',
    name: '💙 Community Builder',
    description: 'Contributed 60+ minutes of volunteer time.',
    icon: '💙',
    condition: (user) => user.contributionMinutes >= 60,
  },
  {
    id: 'consistent_helper',
    name: '🔥 Consistent Helper',
    description: 'Completed tasks across 5 different days or 5 total tasks.',
    icon: '🔥',
    condition: (user) => user.streakDays >= 5 || user.completedTasksCount >= 5,
  },
  {
    id: 'impact_maker',
    name: '🏆 Impact Maker',
    description: 'Contributed 300+ minutes of volunteer time.',
    icon: '🏆',
    condition: (user) => user.contributionMinutes >= 300,
  },
];

/**
 * Checks and updates badges for a user securely.
 */
async function evaluateAndAwardBadges(user) {
  if (!user) return [];

  const existingBadgeIds = new Set((user.badges || []).map((b) => b.id));
  const newBadges = [];

  for (const badgeDef of BADGES_DEFINITIONS) {
    if (!existingBadgeIds.has(badgeDef.id) && badgeDef.condition(user)) {
      const newBadge = {
        id: badgeDef.id,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        awardedAt: new Date(),
      };

      user.badges.push(newBadge);
      newBadges.push(newBadge);

      // Create in-app notification for user
      await Notification.create({
        recipient: user._id,
        type: 'BADGE_EARNED',
        title: `Badge Unlocked: ${badgeDef.name}!`,
        message: `Congratulations! You earned the "${badgeDef.name}" badge (${badgeDef.description}).`,
      });
    }
  }

  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
}

module.exports = {
  BADGES_DEFINITIONS,
  evaluateAndAwardBadges,
};
