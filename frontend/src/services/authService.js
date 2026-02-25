// Auth service - login, logout, registration

import { API_CONFIG, API_ENDPOINTS } from './config';

// User login
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
    throw error;
  }
};

// Logout user
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
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
      method: 'POST',
      headers: headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: true, message: 'Logged out locally' };
    }

    return await response.json();
  } catch (error) {
    return { success: true, message: 'Logged out locally (API unavailable)' };
  } finally {
    // Always clear local auth state
    const { auth } = await import('@/lib/auth');
    auth.logout();
  }
};

// User registration
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
    throw error;
  }
};