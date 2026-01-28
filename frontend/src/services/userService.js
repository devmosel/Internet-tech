/**
 * User Service
 * Handles all user-related API calls
 */

import { API_CONFIG, API_ENDPOINTS } from './config';
import { auth } from '@/lib/auth';

/**
 * Get headers with authentication token
 * @returns {Object} Headers object with auth token if available
 */
const getAuthHeaders = () => {
  const token = auth.getToken();
  const headers = { ...API_CONFIG.HEADERS };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Get user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_PROFILE}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPDATE_PROFILE}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

/**
 * Get all users (admin only)
 * @returns {Promise<Object>} All users data
 */
export const getAllUsers = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Get team users by department (manager only)
 * @returns {Promise<Object>} Team users data with department info
 */
export const getTeamUsers = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TEAM_USERS}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch team users');
    }

    const result = await response.json();

    // Return the full response including department info
    return {
      success: result.success,
      data: result.data?.users || [],
      department: result.data?.department || null,
      total_users: result.data?.total_users || 0,
      message: result.message
    };
  } catch (error) {
    console.error('Get team users error:', error);
    throw error;
  }
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user data
 */
export const createUser = async (userData) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    return await response.json();
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

/**
 * Update an existing user (admin only)
 * @param {number} userId - User ID to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS}/${userId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return await response.json();
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

/**
 * Delete a user (admin only)
 * @param {number} userId - User ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS}/${userId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

/**
 * Create a new team user (manager only)
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user data
 */
export const createTeamUser = async (userData) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TEAM_USERS}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create team user');
    }

    return await response.json();
  } catch (error) {
    console.error('Create team user error:', error);
    throw error;
  }
};

/**
 * Update a team user (manager only)
 * @param {number} userId - User ID to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateTeamUser = async (userId, userData) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TEAM_USER_BY_ID(userId)}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update team user');
    }

    return await response.json();
  } catch (error) {
    console.error('Update team user error:', error);
    throw error;
  }
};

/**
 * Delete a team user (manager only)
 * @param {number} userId - User ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteTeamUser = async (userId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TEAM_USER_BY_ID(userId)}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete team user');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete team user error:', error);
    throw error;
  }
};

