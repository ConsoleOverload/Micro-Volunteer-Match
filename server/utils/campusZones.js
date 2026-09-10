export const CAMPUS_ZONES = [
  'Anurag University - A-Block (Engineering)',
  'Anurag University - B-Block (Pharmacy & Sciences)',
  'Anurag University - C-Block (Management & Humanities)',
  'Anurag University - Central Library',
  'Anurag University - Student Activity Center',
  'Anurag University - Sports Complex & Grounds',
  'Anurag University - Campus Cafeteria'
];

const ZONE_ADJACENCY = {
  'Anurag University - A-Block (Engineering)': ['Anurag University - Central Library', 'Anurag University - B-Block (Pharmacy & Sciences)'],
  'Anurag University - B-Block (Pharmacy & Sciences)': ['Anurag University - A-Block (Engineering)', 'Anurag University - C-Block (Management & Humanities)'],
  'Anurag University - C-Block (Management & Humanities)': ['Anurag University - B-Block (Pharmacy & Sciences)', 'Anurag University - Student Activity Center'],
  'Anurag University - Central Library': ['Anurag University - A-Block (Engineering)', 'Anurag University - Student Activity Center'],
  'Anurag University - Student Activity Center': ['Anurag University - Central Library', 'Anurag University - Campus Cafeteria'],
  'Anurag University - Sports Complex & Grounds': ['Anurag University - Student Activity Center', 'Anurag University - Campus Cafeteria'],
  'Anurag University - Campus Cafeteria': ['Anurag University - Student Activity Center', 'Anurag University - Sports Complex & Grounds']
};

export const calculateWalkTimeEstimate = (userLocation, taskLocation) => {
  if (!userLocation || !taskLocation) return '~10 min walk';
  if (userLocation.toLowerCase().trim() === taskLocation.toLowerCase().trim()) {
    return '~5 min walk (Same Zone)';
  }

  const adjacent = ZONE_ADJACENCY[userLocation] || [];
  if (adjacent.includes(taskLocation)) {
    return '~10 min walk (Adjacent)';
  }

  return '~15+ min walk';
};
