// Task service - CRUD for tasks

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

// Get tasks for an assignment
export const getTasksByAssignment = async (assignmentId) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TASKS_BY_ASSIGNMENT(assignmentId)}`;
    
    const headers = getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Create new task
export const createTask = async (assignmentId, taskData) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.POST_TASK_TO_ASSIGNMENT(assignmentId)}`;
    
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
    throw error;
  }
};

// Update task
export const updateTask = async (taskId, taskData) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPDATE_TASK(taskId)}`;
    
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
    throw error;
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.DELETE_TASK(taskId)}`;
    
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
    throw error;
  }
};
