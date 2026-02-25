// WebSocket context - real-time updates

'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { auth } from '@/lib/auth';
import { API_CONFIG } from '@/services/config';

const WebSocketContext = createContext(null);

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

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
    }
  }, []);

  // Connect to Socket.IO
  const connect = useCallback(() => {
    const token = auth.getToken();
    if (!token) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      const socket = io(SOCKET_CONFIG.url, SOCKET_CONFIG.options);
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        
        socket.emit('authenticate', { token });
      });

      socket.on('authenticated', () => {
      });

      socket.on('auth_error', (error) => {
      });

      // New announcement created
      socket.on('created', (data) => {
        playNotificationSound();
        
        const announcement = Array.isArray(data) ? data[0] : data;
        
        setAnnouncements((prev) => {
          const updated = [announcement, ...prev];
          return updated;
        });
        notifyListeners('announcement_new', announcement);
      });

      socket.on('updated', (data) => {
        playNotificationSound();
        
        const announcement = Array.isArray(data) ? data[0] : data;
        
        setAnnouncements((prev) => {
          const updated = prev.map((a) => (a.id === announcement.id ? announcement : a));
          return updated;
        });
        notifyListeners('announcement_update', announcement);
      });

      socket.on('deleted', (data) => {
        playNotificationSound();
        
        // Backend might send the full object or just ID
        const announcement = Array.isArray(data) ? data[0] : data;
        const deleteId = announcement.id || announcement;
        
        setAnnouncements((prev) => {
          const updated = prev.filter((a) => a.id !== deleteId);
          return updated;
        });
        notifyListeners('announcement_delete', announcement);
      });

      socket.on('announcement_new', (data) => {
        // Handle if data is wrapped in an object
        const announcement = data.data || data;
        
        setAnnouncements((prev) => {
          const updated = [announcement, ...prev];
          return updated;
        });
        notifyListeners('announcement_new', announcement);
      });

      socket.on('announcement_update', (data) => {
        // Handle if data is wrapped in an object
        const announcement = data.data || data;
        
        setAnnouncements((prev) => {
          const updated = prev.map((a) => (a.id === announcement.id ? announcement : a));
          return updated;
        });
        notifyListeners('announcement_update', announcement);
      });

      socket.on('announcement_delete', (data) => {
        // Handle if data is wrapped in an object
        const deleteData = data.data || data;
        const deleteId = deleteData.id || deleteData;
        
        setAnnouncements((prev) => {
          const updated = prev.filter((a) => a.id !== deleteId);
          return updated;
        });
        notifyListeners('announcement_delete', deleteData);
      });

      socket.on('announcements_initial', (data) => {
        // Handle different possible formats from backend
        let announcementsArray = [];
        
        if (Array.isArray(data)) {
          announcementsArray = data;
        } else if (data && Array.isArray(data.data)) {
          announcementsArray = data.data;
        } else if (data && Array.isArray(data.announcements)) {
          announcementsArray = data.announcements;
        }
        
        setAnnouncements(announcementsArray);
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

      // Catch-all listener to see ALL events from backend
      socket.onAny((eventName, ...args) => {
      });

    } catch (error) {
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
