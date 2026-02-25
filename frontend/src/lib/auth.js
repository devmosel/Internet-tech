import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  expires: 7,
  path: '/',
  sameSite: 'lax'
};

// Auth helpers with cookie and localStorage
export const auth = {
  setToken: (token) => {
    try {
      Cookies.set('token', token, COOKIE_OPTIONS);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    } catch (error) {
    }
  },

  getToken: () => {
    let token = Cookies.get('token');
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
      if (token) {
        Cookies.set('token', token, COOKIE_OPTIONS);
      }
    }
    return token;
  },

  removeToken: () => {
    Cookies.remove('token', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  setUser: (user) => {
    try {
      const userStr = JSON.stringify(user);
      Cookies.set('user', userStr, COOKIE_OPTIONS);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', userStr);
      }
    } catch (error) {

    }
  },

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
      return null;
    }
  },

  removeUser: () => {
    Cookies.remove('user', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  isAuthenticated: () => {
    const token = auth.getToken();
    return !!token;
  },

  logout: () => {
    auth.removeToken();
    auth.removeUser();
  },

  login: (token, user) => {
    if (token) {
      auth.setToken(token);
    } else {
    }
    if (user) {
      auth.setUser(user);
    }
  }
};

// Make authenticated requests
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

  // Redirect to login if unauthorized
  if (response.status === 401) {
    auth.logout();
    window.location.href = '/login';
  }

  return response;
};
