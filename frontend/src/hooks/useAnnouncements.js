/**
 * WebSocket Hook for Announcements
 * Combines REST API fallback with WebSocket real-time updates
 */

'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useToast } from '@/contexts/ToastContext';

/**
 * Hook to get announcements with real-time WebSocket updates
 * Falls back to REST API if WebSocket is not connected
 */
export function useAnnouncements(fallbackData = []) {
  const { isConnected, announcements: wsAnnouncements, subscribe } = useWebSocket();
  const { showToastMessage } = useToast();
  const [announcements, setAnnouncements] = useState(fallbackData);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);

  // When WebSocket is connected, ALWAYS use WebSocket data
  // Only use fallback when NOT connected
  useEffect(() => {
    console.log('🔄 useAnnouncements: Effect triggered');
    console.log('🔄 isConnected:', isConnected);
    console.log('🔄 wsAnnouncements length:', wsAnnouncements?.length);
    console.log('🔄 wsAnnouncements:', wsAnnouncements);
    
    if (isConnected && wsAnnouncements) {
      console.log('📋 Setting LIVE WebSocket announcements:', wsAnnouncements.length);
      setAnnouncements([...wsAnnouncements]); // Create new array reference
    } else if (!isConnected && fallbackData && fallbackData.length > 0) {
      console.log('📋 Setting fallback REST API announcements:', fallbackData.length);
      setAnnouncements(fallbackData);
    }
  }, [isConnected, wsAnnouncements, fallbackData]);

  // Subscribe to new announcement events
  useEffect(() => {
    const unsubscribe = subscribe('announcement_new', (newAnnouncement) => {
      setHasNewAnnouncement(true);
      
      // Show toast notification for new announcement
      showToastMessage({
        type: 'info',
        title: '📢 New Announcement',
        message: newAnnouncement.title,
        duration: 5000,
      });

      // Auto-dismiss the "new" indicator after 3 seconds
      setTimeout(() => {
        setHasNewAnnouncement(false);
      }, 3000);
    });

    return unsubscribe;
  }, [subscribe, showToastMessage]);

  return {
    announcements,
    isConnected,
    hasNewAnnouncement,
  };
}
