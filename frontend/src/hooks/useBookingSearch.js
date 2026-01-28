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

  console.log('🎯 useBookingSearch hook initialized. isConnected:', isConnected);

  /**
   * React Query for fetching spaces
   */
  const { data: spaces = [], isLoading, error, refetch } = useQuery({
    queryKey: ['spaces', searchParams?.date, searchParams?.startTime, searchParams?.endTime],
    queryFn: async () => {
      if (!searchParams) return [];
      
      console.log('🔍 useBookingSearch: Fetching spaces for', searchParams);
      const result = await fetchSpaces(
        searchParams.date, 
        searchParams.startTime, 
        searchParams.endTime
      );
      const apiData = result.data || [];
      
      console.log('✅ useBookingSearch: Received', apiData.length, 'spaces from API');
      if (apiData.length > 0) {
        console.log('📦 First space availability:', apiData[0].is_available, apiData[0].name);
      }
      
      // Transform API data to UI format
      const transformed = apiData.map(transformSpaceData);
      console.log('🔄 useBookingSearch: Transformed', transformed.length, 'spaces');
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
    console.log('🎯 useBookingSearch: Setting up subscription. isConnected:', isConnected);
    
    if (!isConnected) {
      console.log('⚠️ useBookingSearch: Not connected, skipping subscription');
      return;
    }

    if (!subscribe) {
      console.error('❌ useBookingSearch: subscribe function not available!');
      return;
    }

    // Subscribe to availability changes from bookings
    const unsubscribe1 = subscribe('availability_changed', (data) => {
      console.log('🔄 Booking search: Availability changed callback triggered!', data);
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      console.log('✅ Spaces query invalidated');
    });

    // Subscribe to space status updates from admin (maintenance, etc.)
    const unsubscribe2 = subscribe('space_updated', (space) => {
      console.log('🔄 Booking search: Space updated callback triggered!', space);
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      console.log('✅ Spaces query invalidated after admin update');
    });

    console.log('✅ useBookingSearch: Subscriptions set up successfully (availability_changed + space_updated)');

    return () => {
      console.log('🔄 useBookingSearch: Cleaning up subscriptions');
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
