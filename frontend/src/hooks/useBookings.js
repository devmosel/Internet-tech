// Booking hooks for React Query

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
} from '@/services/bookingService';

// Fetch user's bookings
export const useUserBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'user'],
    queryFn: async () => {
      const { auth } = await import('@/lib/auth');
      const user = auth.getUser();
      if (!user?.id) return [];
      return getUserBookings(user.id);
    },
    staleTime: 30 * 1000,
  });
};

// Fetch booking by ID
export const useBooking = (bookingId) => {
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
    staleTime: 30 * 1000,
  });
};

// Create new booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
};

// Update booking
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, bookingData }) => updateBooking(bookingId, bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
};

// Cancel booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Check-in to booking
export const useCheckInBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, checkinCode }) => checkInBooking(bookingId, checkinCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Check-out from booking
export const useCheckOutBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkOutBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
