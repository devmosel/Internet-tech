/**
 * Date utility functions
 * Helpers for date formatting and manipulation
 */

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 * @param {number} num - The number to get suffix for
 * @returns {string} Ordinal suffix
 */
export const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  
  return 'th';
};

/**
 * Format date for display (e.g., "October 16th, 2025")
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (dateStr) => {
  const date = new Date(dateStr);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  const suffix = getOrdinalSuffix(dayNum);
  
  return `${monthName} ${dayNum}${suffix}, ${year}`;
};

/**
 * Check if date is weekend (Saturday or Sunday)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} True if weekend
 */
export const isWeekend = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Format date with day name (e.g., "Monday, October 27, 2025")
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string with day name
 */
export const formatDateWithDay = (dateStr) => {
  const date = new Date(dateStr);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  
  return `${dayName}, ${monthName} ${dayNum}, ${year}`;
};
