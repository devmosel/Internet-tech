/**
 * useCurrentUser hook
 * Manages current user state from authentication using React Query
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { auth } from '@/lib/auth';

export const useCurrentUser = () => {
  const { data: currentUser = null, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => {
      const user = auth.getUser();
      console.log('Current user loaded:', user);
      return user;
    },
    staleTime: 5 * 60 * 1000, // User data is fresh for 5 minutes
    retry: false, // Don't retry if user is not found
  });

  return {
    currentUser,
    isLoading,
  };
};
