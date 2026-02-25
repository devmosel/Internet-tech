/**
 * useBookingSearch hook
 * Manages space search functionality with date and time parameters using React Query
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSpacesWebSocket } from '@/contexts/SpacesWebSocketContext';
import { searchSpaces as fetchSpaces } from '@/services/spaceService';
import { transformSpaceData } from '@/utils/space';

export const useBookingSearch = () => {
  const [searchParams, setSearchParams] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { isConnected, subscribe } = useSpacesWebSocket();
  const queryClient = useQueryClient();

  /**
   * React Query for fetching spaces
   */
  const { data: spaces = [], isLoading, error, refetch } = useQuery({
    queryKey: ['spaces', searchParams?.date, searchParams?.startTime, searchParams?.endTime],
    queryFn: async () => {
      if (!searchParams) return [];
      
      const result = await fetchSpaces(
        searchParams.date, 
        searchParams.startTime, 
        searchParams.endTime
      );
      const apiData = result.data || [];
      
      // Transform API data to UI format
      const transformed = apiData.map(transformSpaceData);
      return transformed;
    },
    enabled: !!searchParams,
    staleTime: 0,
    retry: 1,
  });

  /**
   * Subscribe to WebSocket availability changes and auto-refetch
   */
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    if (!subscribe) {
      return;
    }

    // Subscribe to availability changes from bookings
    const unsubscribe1 = subscribe('availability_changed', (data) => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    });

    // Subscribe to space status updates from admin (maintenance, etc.)
    const unsubscribe2 = subscribe('space_updated', (space) => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [isConnected, subscribe, queryClient]);

  /**
   * Trigger search with new parameters
   */
  const searchSpaces = async (date, startTime, endTime) => {
    setSearchParams({ date, startTime, endTime });
    setHasSearched(true);
  };

  /**
   * Reset search state
   */
  const resetSearch = () => {
    setSearchParams(null);
    setHasSearched(false);
  };

  return {
    spaces,
    loading: isLoading,
    error: error?.message || null,
    hasSearched,
    searchSpaces,
    resetSearch,
    refetch,
  };
};
