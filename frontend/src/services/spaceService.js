/**
 * Space Service
 * Handles all space-related API calls
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
 * Search for available spaces with date and time filters
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {Promise<Object>} Response containing array of spaces
 */
export const searchSpaces = async (date, startTime, endTime) => {
  try {
    const params = new URLSearchParams({
      date,
      start_time: startTime,
      end_time: endTime,
    });

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SPACES}?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await response.json();
    console.log('Search spaces API response:', result);
    // Handle API response format: { success, message, status_code, data }
    if (!result.success) {
      const error = new Error(result.message || 'Failed to fetch spaces');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    // Only log unexpected errors, not API validation errors
    if (!error.response) {
      console.error('Search spaces error:', error);
    }
    throw error;
  }
};

/**
 * Get all spaces (without filters)
 * @returns {Promise<Object>} Response containing array of all spaces
 */
export const getAllSpaces = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SPACES}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    console.log('Get all spaces response status:', response.status);

    if (!response.ok) {
      throw new Error('Failed to fetch spaces');
    }

    return await response.json();
  } catch (error) {
    console.error('Get all spaces error:', error);
    throw error;
  }
};

/**
 * Get space by ID
 * @param {string|number} spaceId - Space ID
 * @returns {Promise<Object>} Space details
 */
export const getSpaceById = async (spaceId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SPACE_BY_ID(spaceId)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch space details');
    }

    return await response.json();
  } catch (error) {
    console.error('Get space by ID error:', error);
    throw error;
  }
};

/**
 * Get all spaces for management view
 * @returns {Promise<Object>} Response containing array of spaces with management details
 */
export const getAllSpacesForManage = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.MANAGE_SPACES}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch spaces for management');
    }

    return await response.json();
  } catch (error) {
    console.error('Get spaces for management error:', error);
    throw error;
  }
};

/**
 * Update space status (available/maintenance)
 * @param {string|number} spaceId - Space ID
 * @param {string} status - New status ('available' or 'maintenance')
 * @returns {Promise<Object>} Response from API
 */
export const updateSpaceStatus = async (spaceId, status) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/spaces/manage/${spaceId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update space status');
    }

    return await response.json();
  } catch (error) {
    console.error('Update space status error:', error);
    throw error;
  }
};
