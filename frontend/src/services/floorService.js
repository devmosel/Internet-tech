import { API_CONFIG, API_ENDPOINTS } from './config';

// Get all floors
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
    throw error;
  }
};
