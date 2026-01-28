/**
 * Hooks index
 * Central export point for all React Query hooks
 */

// Auth hooks
export {
  useLogin,
  useLogout,
  useRegister,
} from './useAuth';

// Booking hooks
export {
  useUserBookings,
  useBooking,
  useCreateBooking,
  useUpdateBooking,
  useCancelBooking,
  useCheckInBooking,
  useCheckOutBooking,
} from './useBookings';

// Space hooks
export {
  useSpace,
  useAllSpaces,
  useSearchSpaces,
} from './useSpaces';

// Stats hooks
export {
  useDashboardStats,
} from './useStats';

// User hooks
export {
  useUserProfile,
  useUpdateProfile,
} from './useUser';

// Current user (local auth)
export { useCurrentUser } from './useCurrentUser';

// Booking search
export { useBookingSearch } from './useBookingSearch';

// WebSocket hooks
export { useAnnouncements } from './useAnnouncements';
