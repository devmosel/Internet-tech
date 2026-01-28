# WebSocket Implementation Guide

## Overview

This project implements WebSocket connections for real-time updates, currently focused on announcements. The implementation includes automatic reconnection, fallback to REST API, and a clean, maintainable architecture.

## Architecture

### Components

1. **WebSocketContext** (`src/contexts/WebSocketContext.js`)
   - Manages WebSocket connection lifecycle
   - Handles reconnection logic
   - Provides event subscription system
   - Maintains connection state

2. **useAnnouncements Hook** (`src/hooks/useAnnouncements.js`)
   - Combines REST API data with WebSocket updates
   - Falls back to REST API when WebSocket is disconnected
   - Shows toast notifications for new announcements
   - Provides connection status

3. **WebSocketProvider** (in `src/component/Providers.js`)
   - Wraps the application to provide WebSocket context
   - Automatically connects on mount
   - Cleans up on unmount

## WebSocket URL Configuration

The WebSocket URL is derived from the HTTP API base URL:
- HTTP: `http://192.168.1.101:5000/`
- WebSocket: `ws://192.168.1.101:5000/ws`

Authentication is handled via bearer token in the query parameter:
```
ws://192.168.1.101:5000/ws?token=<jwt_token>
```

## Message Protocol

### Client → Server

#### Ping
```json
{
  "type": "ping"
}
```

### Server → Client

#### Initial Announcements
Sent when client first connects:
```json
{
  "type": "announcements_initial",
  "data": [
    {
      "id": 11,
      "title": "H-10 BEFORE LAUNCH",
      "description": "PREPARE FOR THE LAUNCH IN 10 DAYS GUYS!!!!",
      "creator_name": "hr_manager",
      "created_at": "2026-01-18T17:24:47"
    }
  ]
}
```

#### New Announcement
Sent when a new announcement is created:
```json
{
  "type": "announcement_new",
  "data": {
    "id": 12,
    "title": "New Office Policy",
    "description": "Please review the updated guidelines...",
    "creator_name": "hr_manager",
    "created_at": "2026-01-25T10:30:00"
  }
}
```

#### Update Announcement
Sent when an announcement is modified:
```json
{
  "type": "announcement_update",
  "data": {
    "id": 11,
    "title": "H-10 BEFORE LAUNCH (UPDATED)",
    "description": "Updated launch information...",
    "creator_name": "hr_manager",
    "created_at": "2026-01-18T17:24:47"
  }
}
```

#### Delete Announcement
Sent when an announcement is deleted:
```json
{
  "type": "announcement_delete",
  "data": {
    "id": 11
  }
}
```

#### Pong
Response to client ping:
```json
{
  "type": "pong"
}
```

## Usage

### In Components

```javascript
import { useAnnouncements } from '@/hooks/useAnnouncements';

function MyComponent() {
  const { announcements, isConnected, hasNewAnnouncement } = useAnnouncements(fallbackData);

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {announcements.map(announcement => (
        <div key={announcement.id}>{announcement.title}</div>
      ))}
    </div>
  );
}
```

### Direct WebSocket Access

For advanced use cases, access the WebSocket context directly:

```javascript
import { useWebSocket } from '@/contexts/WebSocketContext';

function AdvancedComponent() {
  const { isConnected, send, subscribe } = useWebSocket();

  useEffect(() => {
    // Subscribe to custom events
    const unsubscribe = subscribe('custom_event', (data) => {
      console.log('Custom event received:', data);
    });

    return unsubscribe;
  }, [subscribe]);

  const sendCustomMessage = () => {
    send({ type: 'custom_action', payload: {} });
  };

  return <button onClick={sendCustomMessage}>Send Message</button>;
}
```

## Configuration

### WebSocket Settings

Located in `src/contexts/WebSocketContext.js`:

```javascript
const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,      // 3 seconds between reconnection attempts
  MAX_RECONNECT_ATTEMPTS: 5,      // Maximum number of reconnection attempts
  PING_INTERVAL: 30000,           // 30 seconds between ping messages
};
```

### Update Base URL

To change the WebSocket URL, update the base URL in `src/services/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://your-server.com:5000/',
  // WebSocket URL will automatically be: ws://your-server.com:5000/ws
};
```

## Features

### 1. Automatic Reconnection
- Attempts to reconnect up to 5 times
- 3-second delay between attempts
- Resets counter on successful connection

### 2. Connection Keep-Alive
- Sends ping every 30 seconds
- Prevents idle connection timeout
- Server should respond with pong

### 3. Fallback to REST API
- Uses REST API data when WebSocket is disconnected
- Seamless transition between WebSocket and REST
- No data loss during connection issues

### 4. Real-time Notifications
- Toast notifications for new announcements
- Visual indicators for new content
- Live connection status indicator

### 5. Clean State Management
- Centralized WebSocket state
- Event subscription system
- Proper cleanup on unmount

## Backend Requirements

For the backend team, implement the following:

### 1. WebSocket Endpoint
```
ws://your-server.com/ws?token=<jwt_token>
```

### 2. Authentication
- Verify JWT token from query parameter
- Reject connection if invalid
- Send 401 close code for auth failures

### 3. Message Handling

#### On Client Connect:
1. Verify authentication
2. Send initial announcements:
   ```json
   {
     "type": "announcements_initial",
     "data": [/* all announcements */]
   }
   ```

#### On New Announcement Created:
Broadcast to all connected clients:
```json
{
  "type": "announcement_new",
  "data": {/* announcement object */}
}
```

#### On Announcement Updated:
Broadcast to all connected clients:
```json
{
  "type": "announcement_update",
  "data": {/* updated announcement object */}
}
```

#### On Announcement Deleted:
Broadcast to all connected clients:
```json
{
  "type": "announcement_delete",
  "data": { "id": 123 }
}
```

#### On Ping Received:
Respond with pong:
```json
{
  "type": "pong"
}
```

### 4. Error Handling
- Handle malformed JSON gracefully
- Send error messages when appropriate
- Log connection errors

### 5. Connection Management
- Track active connections per user
- Clean up on disconnect
- Handle multiple tabs/devices per user

## Testing

### Manual Testing

1. **Connection Test**
   - Open browser console
   - Look for "WebSocket connected" message
   - Check connection indicator in UI

2. **Message Test**
   - Create new announcement via admin panel
   - Verify toast notification appears
   - Check announcement appears in list

3. **Reconnection Test**
   - Kill backend server
   - Verify UI shows "OFFLINE"
   - Restart server
   - Verify automatic reconnection

4. **Fallback Test**
   - Disconnect WebSocket
   - Verify data from REST API still displays
   - Reconnect
   - Verify switch to real-time data

## Troubleshooting

### WebSocket Not Connecting

1. Check browser console for errors
2. Verify token is present: `localStorage.getItem('token')`
3. Check WebSocket URL configuration
4. Ensure backend WebSocket server is running
5. Check CORS and WebSocket headers

### No Real-time Updates

1. Verify "LIVE" indicator is green
2. Check browser console for message logs
3. Test backend broadcasting
4. Verify message format matches protocol

### Connection Drops Frequently

1. Check network stability
2. Verify ping/pong implementation
3. Increase `PING_INTERVAL` if needed
4. Check backend timeout settings

## Future Enhancements

Potential extensions to the WebSocket system:

1. **Booking Updates**
   - Real-time booking availability
   - Instant booking confirmations
   - Space status changes

2. **Task Updates**
   - Real-time task assignments
   - Completion notifications
   - Due date reminders

3. **User Presence**
   - Online/offline status
   - Active user counts
   - Typing indicators

4. **Chat System**
   - Direct messaging
   - Group chats
   - File sharing

5. **Notifications**
   - Custom notification channels
   - User preferences
   - Notification history

## Best Practices

1. **Always provide fallback data** - Use REST API data as fallback
2. **Handle disconnections gracefully** - Don't break UI when offline
3. **Subscribe/unsubscribe properly** - Prevent memory leaks
4. **Validate message formats** - Handle malformed data
5. **Log important events** - Aid debugging in production
6. **Keep messages small** - Reduce bandwidth usage
7. **Use event types** - Make message handling predictable

## API Reference

### WebSocketContext

#### Methods

- `send(data)` - Send message to server
- `subscribe(eventType, callback)` - Subscribe to events
- `reconnect()` - Manually trigger reconnection

#### Properties

- `isConnected` - Boolean indicating connection status
- `announcements` - Array of current announcements

### useAnnouncements Hook

#### Returns

```typescript
{
  announcements: Array<Announcement>,
  isConnected: boolean,
  hasNewAnnouncement: boolean
}
```

#### Parameters

- `fallbackData` - Array of announcements to use as fallback (default: `[]`)

## Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Check backend WebSocket logs
4. Contact backend team for server-side issues
