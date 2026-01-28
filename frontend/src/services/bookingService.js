/**
 * Booking Service
 * Handles all booking-related API calls
 */

import { API_CONFIG, API_ENDPOINTS } from './config';
import { auth } from '@/lib/auth';

/**
 * Get all bookings for admin management
 * @returns {Promise<Object>} API response with all bookings
 */
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
    console.error('Error fetching manage bookings:', error);
    throw error;
  }
};

/**
 * Get headers with authentication token
 * @returns {Object} Headers object with auth token if available
 */
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
  // Map API status values to UI status values
  const statusMap = {
    'active': 'active',
    'checkin': 'checkin',         // Keep as 'checkin' for blue badge
    'checkout': 'finished',       // Map to 'finished' for gray badge
    'finished': 'finished',       // Keep as 'finished' for gray badge
    'completed': 'finished',      // Map to 'finished' for gray badge
    'cancel': 'cancelled',
    'cancelled': 'cancelled'
  };

  // Determine the correct status based on booking state
  let mappedStatus;

  // Priority 1: If checkout_at exists, booking is finished
  if (booking.checkout_at && booking.checkout_at !== null) {
    mappedStatus = 'finished';
  }
  // Priority 2: If status is cancel/cancelled, keep it cancelled
  else if (booking.status?.toLowerCase() === 'cancel' || booking.status?.toLowerCase() === 'cancelled') {
    mappedStatus = 'cancelled';
  }
  // Priority 3: Map other statuses normally
  else {
    mappedStatus = statusMap[booking.status?.toLowerCase()] || booking.status;
  }

  console.log('Transforming booking:', {
    id: booking.id,
    originalStatus: booking.status,
    checkout_at: booking.checkout_at,
    mappedStatus: mappedStatus
  });

  // API already provides date, start_time, and end_time in correct format
  return {
    id: booking.id,
    space_id: booking.space_id,
    space_name: booking.space_name || `Space ${booking.space_id}`,
    space_type: booking.space_type || 'Unknown',
    date: booking.date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    checkin_code: booking.checkin_code,
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

/**
 * Create a new booking
 * @param {Object} bookingData - Booking details
 * @param {string} bookingData.spaceId - Space ID to book
 * @param {string} bookingData.date - Booking date (YYYY-MM-DD)
 * @param {string} bookingData.startTime - Start time (HH:MM)
 * @param {string} bookingData.endTime - End time (HH:MM)
 * @returns {Promise<Object>} Created booking data
 */
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

    console.log('Booking created successfully:', result);

    return result;
  } catch (error) {
    // Only log unexpected errors, not API validation errors
    if (!error.response) {
      console.error('Create booking error:', error);
    }
    throw error;
  }
};

/**
 * Get all bookings for a specific user
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} User's bookings with transformed data
 */
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
    console.log('Raw API response:', result);

    // Handle API response format: { success, message, status_code, data }
    if (!result.success) {
      const error = new Error(result.message || 'Failed to fetch user bookings');
      error.statusCode = result.status_code;
      error.response = result;
      throw error;
    }

    // Transform bookings data to UI format
    const transformedData = {
      ...result,
      data: Array.isArray(result.data)
        ? result.data.map(transformBookingData)
        : []
    };

    console.log('Transformed bookings:', transformedData);
    return transformedData;
  } catch (error) {
    // Only log unexpected errors, not API validation errors
    if (!error.response) {
      console.error('Get user bookings error:', error);
    }
    throw error;
  }
};

/**
 * Get booking by ID
 * @param {string|number} bookingId - Booking ID
 * @returns {Promise<Object>} Booking details
 */
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
    console.error('Get booking by ID error:', error);
    throw error;
  }
};

/**
 * Cancel a booking
 * @param {string|number} bookingId - Booking ID to cancel
 * @returns {Promise<Object>} Cancellation response
 */
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
    // Only log unexpected errors, not API validation errors
    if (!error.response) {
      console.error('Cancel booking error:', error);
    }
    throw error;
  }
};

/**
 * Update a booking
 * @param {string|number} bookingId - Booking ID
 * @param {Object} updateData - Updated booking data
 * @returns {Promise<Object>} Updated booking
 */
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
    console.error('Update booking error:', error);
    throw error;
  }
};

/**
 * Check-in to a booking
 * @param {string|number} bookingId - Booking ID
 * @param {string} checkinCode - Check-in code
 * @returns {Promise<Object>} Check-in response
 */
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
    // Only log unexpected errors, not API validation errors
    if (!error.response) {
      console.error('Check-in booking error:', error);
    }
    throw error;
  }
};

/**
 * Check-out from a booking
 * @param {string|number} bookingId - Booking ID
 * @returns {Promise<Object>} Check-out response
 */
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
    // Only log unexpected errors, not API validation errors
    if (!error.response) {
      console.error('Check-out booking error:', error);
    }
    throw error;
  }
};

/**
 * Delete a booking (admin only)
 * @param {string|number} bookingId - Booking ID to delete
 * @returns {Promise<Object>} Deletion response
 */
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
    // Only log unexpected errors, not API validation errors
    if (!error.response) {
      console.error('Delete booking error:', error);
    }
    throw error;
  }
};
