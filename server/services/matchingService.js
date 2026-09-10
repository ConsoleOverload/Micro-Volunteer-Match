/**
 * Intelligent Matching Engine for Micro-Volunteer Match
 * Implements 5-Factor Weighted Algorithm:
 * - Skills: 40%
 * - Availability: 25%
 * - Interests: 15%
 * - Location: 10%
 * - Duration Preference: 10%
 * Includes semantic similarity understanding (e.g. Web Development <-> React, Design <-> Poster).
 */

const DEFAULT_WEIGHTS = {
  skills: 0.40,
  availability: 0.25,
  interests: 0.15,
  location: 0.10,
  duration: 0.10,
};

// Semantic synonym map for AI/smart fallback matching
const SEMANTIC_SYNONYMS = {
  'python': ['coding', 'programming', 'software', 'data', 'education', 'scripting', 'tech'],
  'react': ['web development', 'frontend', 'javascript', 'ui', 'coding', 'webpage', 'website'],
  'web development': ['react', 'html', 'css', 'javascript', 'frontend', 'website', 'webpage'],
  'graphic design': ['design', 'poster', 'flyer', 'logo', 'ui design', 'canva', 'figma', 'creative'],
  'design': ['graphic design', 'poster', 'flyer', 'logo', 'ui', 'canva', 'figma'],
  'tutoring': ['teaching', 'education', 'mentoring', 'math', 'science', 'python', 'homework'],
  'translation': ['languages', 'spanish', 'french', 'hindi', 'english', 'interpreting', 'notice'],
  'community': ['volunteering', 'event', 'outreach', 'local', 'support', 'organizing'],
  'event support': ['event', 'chairs', 'setup', 'coordination', 'hosting', 'volunteering'],
};

/**
 * Checks semantic similarity between user skills/interests and task requirements.
 */
function areSemanticallyRelated(termA, termB) {
  const a = termA.toLowerCase().trim();
  const b = termB.toLowerCase().trim();

  if (a.includes(b) || b.includes(a)) return true;

  for (const [key, synonyms] of Object.entries(SEMANTIC_SYNONYMS)) {
    const group = [key, ...synonyms];
    const matchA = group.some((s) => a.includes(s) || s.includes(a));
    const matchB = group.some((s) => b.includes(s) || s.includes(b));
    if (matchA && matchB) return true;
  }

  return false;
}

/**
 * Calculates match score and human readable match reasons for a task vs user profile.
 */
function calculateTaskMatch(user, task, weights = DEFAULT_WEIGHTS) {
  if (!user || !task) {
    return { score: 0.75, matchPercentage: 75, reasons: ['General opportunity'] };
  }

  const reasons = [];
  let totalScore = 0;

  // 1. SKILLS MATCH (40%)
  const userSkills = (user.skills || []).map((s) => s.toLowerCase().trim());
  const taskSkills = (task.requiredSkills || []).map((s) => s.toLowerCase().trim());

  let skillScore = 0;
  let matchedSkills = [];

  if (taskSkills.length === 0) {
    skillScore = 1.0;
    reasons.push('✓ Open to all skill levels');
  } else {
    matchedSkills = taskSkills.filter((ts) =>
      userSkills.some((us) => areSemanticallyRelated(us, ts))
    );

    if (matchedSkills.length > 0) {
      skillScore = Math.min(1.0, (matchedSkills.length / taskSkills.length) + 0.2);
      reasons.push(`✓ Matches your ${matchedSkills.slice(0, 2).join(', ')} skill${matchedSkills.length > 1 ? 's' : ''}`);
    } else {
      // Check task title/desc against user skills
      const titleDesc = `${task.title} ${task.description}`.toLowerCase();
      const indirectSkillMatch = userSkills.find((us) => areSemanticallyRelated(us, titleDesc));
      if (indirectSkillMatch) {
        skillScore = 0.8;
        reasons.push(`✓ Your ${indirectSkillMatch} skills match this task requirement`);
      } else {
        skillScore = 0.25;
      }
    }
  }
  totalScore += skillScore * weights.skills;

  // 2. AVAILABILITY MATCH (25%)
  let availScore = 0.8;
  if (user.availability) {
    const prefTime = (task.preferredTime || '').toLowerCase();
    const timeSlots = (user.availability.timeSlots || []).map((t) => t.toLowerCase());

    if (timeSlots.length === 0 || prefTime === 'flexible' || timeSlots.some((slot) => prefTime.includes(slot) || slot.includes(prefTime))) {
      availScore = 1.0;
      reasons.push(`✓ Within your available time window`);
    } else {
      availScore = 0.75;
      reasons.push(`✓ Flexible schedule match`);
    }
  } else {
    availScore = 0.9;
    reasons.push(`✓ Fits general availability`);
  }
  totalScore += availScore * weights.availability;

  // 3. INTERESTS MATCH (15%)
  const userInterests = (user.interests || []).map((i) => i.toLowerCase().trim());
  const taskCategory = (task.category || '').toLowerCase().trim();
  const taskDesc = (task.description || '').toLowerCase();

  let interestScore = 0.3;
  if (userInterests.length === 0) {
    interestScore = 0.8;
  } else {
    const categoryMatch = userInterests.some((ui) => areSemanticallyRelated(ui, taskCategory));
    if (categoryMatch) {
      interestScore = 1.0;
      reasons.push(`✓ Aligns with your ${task.category} interest`);
    } else {
      const keywordMatch = userInterests.some((ui) => areSemanticallyRelated(ui, taskDesc));
      if (keywordMatch) {
        interestScore = 0.8;
        reasons.push(`✓ Fits your personal area of interest`);
      } else {
        interestScore = 0.4;
      }
    }
  }
  totalScore += interestScore * weights.interests;

  // 4. LOCATION MATCH (10%)
  let locScore = 0.5;
  const userLoc = (user.location || '').toLowerCase();
  const taskLoc = (task.location || '').toLowerCase();

  if (task.isRemote || taskLoc.includes('remote') || taskLoc.includes('online')) {
    locScore = 1.0;
    reasons.push(`✓ Online / Remote micro-task`);
  } else if (userLoc && taskLoc && (userLoc.includes(taskLoc) || taskLoc.includes(userLoc) || userLoc.includes('campus'))) {
    locScore = 1.0;
    reasons.push(`✓ Location match (${task.location})`);
  } else {
    locScore = 0.7;
  }
  totalScore += locScore * weights.location;

  // 5. DURATION PREFERENCE (10%)
  let durScore = 1.0;
  const preferredDur = user.preferredDuration || 15;
  const taskDur = task.duration || 15;

  if (taskDur <= preferredDur) {
    durScore = 1.0;
    reasons.push(`✓ Quick ${taskDur}-minute duration`);
  } else if (taskDur <= preferredDur + 15) {
    durScore = 0.85;
    reasons.push(`✓ ${taskDur}-minute task length`);
  } else {
    durScore = 0.6;
  }
  totalScore += durScore * weights.duration;

  // Calculate final score percentage (scale between 60% and 98%)
  let matchPercentage = Math.round(totalScore * 100);
  matchPercentage = Math.min(Math.max(matchPercentage, 60), 98);

  if (reasons.length === 0) {
    reasons.push('✓ Good match for your profile');
  }

  return {
    score: totalScore,
    matchPercentage,
    reasons,
  };
}

/**
 * Ranks an array of tasks for a given user.
 */
async function rankTasksForUser(user, tasks) {
  const scoredTasks = tasks.map((task) => {
    const matchInfo = calculateTaskMatch(user, task);
    return {
      task,
      matchPercentage: matchInfo.matchPercentage,
      reasons: matchInfo.reasons,
      score: matchInfo.score,
    };
  });

  scoredTasks.sort((a, b) => b.score - a.score);
  return scoredTasks;
}

module.exports = {
  calculateTaskMatch,
  rankTasksForUser,
};

