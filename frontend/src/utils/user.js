// User data helpers

// Get user display name with fallback
export const getUserDisplayName = (user) => {
  if (!user) return 'User';
  
  if (user.name) return user.name;
  if (user.username) return user.username;
  if (user.email) return user.email.split('@')[0];
  
  return 'User';
};

// Get user initials for avatar
export const getUserInitials = (user) => {
  if (!user) return 'U';
  
  const displayName = getUserDisplayName(user);
  
  // Full name? Get first and last initials
  const names = displayName.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  
  return displayName.substring(0, 2).toUpperCase();
};
