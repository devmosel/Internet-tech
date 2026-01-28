/**
 * Task Service
 * Handles all task-related API calls
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
 * Get tasks by assignment ID
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} API response with tasks
 */
export const getTasksByAssignment = async (assignmentId) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TASKS_BY_ASSIGNMENT(assignmentId)}`;
    console.log('Fetching tasks from URL:', url);
    
    const headers = getAuthHeaders();
    console.log('Request headers:', headers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Tasks data received:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Create a new task for an assignment
 * @param {number} assignmentId - Assignment ID
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} Created task data
 */
export const createTask = async (assignmentId, taskData) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.POST_TASK_TO_ASSIGNMENT(assignmentId)}`;
    console.log('Creating task at URL:', url);
    console.log('Task data:', taskData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {number} taskId - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task data
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPDATE_TASK(taskId)}`;
    console.log('Updating task at URL:', url);
    console.log('Task data:', taskData);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {number} taskId - Task ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteTask = async (taskId) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.DELETE_TASK(taskId)}`;
    console.log('Deleting task at URL:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
