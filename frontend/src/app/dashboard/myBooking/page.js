/**
 * My Bookings Page
 * Content only - Sidebar and NotificationPanel from layout
 */

'use client';

import BookingCard from '@/component/BookingCard';
import { useCurrentUser, useUserBookings, useCheckInBooking, useCheckOutBooking, useCancelBooking } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { formatDateWithDay } from '@/utils/date';

// Map API status values to UI status values
const mapStatusToUI = (status) => {
  const statusMap = {
    'active': 'active',
    'checkin': 'checkin',         // Keep as 'checkin' for blue badge
    'checkout': 'finished',       // Map to 'finished' for gray badge
    'finished': 'finished',       // Keep as 'finished' for gray badge
    'completed': 'finished',      // Map to 'finished' for gray badge
    'cancel': 'cancelled',
    'cancelled': 'cancelled'
  };

  return statusMap[status?.toLowerCase()] || status;
};

export default function MyBookingPage() {
  const { currentUser } = useCurrentUser();
  const { showToastMessage } = useToast();

  const { data: response, isLoading: loading, refetch } = useUserBookings();
  const { mutate: checkIn } = useCheckInBooking();
  const { mutate: checkOut } = useCheckOutBooking();
  const { mutate: cancel } = useCancelBooking();

  // Extract bookings data from response and format
  const bookingsData = response?.data || [];
  const bookings = bookingsData
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(booking => ({
      ...booking,
      date: formatDateWithDay(booking.date)
    }));

  // Separate bookings into checked-in, active, and past
  const checkedInBookings = bookings.filter(b =>
    b.status === 'checkin'
  );

  const activeBookings = bookings.filter(b =>
    b.status === 'active'
  );

  const pastBookings = bookings.filter(b =>
    b.status === 'cancelled' || b.status === 'finished' || b.status === 'completed' || b.status === 'checkout'
  );

  const handleCheckIn = async (booking) => {
    checkIn(
      { bookingId: booking.id, checkinCode: booking.checkin_code },
      {
        onSuccess: (response) => {
          showToastMessage({
            type: 'success',
            title: 'Checked In!',
            message: response.message || `You've successfully checked in to ${booking.space_name}`,
            duration: 5000
          });
          refetch();
        },
        onError: (error) => {
          console.error('Check-in error:', error);
          showToastMessage({
            type: 'error',
            title: 'Check-in Failed',
            message: error.message || 'Failed to check in',
            duration: 5000
          });
        }
      }
    );
  };

  const handleCheckOut = async (booking) => {
    checkOut(booking.id, {
      onSuccess: (response) => {
        showToastMessage({
          type: 'success',
          title: 'Checked Out!',
          message: response.message || `You've successfully checked out from ${booking.space_name}`,
          duration: 5000
        });
        refetch();
      },
      onError: (error) => {
        console.error('Check-out error:', error);
        showToastMessage({
          type: 'error',
          title: 'Check-out Failed',
          message: error.message || 'Failed to check out',
          duration: 5000
        });
      }
    });
  };

  const handleCancel = async (booking) => {
    cancel(booking.id, {
      onSuccess: (response) => {
        showToastMessage({
          type: 'success',
          title: 'Booking Cancelled',
          message: response.message || `Your booking for ${booking.space_name} has been cancelled`,
          duration: 5000
        });
        refetch();
      },
      onError: (error) => {
        console.error('Cancel booking error:', error);
        showToastMessage({
          type: 'error',
          title: 'Cancellation Failed',
          message: error.message || 'Failed to cancel booking',
          duration: 5000
        });
      }
    });
  };

  const handleShowQR = (booking) => {
    // TODO: Show QR code modal
    showToastMessage({
      type: 'success',
      title: 'QR Code',
      message: 'QR code feature coming soon',
      duration: 3000
    });
  };

  return (
    <div className="min-h-full px-4 sm:px-6 md:px-8 py-8 md:py-10 bg-[#FFFEF8]" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Background Aesthetics - Watercolor Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#E0F2FE] rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-[#FFEDD5] rounded-full blur-[60px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-gray-500 font-medium mb-1 pl-1">
              Your Reservations
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
              MY <span className="text-gray-400">BOOKINGS</span>
            </h1>
          </div>
        </div>

        {/* Checked-In Bookings Section - Replaces Search Bar */}
        {checkedInBookings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse"></div>
              <h2 className="text-3xl font-black text-black uppercase tracking-tight" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
                Currently Checked In
              </h2>
              <span className="text-sm font-bold bg-blue-500 text-white px-3 py-1 rounded-md ml-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {checkedInBookings.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {checkedInBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  onCancel={handleCancel}
                  onShowQR={handleShowQR}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-[24px] p-12 text-center relative overflow-hidden max-w-2xl mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 border-2 border-black rounded-full flex items-center justify-center mb-6 text-4xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">📅</div>
              <p className="text-black font-black text-2xl uppercase mb-4" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>No bookings yet</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                Book a space to see it here
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Left Column: Active Bookings */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b-2 border-black pb-2">
                <div className="w-3 h-3 rounded-full bg-green-400 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"></div>
                <h2 className="text-2xl font-black text-black uppercase tracking-tight" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>Active Bookings</h2>
                <span className="text-sm font-bold bg-black text-white px-2 py-0.5 rounded-md ml-auto">{activeBookings.length}</span>
              </div>

              {activeBookings.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-black/20 rounded-[24px] p-8 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-wide">No active bookings</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {activeBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                      onCancel={handleCancel}
                      onShowQR={handleShowQR}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Past Bookings */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b-2 border-black pb-2 opacity-60">
                <div className="w-3 h-3 rounded-full bg-gray-300 border border-black"></div>
                <h2 className="text-2xl font-black text-black uppercase tracking-tight" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>Past Bookings</h2>
                <span className="text-sm font-bold bg-gray-200 text-black px-2 py-0.5 rounded-md ml-auto border border-black/50">{pastBookings.length}</span>
              </div>

              {pastBookings.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-black/20 rounded-[24px] p-8 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-wide">No past bookings</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6 opacity-80 hover:opacity-100 transition-opacity">
                  {pastBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCheckIn={handleCheckIn}
                      onCheckOut={handleCheckOut}
                      onCancel={handleCancel}
                      onShowQR={handleShowQR}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
