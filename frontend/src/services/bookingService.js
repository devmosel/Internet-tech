// Booking service - create, read, update bookings

import { API_CONFIG, API_ENDPOINTS } from './config';
import { auth } from '@/lib/auth';

// Get all bookings (admin)
export const getAllBookingsForManage = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.MANAGE_BOOKINGS}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

const getAuthHeaders = () => {
  const token = auth.getToken();
  const headers = { ...API_CONFIG.HEADERS };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Transform booking data from API format to UI format
 * @param {Object} booking - Booking data from API
 * @returns {Object} Transformed booking data
 */
const transformBookingData = (booking) => {
  const statusMap = {
    'finished': 'finished',
    'completed': 'finished',
    'cancel': 'cancelled',
    'cancelled': 'cancelled',
    'checkout': 'finished',
  };

  let mappedStatus;

  if (booking.checkout_at && booking.checkout_at !== null) {
    mappedStatus = 'finished';
  }
  else if (booking.status?.toLowerCase() === 'cancel' || booking.status?.toLowerCase() === 'cancelled') {
    mappedStatus = 'cancelled';
  } else {
    mappedStatus = statusMap[booking.status?.toLowerCase()] || booking.status;
  }

  // API already provides date, start_time, and end_time in correct format
  return {
    id: booking.id,
    space_id: booking.space_id,
    space_name: booking.space_name || `Space ${booking.space_id}`,
    space_type: booking.space_type || 'Unknown',
    date: booking.date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: mappedStatus,
    checkin_at: booking.checkin_at,
    checkout_at: booking.checkout_at,
    code_valid_from: booking.code_valid_from,
    code_valid_to: booking.code_valid_to,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    user_id: booking.user_id
  };
};

// Create new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.BOOKINGS}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData),
      }
    );

    const result = await response.json();

    // Handle API response format: { success, message, status_code, data }
    if (!result.success) {
      const error = new Error(result.message || 'Failed to create booking');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Get user's bookings
export const getUserBookings = async (userId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_BOOKINGS_BY_ID(userId)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await response.json();

    if (!result.success) {
      const error = new Error(result.message || 'Failed to fetch user bookings');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    const transformedData = {
      ...result,
      data: Array.isArray(result.data)
        ? result.data.map(transformBookingData)
        : []
    };

    return transformedData;
  } catch (error) {
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.BOOKING_BY_ID(bookingId)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch booking details');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.BOOKING_BY_ID(bookingId)}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'cancel'
        }),
      }
    );

    const result = await response.json();

    // Handle API response format: { success, message, status_code, data }
    if (!result.success) {
      const error = new Error(result.message || 'Failed to cancel booking');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Update booking
export const updateBooking = async (bookingId, updateData) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.BOOKING_BY_ID(bookingId)}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update booking');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Check-in to booking
export const checkInBooking = async (bookingId, checkinCode) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.BOOKING_BY_ID(bookingId)}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'checkin',
          checkin_code: checkinCode
        }),
      }
    );

    const result = await response.json();

    // Handle API response format: { success, message, status_code, data }
    if (!result.success) {
      const error = new Error(result.message || 'Failed to check-in');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Check-out from booking
export const checkOutBooking = async (bookingId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.BOOKING_BY_ID(bookingId)}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'checkout'
        }),
      }
    );

    const result = await response.json();

    // Handle API response format: { success, message, status_code, data }
    if (!result.success) {
      const error = new Error(result.message || 'Failed to check-out');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Delete booking (admin only)
export const deleteBooking = async (bookingId) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/bookings/manage/${bookingId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    const result = await response.json();

    // Handle API response format: { success, message, status_code, data }
    if (!result.success) {
      const error = new Error(result.message || 'Failed to delete booking');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    return result;
  } catch (error) {
    throw error;
  }
};
