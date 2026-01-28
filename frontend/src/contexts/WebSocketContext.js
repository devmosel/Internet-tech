/**
 * WebSocket Context
 * Manages Socket.IO connection and real-time updates
 */

'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { auth } from '@/lib/auth';
import { API_CONFIG } from '@/services/config';

const WebSocketContext = createContext(null);

// Socket.IO configuration
const SOCKET_CONFIG = {
  url: `${API_CONFIG.BASE_URL}/announcements`,
  options: {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  },
};

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  // Notification sound function
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator (tone generator)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure pleasant notification sound (like a bell)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher pitch
      
      // Volume envelope (fade in and out)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('🔔 Notification sound played');
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, []);

  // Connect to Socket.IO
  const connect = useCallback(() => {
    const token = auth.getToken();
    if (!token) {
      console.warn('⚠️ Socket.IO: No auth token available, skipping connection');
      return;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      console.log('🔌 Socket.IO: Connecting...');
      
      // Create Socket.IO connection
      const socket = io(SOCKET_CONFIG.url, SOCKET_CONFIG.options);
      socketRef.current = socket;

      // Connection opened
      socket.on('connect', () => {
        console.log('✅ Socket.IO: Connected successfully');
        setIsConnected(true);
        
        // Authenticate after connection
        socket.emit('authenticate', { token });
      });

      // Handle authentication response
      socket.on('authenticated', () => {
        console.log('🔐 Socket.IO: Authenticated successfully');
        console.log('📊 Current announcements state:', announcements.length);
      });

      socket.on('auth_error', (error) => {
        console.error('❌ Socket.IO: Authentication failed:', error);
      });

      // Handle announcements - using actual backend event names
      socket.on('created', (data) => {
        console.log('📢 Socket.IO: New announcement created!');
        console.log('📢 Raw data received:', data);
        
        // Play notification sound
        playNotificationSound();
        
        // Backend sends array with one item, extract it
        const announcement = Array.isArray(data) ? data[0] : data;
        
        console.log('📢 Parsed announcement:', announcement);
        setAnnouncements((prev) => {
          const updated = [announcement, ...prev];
          console.log('📢 Updated announcements array length:', updated.length);
          console.log('📢 New array reference created:', updated !== prev);
          return updated;
        });
        notifyListeners('announcement_new', announcement);
      });

      socket.on('updated', (data) => {
        console.log('✏️ Socket.IO: Announcement updated!');
        console.log('✏️ Raw data received:', data);
        
        // Play notification sound
        playNotificationSound();
        
        // Backend sends array with one item, extract it
        const announcement = Array.isArray(data) ? data[0] : data;
        
        console.log('✏️ Parsed announcement:', announcement);
        setAnnouncements((prev) => {
          const updated = prev.map((a) => (a.id === announcement.id ? announcement : a));
          console.log('✏️ Updated announcements array length:', updated.length);
          console.log('✏️ New array reference created:', updated !== prev);
          return updated;
        });
        notifyListeners('announcement_update', announcement);
      });

      socket.on('deleted', (data) => {
        console.log('🗑️ Socket.IO: Announcement deleted!');
        console.log('🗑️ Raw data received:', data);
        
        // Play notification sound
        playNotificationSound();
        
        // Backend might send the full object or just ID
        const announcement = Array.isArray(data) ? data[0] : data;
        const deleteId = announcement.id || announcement;
        
        console.log('🗑️ Deleting announcement with ID:', deleteId);
        setAnnouncements((prev) => {
          const updated = prev.filter((a) => a.id !== deleteId);
          console.log('🗑️ Updated announcements array length:', updated.length);
          console.log('🗑️ New array reference created:', updated !== prev);
          return updated;
        });
        notifyListeners('announcement_delete', announcement);
      });

      socket.on('announcement_new', (data) => {
        console.log('📢 Socket.IO: announcement_new event triggered');
        console.log('📢 Raw data received:', data);
        
        // Handle if data is wrapped in an object
        const announcement = data.data || data;
        
        console.log('📢 Parsed announcement:', announcement);
        setAnnouncements((prev) => {
          const updated = [announcement, ...prev];
          console.log('📢 Updated announcements array length:', updated.length);
          return updated;
        });
        notifyListeners('announcement_new', announcement);
      });

      socket.on('announcement_update', (data) => {
        console.log('✏️ Socket.IO: announcement_update event triggered');
        console.log('✏️ Raw data received:', data);
        
        // Handle if data is wrapped in an object
        const announcement = data.data || data;
        
        setAnnouncements((prev) => {
          const updated = prev.map((a) => (a.id === announcement.id ? announcement : a));
          console.log('✏️ Updated announcements array length:', updated.length);
          return updated;
        });
        notifyListeners('announcement_update', announcement);
      });

      socket.on('announcement_delete', (data) => {
        console.log('🗑️ Socket.IO: announcement_delete event triggered');
        console.log('🗑️ Raw data received:', data);
        
        // Handle if data is wrapped in an object
        const deleteData = data.data || data;
        const deleteId = deleteData.id || deleteData;
        
        setAnnouncements((prev) => {
          const updated = prev.filter((a) => a.id !== deleteId);
          console.log('🗑️ Updated announcements array length:', updated.length);
          return updated;
        });
        notifyListeners('announcement_delete', deleteData);
      });

      socket.on('announcements_initial', (data) => {
        console.log('📋 Socket.IO: Initial announcements event triggered');
        console.log('📋 Raw data received:', data);
        console.log('📋 Data type:', typeof data);
        
        // Handle different possible formats from backend
        let announcementsArray = [];
        
        if (Array.isArray(data)) {
          announcementsArray = data;
        } else if (data && Array.isArray(data.data)) {
          announcementsArray = data.data;
        } else if (data && Array.isArray(data.announcements)) {
          announcementsArray = data.announcements;
        }
        
        console.log('📋 Parsed announcements array:', announcementsArray.length);
        setAnnouncements(announcementsArray);
      });

      // Connection error
      socket.on('connect_error', (error) => {
        console.warn('⚠️ Socket.IO: Connection failed (falling back to REST API)');
        if (process.env.NODE_ENV === 'development') {
          console.log('💡 Error:', error.message);
        }
      });

      // Disconnection
      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO: Disconnected (' + reason + ')');
        setIsConnected(false);
      });

      // Reconnection attempts
      socket.on('reconnect_attempt', (attemptNumber) => {
        if (attemptNumber === 1) {
          console.log('🔄 Socket.IO: Attempting to reconnect...');
        }
      });

      socket.on('reconnect_failed', () => {
        console.log('ℹ️ Socket.IO: Unable to connect. Using REST API for updates.');
        console.log('💡 Start backend Socket.IO server for real-time features.');
      });

      // Connect the socket
      socket.connect();

      // Catch-all listener to see ALL events from backend
      socket.onAny((eventName, ...args) => {
        console.log('🎯 Socket.IO: Event received:', eventName);
        console.log('🎯 Event data:', args);
      });

    } catch (error) {
      console.warn('⚠️ Socket.IO: Failed to create connection');
      if (process.env.NODE_ENV === 'development') {
        console.log('Error details:', error.message);
      }
    }
  }, []);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // Send message through Socket.IO
  const send = useCallback((eventName, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(eventName, data);
      return true;
    }
    console.warn('Socket.IO is not connected');
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
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in Socket.IO listener:', error);
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
    announcements,
    send,
    subscribe,
    reconnect: connect,
    disconnect,
  }), [isConnected, announcements, send, subscribe, connect, disconnect]);

  console.log('🔄 WebSocketContext: Value updated', { 
    isConnected, 
    announcementsLength: announcements.length 
  });

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export { WebSocketContext };
