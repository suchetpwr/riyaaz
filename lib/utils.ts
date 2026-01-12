/**
 * Calculate streaks from an array of practice dates
 * @param entries Array of objects with date field, sorted or unsorted
 * @returns Object with currentStreak and longestStreak
 */
export function calculateStreaks(entries: { date: Date }[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort entries by date descending (most recent first)
  const sortedEntries = entries
    .map((entry) => new Date(entry.date))
    .sort((a, b) => b.getTime() - a.getTime());

  // Get unique dates only (in case of multiple entries per day)
  const uniqueDates = Array.from(
    new Set(sortedEntries.map((date) => date.toDateString()))
  ).map((dateStr) => new Date(dateStr));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak (from most recent date backwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  // Check if the most recent practice was today or yesterday
  const daysSinceLastPractice = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastPractice <= 1) {
    // Start calculating current streak
    let expectedDate = new Date(mostRecentDate);
    
    for (const date of uniqueDates) {
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);

      if (currentDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        // Move expected date back by one day
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        // Break in streak
        break;
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const nextDate = new Date(uniqueDates[i + 1]);
    
    currentDate.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
  };
}

/**
 * Calculate total points for a student in a classroom
 * Streaks counted by unique days, but points awarded for every entry
 * @param riyaazEntries Array of riyaaz entries
 * @param homeworkSubmissions Array of homework submissions
 * @returns Total points
 */
export function calculatePoints(
  riyaazEntries: { date: Date }[],
  homeworkSubmissions: any[]
): number {
  // Award 10 points per riyaaz entry (allows multiple per day)
  const riyaazPoints = riyaazEntries.length * 10;
  const homeworkPoints = homeworkSubmissions.length * 20;

  return riyaazPoints + homeworkPoints;
}

/**
 * Generate a unique join code for classrooms
 * Format: RZ-XXXX (e.g., RZ-3F8K)
 */
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RZ-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Normalize a date to midnight (for consistent date comparisons)
 */
export function normalizeDate(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
