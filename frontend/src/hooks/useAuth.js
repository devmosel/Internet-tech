/**
 * useAuth hooks
 * React Query hooks for authentication operations
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, logout, register } from '@/services/authService';
import { auth } from '@/lib/auth';
import { useWebSocket } from '@/contexts/WebSocketContext';

/**
 * Login mutation
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: () => {
      // Invalidate all queries and refetch user data
      queryClient.invalidateQueries();
      router.push('/dashboard');
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { disconnect } = useWebSocket();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Disconnect WebSocket
      console.log('🔌 Disconnecting WebSocket on logout');
      disconnect();
      
      // Clear auth and all cached data
      auth.logout();
      queryClient.clear();
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      
      // Disconnect WebSocket even on error
      console.log('🔌 Disconnecting WebSocket on logout (error path)');
      disconnect();
      
      // Even if API fails, clear local auth as fallback
      auth.logout();
      queryClient.clear();
      router.push('/login');
    },
  });
};

/**
 * Register mutation
 */
export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name }) => register(email, password, name),
    onSuccess: () => {
      // Invalidate all queries and redirect
      queryClient.invalidateQueries();
      router.push('/dashboard');
    },
  });
};
