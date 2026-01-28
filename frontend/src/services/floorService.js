import { API_CONFIG, API_ENDPOINTS } from './config';

/**
 * Get all floors
 * @returns {Promise<Object>} API response with floors data
 */
export const getAllFloors = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.FLOORS}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching floors:', error);
    throw error;
  }
};
