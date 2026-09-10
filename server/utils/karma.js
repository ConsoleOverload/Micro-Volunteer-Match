export const calculateKarmaPoints = (task) => {
  let points = 10; // Base points per task
  if (task.isUrgent) {
    points += 10; // Urgent tasks worth +20 total
  }

  if (task.acceptedAt && task.completedAt) {
    const elapsedMinutes = (new Date(task.completedAt) - new Date(task.acceptedAt)) / (1000 * 60);
    if (elapsedMinutes <= (task.estimatedMinutes || 15)) {
      points += 5; // Bonus for completion within target time window
    }
  }

  return points;
};

export const getKarmaTier = (score = 0) => {
  if (score >= 300) return { title: 'Community Champion', badge: '🏆', min: 300, max: Infinity };
  if (score >= 150) return { title: 'Campus Regular', badge: '⭐', min: 150, max: 299 };
  if (score >= 50) return { title: 'Rising Helper', badge: '🌱', min: 50, max: 149 };
  return { title: 'New Neighbor', badge: '👋', min: 0, max: 49 };
};

export const calculateUpdatedStreak = (user) => {
  const now = new Date();
  if (!user.lastHelpedDate) {
    return { streakCount: 1, lastHelpedDate: now };
  }

  const diffTime = Math.abs(now - new Date(user.lastHelpedDate));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    // Helped within the current week, preserve or start streak if 0
    return { streakCount: user.streakCount === 0 ? 1 : user.streakCount, lastHelpedDate: now };
  } else if (diffDays <= 14) {
    // Helped in the next consecutive week, increment streak!
    return { streakCount: (user.streakCount || 0) + 1, lastHelpedDate: now };
  } else {
    // Over 2 weeks since last help, reset streak to 1
    return { streakCount: 1, lastHelpedDate: now };
  }
};
