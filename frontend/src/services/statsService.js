/**
 * Stats Service
 * Handles all statistics-related API calls
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
 * Get employee statistics
 * @returns {Promise<Object>} User statistics
 */
export const getEmployeeStats = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.STATS}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await response.json();
    console.log('Stats API response:', result);

    // Handle API response format: { success, message, status_code, data }
    if (!result.success) {
      const error = new Error(result.message || 'Failed to fetch statistics');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    // Only log unexpected errors, not API validation errors
    if (!error.response) {
      console.error('Get employee stats error:', error);
    }
    throw error;
  }
};
