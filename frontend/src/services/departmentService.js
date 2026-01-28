import { API_CONFIG, API_ENDPOINTS } from './config';

/**
 * Get all departments
 */
export const getAllDepartments = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.DEPARTMENTS}`, {
      method: 'GET',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch departments');
    }

    return data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

/**
 * Create a new department
 */
export const createDepartment = async (departmentData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.DEPARTMENTS}`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(departmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create department');
    }

    return data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

/**
 * Update an existing department
 */
export const updateDepartment = async (departmentId, departmentData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.DEPARTMENTS}/${departmentId}`, {
      method: 'PUT',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(departmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update department');
    }

    return data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

/**
 * Delete a department
 */
export const deleteDepartment = async (departmentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.DEPARTMENTS}/${departmentId}`, {
      method: 'DELETE',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete department');
    }

    return data;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};
