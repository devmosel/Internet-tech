<div align="center">

# 🏢 OpenBO — Workspace Booking System

### Frontend Application

A real-time workspace booking platform built with **Next.js 16** and **React 19**.
Role-based dashboards · Interactive SVG floor plans · Live WebSocket availability · Pomodoro timer

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)
![License](https://img.shields.io/badge/License-Proprietary-red)

</div>

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Application Routes](#application-routes)
- [Architecture Deep Dive](#architecture-deep-dive)
- [API Reference](#api-reference)
- [Services Layer](#services-layer)
- [React Query Hooks](#react-query-hooks)
- [Components Reference](#components-reference)
- [Utilities & Constants](#utilities--constants)
- [Status Mapping](#status-mapping)
- [Scripts](#scripts)
- [Browser Support](#browser-support)
- [License](#license)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Next.js App Router                            │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │ Landing  │  │   Login      │  │  Dashboard  │  │  Admin   │  │  │
│  │  │ Page     │  │   Page       │  │  Pages      │  │  Pages   │  │  │
│  │  └──────────┘  └──────────────┘  └──────┬──────┘  └────┬─────┘  │  │
│  └─────────────────────────────────────────┼───────────────┼────────┘  │
│                                            │               │           │
│  ┌─────────────────────────────────────────┼───────────────┼────────┐  │
│  │              Component Layer            │               │        │  │
│  │  ┌──────────┐ ┌────────────┐ ┌─────────┴───┐ ┌────────┴─────┐  │  │
│  │  │ Sidebar  │ │BookingModal│ │ FloorPlan   │ │ SpacesGrid   │  │  │
│  │  │ Toast    │ │ StatsCard  │ │ (SVG)       │ │ BookingCard   │  │  │
│  │  │ Pomodoro │ │CheckInTimer│ │ LevelTabs   │ │ FilterBar    │  │  │
│  │  └──────────┘ └────────────┘ └─────────────┘ └──────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                    │                                  │
│  ┌─────────────────────────────────┼────────────────────────────────┐  │
│  │          State Management       │                                │  │
│  │                                 ▼                                │  │
│  │  ┌──────────────────────────────────────┐  ┌──────────────────┐  │  │
│  │  │     React Query (TanStack v5)        │  │  React Context   │  │  │
│  │  │  ┌─────────┐ ┌──────────┐ ┌───────┐ │  │  ┌────────────┐  │  │  │
│  │  │  │Queries  │ │Mutations │ │Cache  │ │  │  │ Toast      │  │  │  │
│  │  │  │(stale/  │ │(optimistic│ │(auto  │ │  │  │ WebSocket  │  │  │  │
│  │  │  │ refetch)│ │ updates) │ │inval.)│ │  │  │ Auth       │  │  │  │
│  │  │  └─────────┘ └──────────┘ └───────┘ │  │  └────────────┘  │  │  │
│  │  └──────────────────────────────────────┘  └──────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                          │                  │                         │
│  ┌───────────────────────┼──────────────────┼───────────────────────┐  │
│  │      Services Layer   │    WebSocket     │                       │  │
│  │  ┌────────────────────┴──┐  ┌────────────┴─────────────────┐    │  │
│  │  │   REST API Services   │  │   Socket.IO Connections      │    │  │
│  │  │   (fetch + Bearer JWT)│  │   /announcements namespace   │    │  │
│  │  │   14 service modules  │  │   /spaces namespace          │    │  │
│  │  └───────────┬───────────┘  └──────────────┬───────────────┘    │  │
│  └──────────────┼─────────────────────────────┼────────────────────┘  │
└─────────────────┼─────────────────────────────┼────────────────────────┘
                  │           HTTPS / WSS       │
                  ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API SERVER                               │
│              REST API (Express/Flask)  +  Socket.IO Server              │
│                       PostgreSQL / Database                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16.0.7 |
| UI Library | React | 19.2.0 |
| Styling | Tailwind CSS | 4.x |
| State / Cache | TanStack React Query | 5.90.6 |
| Realtime | Socket.IO Client | 4.8.3 |
| Animations | GSAP + ScrollTrigger | 3.14.1 |
| Auth Tokens | js-cookie | 3.0.5 |
| Compiler | React Compiler (babel-plugin) | 1.0.0 |
| Containerization | Docker (Node 20 Alpine) | Multi-stage |

---

## Features

### Authentication & Authorization
- JWT Bearer token auth with cookie storage and localStorage fallback
- Role-based access control — **Employee**, **Manager**, **Admin**
- Protected route middleware with automatic redirect
- Persistent sessions across page reloads

### Dashboard & Analytics
- Real-time statistics cards (today's bookings, upcoming, weekly hours, favorite space)
- Dynamic greeting with user profile data
- Animated stat transitions using GSAP
- Role-specific dashboard views

### Space Booking System
- Interactive **SVG floor plans** with clickable desk/room elements
- Multi-level floor navigation with `LevelTabs`
- Advanced filtering by space type, floor, date, and capacity
- Real-time availability via WebSocket (`/spaces` namespace)
- Modal-based booking flow with date/time selection
- Amenity display per space

### My Bookings Management
- Full booking lifecycle: **Active → Check-in → Checked-out → Finished**
- Check-in timer with countdown and auto-expiry
- One-click check-in / check-out / cancel actions
- Status-based badge system with color coding
- Sorted by newest first (`created_at DESC`)

### Manager Tools
- Department member management
- Space assignment capabilities
- Booking oversight for managed teams

### Admin Panel
- Full CRUD for **spaces**, **floors**, **amenities**, **departments**, **users**
- Blackout period management (block bookings for maintenance)
- System-wide booking oversight
- Announcement broadcasting via WebSocket
- Tabbed admin interface with `AdminTabs`

### UI / UX
- **Neo-brutalist** design system with glassmorphism accents
- Fully responsive layout (mobile-first)
- Command palette (`CommandPalette`) for power users
- Pomodoro timer overlay with transition animations
- Toast notification system (auto-dismiss, stacked, slide-in)
- Custom calendar component with glassy light/dark themes
- Loading skeletons and smooth GSAP page transitions
- Persistent sidebar state via localStorage

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── globals.css               # Global styles + Tailwind imports
│   ├── layout.js                 # Root layout (Providers, fonts)
│   ├── page.js                   # Landing page
│   ├── login/
│   │   └── page.js              # Authentication page
│   └── dashboard/
│       ├── layout.js            # Dashboard shell (Sidebar, Toast, WS)
│       ├── page.js              # Main dashboard
│       ├── booking/             # Space booking flow
│       ├── myBooking/           # User's bookings
│       ├── profile/             # User profile
│       ├── pomodoro/            # Pomodoro timer
│       ├── support/             # Support page
│       ├── manager/             # Manager tools
│       └── admin/
│           ├── layout.js        # Admin shell
│           ├── page.js          # Admin dashboard
│           ├── amenities/       # Amenity management
│           ├── blackouts/       # Blackout periods
│           ├── bookings/        # All bookings
│           ├── departments/     # Department CRUD
│           ├── floors/          # Floor management
│           ├── spaces/          # Space management
│           └── users/           # User management
│
├── component/                    # Shared UI components (33 modules)
│   ├── AdminTabs.js             # Admin navigation tabs
│   ├── AnimatedStatusToggle.js  # GSAP-powered toggle
│   ├── AssignmentDialog.js      # Space assignment modal
│   ├── BlackoutDialog.js        # Blackout period form
│   ├── BookedSpaceCard.js       # Booked space display
│   ├── BookingCard.js           # Booking list item
│   ├── BookingModal.js          # Booking creation flow
│   ├── ButtonV1.js              # Primary button component
│   ├── CheckInTimer.js          # Countdown timer
│   ├── CommandPalette.js        # Keyboard command palette
│   ├── CustomCalendar.js        # Date picker
│   ├── DashboardLayout.js       # Layout wrapper (no-blink nav)
│   ├── DateTimeSelector.js      # Date + time picker
│   ├── DefaultMsg.js            # Empty state message
│   ├── DeleteConfirmDialog.js   # Deletion confirmation
│   ├── DepartmentDialog.js      # Department form
│   ├── FilterBar.js             # Search & filter controls
│   ├── LogoutButton.js          # Logout action
│   ├── NotificationPanel.js     # Announcement feed
│   ├── PomodoroOverlay.js       # Timer overlay
│   ├── PomodoroTransition.js    # Timer transition effects
│   ├── ProtectedRoute.js        # Auth guard wrapper
│   ├── Providers.js             # Context provider tree
│   ├── Sidebar.js               # Navigation sidebar
│   ├── SpaceCard.js             # Space listing card
│   ├── SpacesGrid.js            # Space grid layout
│   ├── StatsCard.js             # Statistics display card
│   ├── TaskDialog.js            # Task form modal
│   ├── Toast.js                 # Toast notifications
│   ├── Tooltip.js               # Hover tooltip
│   ├── UserDialog.js            # User form modal
│   ├── floor-plan/
│   │   ├── FloorPlan.js         # Interactive SVG floor plan
│   │   └── LevelTabs.js         # Floor level selector
│   └── icons/
│       └── SpaceTypeIcons.js    # Space type icon set
│
├── contexts/                     # React Context providers
│   ├── SpacesWebSocketContext.js # Real-time space availability
│   ├── ToastContext.js          # Global toast notifications
│   └── WebSocketContext.js      # Announcement WebSocket
│
├── hooks/                        # Custom React hooks
│   ├── index.js                 # Hook exports
│   ├── useAnnouncements.js      # Announcement queries
│   ├── useAuth.js               # Auth mutations
│   ├── useBookings.js           # Booking CRUD hooks
│   ├── useBookingSearch.js      # Search & filter logic
│   ├── useCurrentUser.js        # Current user query
│   ├── useSpaces.js             # Space data hooks
│   ├── useStats.js              # Statistics queries
│   └── useUser.js               # User management hooks
│
├── services/                     # API service layer
│   ├── config.js                # API base URL + headers
│   ├── index.js                 # Service barrel exports
│   ├── amenityService.js        # Amenity endpoints
│   ├── announcementService.js   # Announcement endpoints
│   ├── assignmentService.js     # Assignment endpoints
│   ├── authService.js           # Auth endpoints
│   ├── blackoutService.js       # Blackout endpoints
│   ├── bookingService.js        # Booking endpoints
│   ├── departmentService.js     # Department endpoints
│   ├── floorService.js          # Floor endpoints
│   ├── spaceService.js          # Space endpoints
│   ├── statsService.js          # Statistics endpoints
│   ├── taskService.js           # Task endpoints
│   └── userService.js           # User endpoints
│
├── lib/                          # Core utilities
│   ├── auth.js                  # Token management (cookie/localStorage)
│   └── useAuth.js               # Auth state hook
│
├── constants/
│   └── booking.js               # Status maps, colors, labels
│
├── utils/
│   ├── animations.js            # GSAP animation helpers
│   ├── date.js                  # Date formatting utilities
│   ├── space.js                 # Space type helpers
│   └── user.js                  # User display utilities
│
└── styles/
    ├── calendar-glassy.css      # Calendar dark theme
    └── calendar-glassy-light.css # Calendar light theme
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ (LTS recommended) |
| npm | 10+ |
| Backend API | Running and accessible |

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Docker Deployment

The project includes a production-optimized multi-stage Docker build:

```bash
# Build and run with Docker Compose
docker compose up --build -d

# Or build manually
docker build -t openbo-frontend .
docker run -p 3001:3000 openbo-frontend
```

The Dockerfile uses **Node 20 Alpine** with standalone output for minimal image size.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | Same as API URL |
| `PORT` | Application port | `3000` |
| `HOSTNAME` | Bind address | `0.0.0.0` |

---

## Application Routes

```
/                           → Landing page (public)
/login                      → Authentication (public)
/dashboard                  → Main dashboard (protected)
/dashboard/booking          → Space booking (protected)
/dashboard/myBooking        → My bookings (protected)
/dashboard/profile          → User profile (protected)
/dashboard/pomodoro         → Pomodoro timer (protected)
/dashboard/support          → Support page (protected)
/dashboard/manager          → Manager tools (role: manager)
/dashboard/admin            → Admin dashboard (role: admin)
/dashboard/admin/spaces     → Space management (role: admin)
/dashboard/admin/floors     → Floor management (role: admin)
/dashboard/admin/amenities  → Amenity management (role: admin)
/dashboard/admin/bookings   → Booking oversight (role: admin)
/dashboard/admin/users      → User management (role: admin)
/dashboard/admin/departments → Department management (role: admin)
/dashboard/admin/blackouts  → Blackout periods (role: admin)
```

---

## Architecture Deep Dive

### Authentication Flow

```
┌──────────┐     POST /auth/login     ┌──────────────┐
│  Login   │ ──────────────────────── │  Backend API  │
│  Page    │                          │              │
│          │ ◄── { token, user } ──── │              │
└────┬─────┘                          └──────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Token Storage                   │
│  ┌────────────┐ ┌──────────────┐ │
│  │ js-cookie  │ │ localStorage │ │
│  │ (primary)  │ │ (fallback)   │ │
│  └────────────┘ └──────────────┘ │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  middleware.js                   │
│  Checks token on every request   │
│  Redirects to /login if missing  │
│  Allows public: /, /login        │
└──────────────────────────────────┘
```

### WebSocket Layer

```
┌─────────────────────────────────────────────┐
│              Socket.IO Client               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ WebSocketContext (/announcements)     │  │
│  │  Events: new_announcement, connect    │  │
│  │  Invalidates: ['announcements'] cache │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ SpacesWebSocketContext (/spaces)      │  │
│  │  Events: space_update, booking_update │  │
│  │  Invalidates: ['spaces'] cache        │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Data Flow

```
Component ──► useHook() ──► React Query ──► Service ──► fetch(API)
    │              │              │
    │              │              └─── Cache (staleTime: 5 min)
    │              │                   Auto-refetch on window focus
    │              │                   Retry: 1 attempt
    │              │
    │              └─── useMutation() ──► onSuccess: invalidateQueries()
    │
    └─── WebSocket event ──► queryClient.invalidateQueries()
         (real-time sync)
```

### Provider Tree

```
<QueryClientProvider>           ← React Query cache
  <ToastProvider>               ← Global notifications
    <WebSocketProvider>         ← /announcements namespace
      <SpacesWebSocketProvider> ← /spaces namespace
        <DashboardLayout>       ← Sidebar + content shell
          {children}            ← Page components
        </DashboardLayout>
      </SpacesWebSocketProvider>
    </WebSocketProvider>
  </ToastProvider>
</QueryClientProvider>
```

---

## API Reference

All requests use `Bearer <token>` authorization. Base URL is configured in `src/services/config.js`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/logout` | Invalidate session |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/me` | Get current user profile |
| GET | `/api/user` | List all users (admin) |
| POST | `/api/user` | Create user (admin) |
| PUT | `/api/user/:id` | Update user (admin) |
| DELETE | `/api/user/:id` | Delete user (admin) |

### Spaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/spaces` | List all spaces |
| GET | `/api/spaces/:id` | Get space details |
| POST | `/api/spaces` | Create space (admin) |
| PUT | `/api/spaces/:id` | Update space (admin) |
| DELETE | `/api/spaces/:id` | Delete space (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List bookings |
| GET | `/api/bookings/user/:id` | User's bookings |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/:id` | Update status (check-in/out/cancel) |
| DELETE | `/api/bookings/:id` | Delete booking (admin) |

### Floors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/floors` | List all floors |
| POST | `/api/floors` | Create floor (admin) |
| PUT | `/api/floors/:id` | Update floor (admin) |
| DELETE | `/api/floors/:id` | Delete floor (admin) |

### Departments, Amenities, Blackouts, Assignments, Tasks, Stats, Announcements

Each follows standard REST conventions with GET/POST/PUT/DELETE endpoints. See the corresponding service files in `src/services/` for full endpoint details.

### Response Format

```json
{
  "success": true,
  "message": "Operation completed",
  "status_code": 200,
  "data": { }
}
```

---

## Services Layer

All services use the shared `getHeaders()` function from `config.js` which injects the Bearer token.

| Module | Functions |
|--------|-----------|
| `authService` | `login`, `logout`, `register` |
| `userService` | `getCurrentUser`, `getAllUsers`, `createUser`, `updateUser`, `deleteUser` |
| `spaceService` | `getSpaces`, `getSpaceById`, `createSpace`, `updateSpace`, `deleteSpace`, `getSpaceTypes` |
| `bookingService` | `getBookings`, `getUserBookings`, `createBooking`, `updateBooking`, `deleteBooking`, `checkIn`, `checkOut`, `cancelBooking` |
| `floorService` | `getFloors`, `createFloor`, `updateFloor`, `deleteFloor` |
| `departmentService` | `getDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment` |
| `amenityService` | `getAmenities`, `createAmenity`, `updateAmenity`, `deleteAmenity` |
| `blackoutService` | `getBlackouts`, `createBlackout`, `updateBlackout`, `deleteBlackout` |
| `assignmentService` | `getAssignments`, `createAssignment`, `updateAssignment`, `deleteAssignment` |
| `taskService` | `getTasks`, `createTask`, `updateTask`, `deleteTask` |
| `statsService` | `getEmployeeStats`, `getAdminStats`, `getManagerStats` |
| `announcementService` | `getAnnouncements`, `createAnnouncement`, `deleteAnnouncement` |

---

## React Query Hooks

| Hook | Type | Query Key | Description |
|------|------|-----------|-------------|
| `useCurrentUser` | Query | `['currentUser']` | Fetches authenticated user profile |
| `useSpaces` | Query | `['spaces']` | All available spaces |
| `useSpaceTypes` | Query | `['spaceTypes']` | Space type categories |
| `useBookings` | Query | `['bookings']` | All bookings (admin) |
| `useUserBookings` | Query | `['userBookings', userId]` | User-specific bookings |
| `useStats` | Query | `['employeeStats', userId]` | Employee dashboard stats |
| `useAnnouncements` | Query | `['announcements']` | System announcements |
| `useLogin` | Mutation | — | Authenticate + store token |
| `useLogout` | Mutation | — | Clear token + redirect |
| `useCreateBooking` | Mutation | — | Create new booking |
| `useUpdateBooking` | Mutation | — | Update booking status |
| `useCancelBooking` | Mutation | — | Cancel active booking |
| `useCheckIn` | Mutation | — | Check in to booking |
| `useCheckOut` | Mutation | — | Check out of booking |
| `useCreateSpace` | Mutation | — | Add new space (admin) |
| `useUpdateSpace` | Mutation | — | Edit space (admin) |
| `useDeleteSpace` | Mutation | — | Remove space (admin) |
| `useCreateUser` | Mutation | — | Add new user (admin) |
| `useUpdateUser` | Mutation | — | Edit user (admin) |

All mutations automatically invalidate related query caches on success.

---

## Components Reference

| Component | Purpose |
|-----------|---------|
| `DashboardLayout` | Sidebar + content wrapper, prevents re-renders on navigation |
| `Sidebar` | Collapsible nav with role-based menu items, localStorage persistence |
| `ProtectedRoute` | Auth guard, redirects unauthenticated users |
| `Providers` | Wraps app in QueryClient, Toast, WebSocket contexts |
| `BookingModal` | Full booking creation flow with date/time/space selection |
| `FloorPlan` | Interactive SVG floor plan with clickable spaces |
| `LevelTabs` | Floor level navigation tabs |
| `SpacesGrid` | Filterable grid of available spaces |
| `SpaceCard` | Individual space card with type icon and amenities |
| `FilterBar` | Search, type filter, and floor filter controls |
| `BookingCard` | Booking item with status badge, actions, and timer |
| `BookedSpaceCard` | Compact booked space display |
| `CheckInTimer` | Countdown timer for check-in window |
| `StatsCard` | Animated statistics display card |
| `DateTimeSelector` | Combined date and time picker |
| `CustomCalendar` | Glassmorphic calendar with dark/light themes |
| `Toast` | Notification toast with auto-dismiss and slide animation |
| `NotificationPanel` | Live announcement feed via WebSocket |
| `CommandPalette` | Keyboard-driven command interface |
| `PomodoroOverlay` | Focus timer with session tracking |
| `PomodoroTransition` | Animated transition between timer states |
| `AdminTabs` | Tab navigation for admin sub-pages |
| `AnimatedStatusToggle` | GSAP-powered status toggle switch |
| `AssignmentDialog` | Space assignment creation/edit modal |
| `BlackoutDialog` | Blackout period form dialog |
| `DeleteConfirmDialog` | Confirmation modal for destructive actions |
| `DepartmentDialog` | Department creation/edit form |
| `TaskDialog` | Task creation/edit modal |
| `UserDialog` | User creation/edit form (admin) |
| `ButtonV1` | Primary action button component |
| `DefaultMsg` | Empty state placeholder message |
| `LogoutButton` | Logout action with redirect |
| `Tooltip` | Hover tooltip component |
| `SpaceTypeIcons` | Icon set for space categories |

---

## Utilities & Constants

### `utils/animations.js`
GSAP animation presets including `hapticClick` for tactile button feedback.

### `utils/date.js`
Date formatting helpers: relative time, range display, ISO conversion.

### `utils/space.js`
Space type categorization, icon mapping, capacity formatting.

### `utils/user.js`
User display name formatting, role label mapping, avatar helpers.

### `constants/booking.js`
Status configuration maps:

| API Status | Display Label | Badge Color | Action Available |
|------------|--------------|-------------|-----------------|
| `active` | Active | Green | Check-in, Cancel |
| `checkin` | Checked In | Blue | Check-out |
| `checkout` | Finished | Gray | — |
| `finished` | Finished | Gray | — |
| `completed` | Finished | Gray | — |
| `cancel` | Cancelled | Red | — |
| `cancelled` | Cancelled | Red | — |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build with standalone output |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 |
| Firefox | Latest 2 |
| Safari | Latest 2 |
| Edge | Latest 2 |

---

## Authors

**Internet Technology Course Project — February 2026**

- Adam Bisyahri
- Eric Meilaki Pangaribuan
- Dilan Rahmajulianisa

---

## License

Proprietary — All rights reserved.
