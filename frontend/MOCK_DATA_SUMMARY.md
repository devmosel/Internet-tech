# Mock Data Implementation Summary

## Overview
Mock data has been added to admin and manager dashboard pages to provide realistic fallback data when the backend API is unavailable or experiencing issues.

## Pages with Mock Data

### Manager Dashboard

#### 1. Manager Users Page (`/dashboard/manager/users/page.js`)
**Mock Data Added:**
- 8 sample team members with realistic names, emails, and phone numbers
- Mix of roles: employees and managers
- Active and inactive status examples
- Booking counts ranging from 8-31
- Department info: "Engineering Team"

**Sample Users:**
- Sarah Johnson (Employee, 24 bookings)
- Michael Chen (Employee, 18 bookings)
- Emma Wilson (Manager, 31 bookings)
- David Martinez (Employee, 12 bookings)
- Lisa Anderson (Employee, Inactive, 8 bookings)
- James Taylor (Employee, 15 bookings)
- Anna Schmidt (Employee, 22 bookings)
- Robert Garcia (Employee, 19 bookings)

#### 2. Manager Announcements Page (`/dashboard/manager/announcements/page.js`)
**Mock Data Added:**
- 4 sample announcements with realistic titles and descriptions
- Different dates to show timeline variety
- Mix of department-specific and company-wide announcements

**Sample Announcements:**
- "New Office Hours" - Office hours change notification
- "Team Building Event" - Department-specific event
- "System Maintenance" - Technical maintenance notice
- "Holiday Schedule" - Company-wide holiday closure

### Admin Dashboard

#### Users Page (`/dashboard/admin/users/page.js`)
**Existing Mock Data:**
- Already has comprehensive mock data with 8 users
- Includes various roles: user, manager, admin
- Mix of departments and booking history

## Features

### Automatic Fallback
- When API calls fail, mock data is automatically loaded
- User receives a warning toast message: "Using mock data - Could not connect to backend. Displaying sample data."
- No disruption to user experience

### Realistic Data
- All mock data uses realistic German phone numbers (+49 format)
- Professional email addresses
- Varied booking counts and activity levels
- Appropriate date ranges

### Consistent Styling
- All headers updated to use `tracking-widest` for better readability
- Consistent `mb-4` spacing between title and description
- Matches the modern, spaced-out aesthetic across all pages

## Benefits

1. **Development**: Developers can work on frontend without backend dependency
2. **Testing**: QA can test UI/UX without backend setup
3. **Demos**: Product demos can proceed even if backend is down
4. **User Experience**: Graceful degradation when backend issues occur

## Next Steps

When backend is fixed:
- Mock data will automatically be replaced with real API data
- No code changes needed
- Warning toast will no longer appear
