// Assignment service - manage assignments

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

// Get all assignments
export const getAllAssignments = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ASSIGNMENTS}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get assignment by ID
export const getAssignmentById = async (id) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ASSIGNMENT_BY_ID(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Create new assignment
export const createAssignment = async (assignmentData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ASSIGNMENTS}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create assignment');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Update assignment
export const updateAssignment = async (id, assignmentData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ASSIGNMENT_BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update assignment');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Delete an assignment
 * @param {number} id - Assignment ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteAssignment = async (id) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ASSIGNMENT_BY_ID(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete assignment');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
