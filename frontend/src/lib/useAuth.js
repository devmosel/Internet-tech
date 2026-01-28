'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from cookies
    const userData = auth.getUser();
    const authenticated = auth.isAuthenticated();
    
    setUser(userData);
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const login = (token, userData) => {
    auth.login(token, userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken: auth.getToken
  };
}
