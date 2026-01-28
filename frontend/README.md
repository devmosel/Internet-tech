# Workspace Booking System - Frontend

A modern workspace booking application built with Next.js 16, featuring real-time booking management, authentication, and statistics dashboard.

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS
- **Authentication**: JWT Bearer Token
- **API**: REST API (http://192.168.1.101:5000)

## Features

### 🔐 Authentication
- Login/Logout functionality
- Protected routes with middleware
- JWT token-based authentication
- Persistent user sessions

### 📊 Dashboard
- Real-time statistics display
- Today's bookings count
- Upcoming bookings tracker
- Weekly hours booked
- Favorite space analytics
- Dynamic greeting with user name

### 🏢 Space Booking
- Browse available spaces
- Filter by space type (meeting room, focus booth, etc.)
- Date and time selection
- Real-time availability checking
- Booking confirmation with toast notifications
- Modal-based booking flow

### 📅 My Bookings
- View all user bookings (sorted by created_at DESC)
- Status-based badge system:
  - **Active** (Green) - New bookings
  - **Check-in** (Blue) - Currently in use
  - **Finished** (Gray) - Completed bookings
  - **Cancelled** (Red) - Cancelled bookings
- Check-in/Check-out functionality
- Booking cancellation
- QR code display (coming soon)
- Check-in code management

### 🎨 UI/UX Features
- Responsive design (mobile-first)
- Toast notifications (bottom-right)
- Loading skeletons
- Persistent sidebar state (localStorage)
- No-blink navigation (layout wrapper pattern)
- Smooth transitions and animations

## Project Structure

```
src/
├── app/
│   ├── booking/          # Space booking page
│   ├── dashboard/        # Main dashboard
│   │   └── myBooking/    # User bookings management
│   └── login/            # Authentication page
├── component/            # Legacy components
│   ├── ProtectedRoute.js
│   └── SpaceCard.js
├── components/           # Modern components
│   ├── DashboardLayout.js      # Main layout wrapper
│   ├── Sidebar.js              # Navigation sidebar
│   ├── NotificationPanel.js
│   ├── Toast.js                # Toast notification
│   ├── booking/
│   │   ├── DateTimeSelector.js
│   │   ├── FilterBar.js
│   │   └── SpacesGrid.js
│   ├── dashboard/
│   │   └── StatsCard.js        # Reusable stats card
│   └── mybooking/
│       └── BookingCard.js      # Individual booking card
├── contexts/
│   ├── SidebarContext.js       # Global sidebar state
│   └── ToastContext.js         # Global toast state
├── hooks/
│   ├── useBookingSearch.js     # Booking search logic
│   └── useCurrentUser.js       # Current user data
├── lib/
│   ├── auth.js                 # Auth utilities
│   └── useAuth.js              # Auth hook
├── services/
│   ├── authService.js          # Authentication API
│   ├── bookingService.js       # Booking CRUD
│   ├── spaceService.js         # Space data
│   ├── statsService.js         # Statistics API
│   ├── userService.js          # User profile
│   ├── config.js               # API configuration
│   └── index.js                # Service exports
└── utils/
    ├── date.js                 # Date formatting
    ├── space.js                # Space utilities
    └── user.js                 # User utilities
```

## API Integration

### Endpoints Used

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Spaces**
- `GET /api/spaces` - List all spaces
- `GET /api/spaces/:id` - Get space details

**Bookings**
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:userId` - Get user bookings
- `PATCH /api/bookings/:id` - Update booking (check-in, check-out, cancel)
  - Body: `{ status: "checkin", checkin_code: "..." }` for check-in
  - Body: `{ status: "checkout" }` for check-out
  - Body: `{ status: "cancel" }` for cancel

**Statistics**
- `GET /api/stats_employee/:userId` - Get user statistics

### API Response Format

```javascript
{
  "success": boolean,
  "message": string,
  "status_code": number,
  "data": object | array
}
```

## Status Mapping

The app maps API status values to UI-friendly statuses:

| API Status | UI Status | Badge Color |
|-----------|-----------|-------------|
| active    | active    | Green       |
| checkin   | checkin   | Blue        |
| checkout  | finished  | Gray        |
| finished  | finished  | Gray        |
| completed | finished  | Gray        |
| cancel    | cancelled | Red         |
| cancelled | cancelled | Red         |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure API endpoint (if needed)
Edit `/src/services/config.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.101:5000',
  // ...
};
```

4. Run development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Key Features Implementation

### Toast Notifications
- Global context provider
- 5-second auto-dismiss
- Success/Error states
- Persists across navigation
- Slide-in animation from bottom-right

### Sidebar Persistence
- localStorage integration
- Global state with Context API
- Survives page navigation
- Smooth toggle animation

### Layout Optimization
- DashboardLayout wrapper pattern
- Sidebar/NotificationPanel render once
- Only page content re-renders
- Prevents "blink" on navigation

### Booking Management
- Real-time status updates
- Optimistic UI updates
- API response integration
- Error handling with toast

### Data Sorting
- Bookings sorted by `created_at` DESC
- Newest bookings appear first
- Consistent ordering on refresh

## Environment

- **Development**: `npm run dev` (Port 3000)
- **Build**: `npm run build`
- **Production**: `npm start`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a private project. For any questions or issues, please contact the development team.

## License

Proprietary - All rights reserved
