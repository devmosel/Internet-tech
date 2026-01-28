/**
 * User utility functions
 * Helpers for user data manipulation and display
 */

/**
 * Get user's display name with fallback priority
 * @param {Object} user - User object from auth
 * @returns {string} Display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'User';
  
  // Priority: name > username > email username part
  if (user.name) return user.name;
  if (user.username) return user.username;
  if (user.email) return user.email.split('@')[0];
  
  return 'User';
};

/**
 * Get user initials for avatar
 * @param {Object} user - User object from auth
 * @returns {string} Initials (2 characters)
 */
export const getUserInitials = (user) => {
  if (!user) return 'U';
  
  const displayName = getUserDisplayName(user);
  
  // If it's a full name with spaces, get first and last initials
  const names = displayName.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  
  // Otherwise take first 2 characters
  return displayName.substring(0, 2).toUpperCase();
};
