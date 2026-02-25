// Space service - search, get, update spaces

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

// Search available spaces by date/time
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
    if (!result.success) {
      const error = new Error(result.message || 'Failed to fetch spaces');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Get all spaces
export const getAllSpaces = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SPACES}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch spaces');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get space details
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
    throw error;
  }
};

// Get all spaces (admin)
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
    throw error;
  }
};

// Update space status
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
    throw error;
  }
};
