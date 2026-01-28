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

  console.log('🔧 SpacesWebSocketProvider: Initialized with queryClient');

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
      
      console.log('🔔 Space notification sound played');
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, []);

  // Connect to Socket.IO spaces namespace
  const connect = useCallback(() => {
    const token = auth.getToken();
    if (!token) {
      console.warn('⚠️ Spaces Socket.IO: No auth token available, skipping connection');
      return;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log('🔍 Connect callback - queryClient available?', !!queryClient);

    try {
      console.log('🔌 Spaces Socket.IO: Connecting to', SPACES_SOCKET_CONFIG.url);
      
      // Create Socket.IO connection
      const socket = io(SPACES_SOCKET_CONFIG.url, SPACES_SOCKET_CONFIG.options);
      socketRef.current = socket;

      // Connection opened
      socket.on('connect', () => {
        console.log('✅ Spaces Socket.IO: Connected successfully');
        setIsConnected(true);
        
        // Authenticate after connection
        console.log('🔐 Spaces Socket.IO: Authenticating...');
        socket.emit('authenticate', { token });
      });

      // Handle authentication response
      socket.on('authenticated', (data) => {
        console.log('✅ Spaces Socket.IO: Authenticated successfully', data);
      });

      socket.on('auth_error', (error) => {
        console.error('❌ Spaces Socket.IO: Authentication failed:', error);
      });

      // ========== INITIAL DATA LOAD ==========
      socket.on('spaces_data', (data) => {
        console.log(`📦 Received ${data.count || data.spaces?.length || 0} spaces`);
        console.log('📦 Filters applied:', data.filters);
        
        const spacesArray = data.spaces || data;
        setSpaces(spacesArray);
        setFilters(data.filters || {});
        notifyListeners('spaces_loaded', data);
      });

      // ========== REAL-TIME EVENTS ==========
      
      // When admin changes space status (available ↔ maintenance)
      socket.on('updated', (space) => {
        console.log('🔧 Space status updated:', space);
        playNotificationSound();
        
        setSpaces((prev) => 
          prev.map((s) => s.id === space.id ? space : s)
        );
        notifyListeners('space_updated', space);
      });

      // ⭐ When someone books/cancels - availability changed
      socket.on('availability_changed', (data) => {
        console.log('📅 Availability changed!');
        console.log(`  Space ID: ${data.space_id}`);
        console.log(`  Date: ${data.date}`);
        console.log(`  Time: ${data.affected_time_range?.start} - ${data.affected_time_range?.end}`);
        console.log(`  Message: ${data.message}`);
        console.log('🔍 Step 1: Event handler started');
        
        // CRITICAL: Invalidate React Query cache FIRST
        console.log('🔍 Step 2: About to invalidate cache');
        console.log('🔍 Step 3: queryClient =', queryClient);
        
        if (queryClient && queryClient.invalidateQueries) {
          console.log('🔄 Invalidating spaces query cache...');
          queryClient.invalidateQueries({ queryKey: ['spaces'] });
          console.log('✅ Query invalidated successfully');
        } else {
          console.error('❌ queryClient or invalidateQueries not available');
        }
        
        console.log('🔍 Step 4: Playing sound');
        playNotificationSound();
        console.log('🔍 Step 5: Sound completed');
        
        console.log('🔍 Step 6: Notifying listeners');
        notifyListeners('availability_changed', data);
        console.log('🔍 Step 7: Handler completed');
      });

      // When admin creates new space
      socket.on('created', (space) => {
        console.log('🆕 New space created:', space);
        playNotificationSound();
        
        setSpaces((prev) => [...prev, space]);
        notifyListeners('space_created', space);
      });

      // When admin deletes space
      socket.on('deleted', (data) => {
        console.log('🗑️ Space deleted:', data.id);
        playNotificationSound();
        
        const deleteId = data.id || data;
        setSpaces((prev) => prev.filter((s) => s.id !== deleteId));
        notifyListeners('space_deleted', data);
      });

      // Error handling
      socket.on('error', (data) => {
        console.error('❌ Spaces Socket.IO Error:', data.message);
        notifyListeners('error', data);
      });

      // Connection error
      socket.on('connect_error', (error) => {
        console.warn('⚠️ Spaces Socket.IO: Connection failed');
        if (process.env.NODE_ENV === 'development') {
          console.log('💡 Error:', error.message);
        }
      });

      // Disconnection
      socket.on('disconnect', (reason) => {
        console.log('🔌 Spaces Socket.IO: Disconnected (' + reason + ')');
        setIsConnected(false);
      });

      // Reconnection attempts
      socket.on('reconnect_attempt', (attemptNumber) => {
        if (attemptNumber === 1) {
          console.log('🔄 Spaces Socket.IO: Attempting to reconnect...');
        }
      });

      socket.on('reconnect_failed', () => {
        console.log('ℹ️ Spaces Socket.IO: Unable to connect. Using REST API for updates.');
      });

      // Connect the socket
      socket.connect();

      // Catch-all listener for debugging
      if (process.env.NODE_ENV === 'development') {
        socket.onAny((eventName, ...args) => {
          console.log('🎯 Spaces Socket.IO Event:', eventName, args);
        });
      }

    } catch (error) {
      console.warn('⚠️ Spaces Socket.IO: Failed to create connection');
      if (process.env.NODE_ENV === 'development') {
        console.log('Error details:', error.message);
      }
    }
  }, [playNotificationSound, queryClient]);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Spaces Socket.IO: Disconnecting...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Fetch spaces with filters
  const fetchSpaces = useCallback((filterOptions = {}) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('📡 Fetching spaces with filters:', filterOptions);
      socketRef.current.emit('get_spaces', filterOptions);
      setFilters(filterOptions);
      return true;
    }
    console.warn('Spaces Socket.IO is not connected');
    return false;
  }, []);

  // Subscribe to Socket.IO events
  const subscribe = useCallback((eventType, callback) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Map());
    }
    
    listenersRef.current.get(eventType).set(id, callback);
    console.log(`📡 Subscribed to '${eventType}' with ID ${id}. Total listeners: ${listenersRef.current.get(eventType).size}`);

    // Return unsubscribe function
    return () => {
      const listeners = listenersRef.current.get(eventType);
      if (listeners) {
        listeners.delete(id);
        console.log(`🔌 Unsubscribed from '${eventType}' ID ${id}`);
      }
    };
  }, []);

  // Notify all listeners of an event
  const notifyListeners = (eventType, data) => {
    const listeners = listenersRef.current.get(eventType);
    console.log(`📢 Notifying listeners for '${eventType}'. Listener count: ${listeners ? listeners.size : 0}`);
    if (listeners) {
      listeners.forEach((callback, id) => {
        try {
          console.log(`  ➡️ Calling listener ${id} for '${eventType}'`);
          callback(data);
        } catch (error) {
          console.error('Error in Spaces Socket.IO listener:', error);
        }
      });
    } else {
      console.warn(`⚠️ No listeners registered for '${eventType}'`);
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

  console.log('🔄 SpacesWebSocketContext: Value updated', { 
    isConnected, 
    spacesCount: spaces.length,
    filters 
  });

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
