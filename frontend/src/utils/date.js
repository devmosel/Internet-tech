// Date formatting helpers

// Add ordinal suffix (1st, 2nd, 3rd, etc)
export const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  
  return 'th';
};

// Format date as "October 16th, 2025"
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

// Check if date is Saturday or Sunday
export const isWeekend = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// Format with day name ("Monday, October 27, 2025")
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
