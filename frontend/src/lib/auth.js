import Cookies from 'js-cookie';

// Cookie configuration - simplified for debugging
const COOKIE_OPTIONS = {
  expires: 7,
  path: '/',
  sameSite: 'lax'
};

// Auth helper functions with localStorage fallback
export const auth = {
  // Set authentication token
  setToken: (token) => {
    console.log('Setting token:', token);
    try {
      // Try cookies first
      Cookies.set('token', token, COOKIE_OPTIONS);
      // Also use localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      console.log('Token set in cookie:', Cookies.get('token'));
      console.log('Token set in localStorage:', typeof window !== 'undefined' ? localStorage.getItem('token') : 'N/A');
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  // Get authentication token
  getToken: () => {
    // Try cookie first, then localStorage
    let token = Cookies.get('token');
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
      // If found in localStorage, restore to cookie
      if (token) {
        Cookies.set('token', token, COOKIE_OPTIONS);
      }
    }
    return token;
  },

  // Remove authentication token
  removeToken: () => {
    Cookies.remove('token', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  // Set user data
  setUser: (user) => {
    try {
      const userStr = JSON.stringify(user);
      Cookies.set('user', userStr, COOKIE_OPTIONS);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', userStr);
      }
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  // Get user data
  getUser: () => {
    try {
      let userStr = Cookies.get('user');
      if (!userStr && typeof window !== 'undefined') {
        userStr = localStorage.getItem('user');
        if (userStr) {
          Cookies.set('user', userStr, COOKIE_OPTIONS);
        }
      }
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Remove user data
  removeUser: () => {
    Cookies.remove('user', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = auth.getToken();
    console.log('Checking authentication, token:', token);
    return !!token;
  },

  // Logout (remove all auth data)
  logout: () => {
    auth.removeToken();
    auth.removeUser();
  },

  // Login (store token and user)
  login: (token, user) => {
    console.log('Auth.login called with:', { token, user });
    if (token) {
      auth.setToken(token);
      console.log('Token saved, can retrieve:', auth.getToken());
    } else {
      console.error('No token provided to auth.login!');
    }
    if (user) {
      auth.setUser(user);
      console.log('User saved');
    }
  }
};

// API helper to make authenticated requests
export const fetchWithAuth = async (url, options = {}) => {
  const token = auth.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // If unauthorized, logout and redirect
  if (response.status === 401) {
    auth.logout();
    window.location.href = '/login';
  }

  return response;
};
