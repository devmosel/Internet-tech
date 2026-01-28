/**
 * Assignment Service
 * Handles all assignment-related API calls
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
 * Get all assignments
 * @returns {Promise<Object>} API response with all assignments
 */
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
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

/**
 * Get assignment by ID
 * @param {number} id - Assignment ID
 * @returns {Promise<Object>} Assignment data
 */
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
    console.error('Error fetching assignment:', error);
    throw error;
  }
};

/**
 * Create a new assignment
 * @param {Object} assignmentData - Assignment data to create
 * @returns {Promise<Object>} Created assignment data
 */
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
    console.error('Error creating assignment:', error);
    throw error;
  }
};

/**
 * Update an existing assignment
 * @param {number} id - Assignment ID to update
 * @param {Object} assignmentData - Updated assignment data
 * @returns {Promise<Object>} Updated assignment data
 */
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
    console.error('Error updating assignment:', error);
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
    console.error('Error deleting assignment:', error);
    throw error;
  }
};
