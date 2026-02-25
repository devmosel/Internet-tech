/**
 * Spaces WebSocket Context
 * Manages Socket.IO connection for real-time space availability updates
 * Based on REALTIME_AVAILABILITY_GUIDE.py
 */

'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '@/lib/auth';
import { API_CONFIG } from '@/services/config';

const SpacesWebSocketContext = createContext(null);

// Socket.IO configuration for spaces namespace
const SPACES_SOCKET_CONFIG = {
  url: `${API_CONFIG.BASE_URL}/spaces`,
  options: {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  },
};

export function SpacesWebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [spaces, setSpaces] = useState([]);
  const [filters, setFilters] = useState({});
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());
  const queryClient = useQueryClient();

  // Notification sound function
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      
    } catch (error) {
    }
  }, []);

  // Connect to Socket.IO spaces namespace
  const connect = useCallback(() => {
    const token = auth.getToken();
    if (!token) {
      return;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      
      // Create Socket.IO connection
      const socket = io(SPACES_SOCKET_CONFIG.url, SPACES_SOCKET_CONFIG.options);
      socketRef.current = socket;

      // Connection opened
      socket.on('connect', () => {
        setIsConnected(true);
        
        // Authenticate after connection
        socket.emit('authenticate', { token });
      });

      // Handle authentication response
      socket.on('authenticated', (data) => {
      });

      socket.on('auth_error', (error) => {
      });

      // ========== INITIAL DATA LOAD ==========
      socket.on('spaces_data', (data) => {
        const spacesArray = data.spaces || data;
        setSpaces(spacesArray);
        setFilters(data.filters || {});
        notifyListeners('spaces_loaded', data);
      });

      // ========== REAL-TIME EVENTS ==========
      
      // When admin changes space status (available ↔ maintenance)
      socket.on('updated', (space) => {
        playNotificationSound();
        
        setSpaces((prev) => 
          prev.map((s) => s.id === space.id ? space : s)
        );
        notifyListeners('space_updated', space);
      });

      // ⭐ When someone books/cancels - availability changed
      socket.on('availability_changed', (data) => {
        // CRITICAL: Invalidate React Query cache FIRST
        if (queryClient && queryClient.invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: ['spaces'] });
        }
        
        playNotificationSound();
        
        notifyListeners('availability_changed', data);
      });

      // When admin creates new space
      socket.on('created', (space) => {
        playNotificationSound();
        
        setSpaces((prev) => [...prev, space]);
        notifyListeners('space_created', space);
      });

      // When admin deletes space
      socket.on('deleted', (data) => {
        playNotificationSound();
        
        const deleteId = data.id || data;
        setSpaces((prev) => prev.filter((s) => s.id !== deleteId));
        notifyListeners('space_deleted', data);
      });

      // Error handling
      socket.on('error', (data) => {
        notifyListeners('error', data);
      });

      // Connection error
      socket.on('connect_error', (error) => {
      });

      // Disconnection
      socket.on('disconnect', (reason) => {
        setIsConnected(false);
      });

      // Reconnection attempts
      socket.on('reconnect_attempt', (attemptNumber) => {
      });

      socket.on('reconnect_failed', () => {
      });

      // Connect the socket
      socket.connect();

      // Catch-all listener for debugging
      if (process.env.NODE_ENV === 'development') {
        socket.onAny((eventName, ...args) => {
        });
      }

    } catch (error) {
    }
  }, [playNotificationSound, queryClient]);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Fetch spaces with filters
  const fetchSpaces = useCallback((filterOptions = {}) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('get_spaces', filterOptions);
      setFilters(filterOptions);
      return true;
    }
    return false;
  }, []);

  // Subscribe to Socket.IO events
  const subscribe = useCallback((eventType, callback) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Map());
    }
    
    listenersRef.current.get(eventType).set(id, callback);

    // Return unsubscribe function
    return () => {
      const listeners = listenersRef.current.get(eventType);
      if (listeners) {
        listeners.delete(id);
      }
    };
  }, []);

  // Notify all listeners of an event
  const notifyListeners = (eventType, data) => {
    const listeners = listenersRef.current.get(eventType);
    if (listeners) {
      listeners.forEach((callback, id) => {
        try {
          callback(data);
        } catch (error) {
        }
      });
    }
  };

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value = useMemo(() => ({
    isConnected,
    spaces,
    filters,
    fetchSpaces,
    subscribe,
    reconnect: connect,
    disconnect,
  }), [isConnected, spaces, filters, fetchSpaces, subscribe, connect, disconnect]);

  return (
    <SpacesWebSocketContext.Provider value={value}>
      {children}
    </SpacesWebSocketContext.Provider>
  );
}

export function useSpacesWebSocket() {
  const context = useContext(SpacesWebSocketContext);
  if (!context) {
    throw new Error('useSpacesWebSocket must be used within a SpacesWebSocketProvider');
  }
  return context;
}

export { SpacesWebSocketContext };
