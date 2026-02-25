// Spaces hooks with WebSocket updates

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSpacesWebSocket } from '@/contexts/SpacesWebSocketContext';
import {
  searchSpaces,
  getAllSpaces,
  getSpaceById,
} from '@/services/spaceService';

// Get space by ID
export const useSpace = (spaceId) => {
  return useQuery({
    queryKey: ['spaces', spaceId],
    queryFn: () => getSpaceById(spaceId),
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get all spaces with WebSocket updates
export const useAllSpaces = () => {
  const { isConnected, spaces: wsSpaces, subscribe } = useSpacesWebSocket();
  const [spaces, setSpaces] = useState([]);
  const [source, setSource] = useState('loading');

  // REST API fallback
  const restQuery = useQuery({
    queryKey: ['spaces', 'all'],
    queryFn: getAllSpaces,
    enabled: !isConnected,
    staleTime: 5 * 60 * 1000,
  });

  // Use WebSocket data when connected
  useEffect(() => {
    if (isConnected && wsSpaces && wsSpaces.length > 0) {
      setSpaces(wsSpaces);
      setSource('websocket');
    } else if (!isConnected && restQuery.data) {
      setSpaces(restQuery.data);
      setSource('rest');
    }
  }, [isConnected, wsSpaces, restQuery.data]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribers = [
      subscribe('space_created', (space) => {
      }),
      subscribe('space_updated', (space) => {
      }),
      subscribe('space_deleted', (data) => {
      }),
      subscribe('availability_changed', (data) => {
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
    source,
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
      fetchSpaces(filters);
    }
  }, [isConnected, fetchSpaces, JSON.stringify(filters)]);

  // Handle WebSocket vs REST data
  useEffect(() => {
    if (isConnected && wsSpaces) {
      setSpaces(wsSpaces);
      setSource('websocket');
    } else if (!isConnected && restQuery.data) {
      setSpaces(restQuery.data);
      setSource('rest');
    }
  }, [isConnected, wsSpaces, restQuery.data]);

  // Subscribe to real-time availability changes
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('availability_changed', (data) => {
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

