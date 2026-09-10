import { Task } from '../models/Task.js';

export const computeTrustBadges = async (user) => {
  const badges = [];

  // Fetch completed tasks accepted or posted by user
  const completedTasks = await Task.find({
    acceptedBy: user._id,
    status: 'completed'
  });

  const completedCount = completedTasks.length;

  // 1. "Verified" badge: profile complete + 1 completed task
  const isProfileComplete = user.name && user.skills?.length > 0 && user.campusLocation;
  if (isProfileComplete && completedCount >= 1) {
    badges.push('Verified');
  }

  // 2. "Campus Regular" badge: 10+ completed tasks
  if (completedCount >= 10) {
    badges.push('Campus Regular');
  }

  // 3. "Fast Responder" badge: average accept time under 10 mins across last 5 tasks
  const last5Accepted = await Task.find({
    acceptedBy: user._id,
    acceptedAt: { $ne: null }
  })
    .sort({ acceptedAt: -1 })
    .limit(5);

  if (last5Accepted.length >= 3) {
    const totalMinutes = last5Accepted.reduce((acc, t) => {
      const created = new Date(t.createdAt);
      const accepted = new Date(t.acceptedAt);
      const diffMin = (accepted - created) / (1000 * 60);
      return acc + (diffMin > 0 ? diffMin : 0);
    }, 0);

    const avgMin = totalMinutes / last5Accepted.length;
    if (avgMin <= 10) {
      badges.push('Fast Responder');
    }
  }

  return badges;
};
