/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { API_CONFIG, API_ENDPOINTS } from './config';

/**
 * Login user with credentials
 * @param {string} username - User's username or email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response containing token and user data
 */
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();

    // Extract token and user data from response
    const token = data.data?.access_token || data.data?.token || data.access_token || data.token;
    const userData = data.data?.user || data.user;

    if (!token) {
      throw new Error('No token received from server');
    }

    // Store token and user data in cookies/localStorage
    const { auth } = await import('@/lib/auth');
    auth.login(token, userData);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout response
 */
export const logout = async () => {
  try {
    // Get auth token
    const { auth } = await import('@/lib/auth');
    const token = auth.getToken();

    const headers = { ...API_CONFIG.HEADERS };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Try to call logout API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
      method: 'POST',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Don't throw on API error - logout should always succeed locally
      console.warn('Logout API returned error, but continuing with local logout');
      return { success: true, message: 'Logged out locally' };
    }

    return await response.json();
  } catch (error) {
    // Don't throw error - logout should always succeed
    console.warn('Logout API call failed, but continuing with local logout:', error.message);
    return { success: true, message: 'Logged out locally (API unavailable)' };
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};