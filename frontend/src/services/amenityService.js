import { API_CONFIG, API_ENDPOINTS } from './config';

/**
 * Get all amenities
 * @returns {Promise<Object>} API response with amenities data
 */
export const getAllAmenities = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AMENITIES}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching amenities:', error);
    throw error;
  }
};
