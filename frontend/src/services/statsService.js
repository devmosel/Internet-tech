// Stats service - dashboard statistics

import { API_CONFIG, API_ENDPOINTS } from './config';
import { auth } from '@/lib/auth';

const getAuthHeaders = () => {
  const token = auth.getToken();
  const headers = { ...API_CONFIG.HEADERS };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Get employee statistics
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

    if (!result.success) {
      const error = new Error(result.message || 'Failed to fetch statistics');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    throw error;
  }
};
