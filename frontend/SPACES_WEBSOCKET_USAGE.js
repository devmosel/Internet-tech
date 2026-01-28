/**
 * SPACES WEBSOCKET USAGE EXAMPLE
 * 
 * This file demonstrates how to use the Spaces WebSocket in your components
 * to get real-time space availability updates.
 */

import { useSearchSpaces, useAllSpaces } from '@/hooks';
import { useSpacesWebSocket } from '@/contexts/SpacesWebSocketContext';
import { useState } from 'react';

// ========================================================================
// EXAMPLE 1: Simple Spaces List with Real-time Updates
// ========================================================================

function SpacesListExample() {
  const { data: spaces, isLoading, isConnected, source } = useAllSpaces();

  if (isLoading) return <div>Loading spaces...</div>;

  return (
    <div>
      <div className="status-indicator">
        {isConnected ? (
          <span className="badge-green">🟢 Live Updates Active</span>
        ) : (
          <span className="badge-yellow">⚪ Using REST API</span>
        )}
        <small>Source: {source}</small>
      </div>

      <div className="spaces-grid">
        {spaces.map((space) => (
          <div key={space.id} className="space-card">
            <h3>{space.name}</h3>
            <p>{space.type} | Capacity: {space.capacity}</p>
            <span className={`status ${space.status}`}>
              {space.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ========================================================================
// EXAMPLE 2: Search Spaces with Filters and Real-time Availability
// ========================================================================

function SpaceSearchExample() {
  const [filters, setFilters] = useState({
    date: '2026-01-27',
    start_time: '10:00',
    end_time: '15:00',
  });

  const { 
    data: spaces, 
    isLoading, 
    isConnected, 
    source,
    refetch 
  } = useSearchSpaces(filters);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <h1>Book a Space</h1>

      {/* Connection Status */}
      <div className="status-bar">
        {isConnected ? (
          <span>🟢 Real-time updates active</span>
        ) : (
          <span>⚪ REST API mode</span>
        )}
      </div>

      {/* Date & Time Filters */}
      <div className="filters">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => handleFilterChange('date', e.target.value)}
        />
        <input
          type="time"
          value={filters.start_time}
          onChange={(e) => handleFilterChange('start_time', e.target.value)}
        />
        <input
          type="time"
          value={filters.end_time}
          onChange={(e) => handleFilterChange('end_time', e.target.value)}
        />
        <button onClick={refetch}>Refresh</button>
      </div>

      {/* Space Results */}
      {isLoading ? (
        <div>Loading spaces...</div>
      ) : (
        <div className="space-grid">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
}


// ========================================================================
// EXAMPLE 3: Advanced - Direct WebSocket Event Subscription
// ========================================================================

function AdvancedSpacesExample() {
  const { isConnected, fetchSpaces, subscribe } = useSpacesWebSocket();
  const [notifications, setNotifications] = useState([]);

  // Subscribe to specific events
  useEffect(() => {
    if (!isConnected) return;

    // Listen for availability changes
    const unsubAvailability = subscribe('availability_changed', (data) => {
      console.log('📅 Availability changed!', data);
      
      // Show notification
      const notification = {
        id: Date.now(),
        message: `Space ${data.space_id} availability changed for ${data.date}`,
        time: data.affected_time_range,
      };
      setNotifications(prev => [notification, ...prev].slice(0, 5));
      
      // Automatically refetch spaces
      fetchSpaces({
        date: data.date,
        start_time: data.affected_time_range.start,
        end_time: data.affected_time_range.end,
      });
    });

    // Listen for space updates (status changes)
    const unsubUpdated = subscribe('space_updated', (space) => {
      console.log('🔧 Space updated:', space);
      setNotifications(prev => [
        {
          id: Date.now(),
          message: `${space.name} is now ${space.status}`,
        },
        ...prev
      ].slice(0, 5));
    });

    // Listen for new spaces
    const unsubCreated = subscribe('space_created', (space) => {
      console.log('🆕 New space created:', space);
      setNotifications(prev => [
        {
          id: Date.now(),
          message: `New space added: ${space.name}`,
        },
        ...prev
      ].slice(0, 5));
    });

    // Cleanup subscriptions
    return () => {
      unsubAvailability();
      unsubUpdated();
      unsubCreated();
    };
  }, [isConnected, subscribe, fetchSpaces]);

  return (
    <div>
      {/* Notifications Panel */}
      <div className="notifications">
        <h3>Real-time Updates</h3>
        {notifications.map(notif => (
          <div key={notif.id} className="notification">
            {notif.message}
            {notif.time && (
              <small> ({notif.time.start} - {notif.time.end})</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


// ========================================================================
// HELPER COMPONENT: Space Card
// ========================================================================

function SpaceCard({ space }) {
  return (
    <div className={`space-card ${space.is_available ? 'available' : 'unavailable'}`}>
      <h3>{space.name}</h3>
      <p>{space.type} | Capacity: {space.capacity}</p>
      <p>Location: {space.location}</p>

      {/* Availability Status */}
      {space.is_available ? (
        <div className="available">
          <span className="badge green">✓ Available</span>
          {space.available_hours && space.available_hours.length > 0 && (
            <div className="time-slots">
              <strong>Available hours:</strong>
              {space.available_hours.map((slot, i) => (
                <span key={i} className="time-slot">
                  {slot.start} - {slot.end}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="unavailable">
          <span className="badge red">✗ Unavailable</span>
          {space.unavailable_reason && (
            <p className="reason">{space.unavailable_reason}</p>
          )}
        </div>
      )}

      {/* Amenities */}
      {space.amenities && (
        <div className="amenities">
          {space.amenities.map((amenity) => (
            <span key={amenity.id} className="amenity">
              {amenity.icon} {amenity.name}
            </span>
          ))}
        </div>
      )}

      {/* Book Button */}
      {space.is_available && (
        <button className="btn-book">Book Now</button>
      )}
    </div>
  );
}


// ========================================================================
// TESTING THE REAL-TIME FUNCTIONALITY
// ========================================================================

/*
TO TEST:

1. Open 2 browser windows side-by-side

WINDOW 1 (User A):
- Login and navigate to spaces page
- Set filters: date=2026-01-27, time=10:00-15:00

WINDOW 2 (User B):
- Login and navigate to same page
- Same filters

ACTION:
- Window 1: Create a booking for Space #1 from 10:00-12:00

EXPECTED in Window 2:
- Automatically receives 'availability_changed' event
- Space #1 updates to show new availability
- No page refresh needed!

CONSOLE LOGS in Window 2:
📅 Availability changed!
  Space ID: 1
  Date: 2026-01-27
  Time: 10:00 - 12:00
  Message: Space availability has changed
📡 Fetching spaces via WebSocket with filters: {...}
📦 Received 35 spaces
*/

export { 
  SpacesListExample, 
  SpaceSearchExample, 
  AdvancedSpacesExample,
  SpaceCard 
};
