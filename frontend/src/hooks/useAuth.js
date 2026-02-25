// Auth hooks for React Query

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, logout, register } from '@/services/authService';
import { auth } from '@/lib/auth';
import { useWebSocket } from '@/contexts/WebSocketContext';

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.push('/dashboard');
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { disconnect } = useWebSocket();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      disconnect();
      
      auth.logout();
      queryClient.clear();
      router.push('/login');
    },
    onError: (error) => {
      disconnect();
      
      auth.logout();
      queryClient.clear();
      router.push('/login');
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name }) => register(email, password, name),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.push('/dashboard');
    },
  });
};
