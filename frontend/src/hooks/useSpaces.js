/**
 * useSpaces hooks
 * Combines REST API fallback with WebSocket real-time updates for spaces
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSpacesWebSocket } from '@/contexts/SpacesWebSocketContext';
import {
  searchSpaces,
  getAllSpaces,
  getSpaceById,
} from '@/services/spaceService';

/**
 * Fetch space by ID
 */
export const useSpace = (spaceId) => {
  return useQuery({
    queryKey: ['spaces', spaceId],
    queryFn: () => getSpaceById(spaceId),
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch all spaces with real-time WebSocket updates
 * Falls back to REST API if WebSocket is not connected
 */
export const useAllSpaces = () => {
  const { isConnected, spaces: wsSpaces, subscribe } = useSpacesWebSocket();
  const [spaces, setSpaces] = useState([]);
  const [source, setSource] = useState('loading');

  // REST API fallback
  const restQuery = useQuery({
    queryKey: ['spaces', 'all'],
    queryFn: getAllSpaces,
    enabled: !isConnected, // Only use REST API if WebSocket is not connected
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // When WebSocket is connected, ALWAYS use WebSocket data
  useEffect(() => {
    if (isConnected && wsSpaces && wsSpaces.length > 0) {
      console.log('📋 Setting LIVE WebSocket spaces:', wsSpaces.length);
      setSpaces(wsSpaces);
      setSource('websocket');
    } else if (!isConnected && restQuery.data) {
      console.log('📋 Using REST API spaces:', restQuery.data.length);
      setSpaces(restQuery.data);
      setSource('rest');
    }
  }, [isConnected, wsSpaces, restQuery.data]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribers = [
      subscribe('space_created', (space) => {
        console.log('🆕 Space created event received in hook:', space);
      }),
      subscribe('space_updated', (space) => {
        console.log('🔧 Space updated event received in hook:', space);
      }),
      subscribe('space_deleted', (data) => {
        console.log('🗑️ Space deleted event received in hook:', data);
      }),
      subscribe('availability_changed', (data) => {
        console.log('📅 Availability changed event received in hook:', data);
        // You may want to refetch spaces here
      }),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isConnected, subscribe]);

  return {
    data: spaces,
    isLoading: source === 'loading' || restQuery.isLoading,
    error: restQuery.error,
    source, // 'websocket', 'rest', or 'loading'
    isConnected,
  };
};

/**
 * Search spaces with filters and real-time updates
 * @param {Object} filters - { date, start_time, end_time, type, floor_id }
 */
export const useSearchSpaces = (filters = {}) => {
  const { isConnected, spaces: wsSpaces, fetchSpaces, subscribe } = useSpacesWebSocket();
  const [spaces, setSpaces] = useState([]);
  const [source, setSource] = useState('loading');

  // REST API fallback
  const restQuery = useQuery({
    queryKey: ['spaces', 'search', filters],
    queryFn: () => searchSpaces(filters),
    enabled: !isConnected,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for search results)
  });

  // Fetch spaces via WebSocket when connected
  useEffect(() => {
    if (isConnected && fetchSpaces) {
      console.log('📡 Fetching spaces via WebSocket with filters:', filters);
      fetchSpaces(filters);
    }
  }, [isConnected, fetchSpaces, JSON.stringify(filters)]);

  // Handle WebSocket vs REST data
  useEffect(() => {
    if (isConnected && wsSpaces) {
      console.log('📋 Setting LIVE WebSocket search results:', wsSpaces.length);
      setSpaces(wsSpaces);
      setSource('websocket');
    } else if (!isConnected && restQuery.data) {
      console.log('📋 Using REST API search results:', restQuery.data.length);
      setSpaces(restQuery.data);
      setSource('rest');
    }
  }, [isConnected, wsSpaces, restQuery.data]);

  // Subscribe to real-time availability changes
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('availability_changed', (data) => {
      console.log('📅 Availability changed - refetching spaces:', data);
      // Automatically refetch with current filters
      if (fetchSpaces) {
        fetchSpaces(filters);
      }
    });

    return () => unsubscribe();
  }, [isConnected, subscribe, fetchSpaces, JSON.stringify(filters)]);

  return {
    data: spaces,
    isLoading: source === 'loading' || restQuery.isLoading,
    error: restQuery.error,
    source,
    isConnected,
    refetch: () => {
      if (isConnected && fetchSpaces) {
        fetchSpaces(filters);
      } else {
        restQuery.refetch();
      }
    },
  };
};

