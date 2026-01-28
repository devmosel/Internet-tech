'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCurrentUser, useCreateBooking } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { useSpacesWebSocket } from '@/contexts/SpacesWebSocketContext';
import { hapticClick } from '@/utils/animations';
import {
  X,
  Calendar,
  Clock,
  Users,
  Info,
  AlertCircle,
  CheckCircle2,
  Armchair,
  DoorOpen,
  Wifi,
  Monitor,
  Plug,
  Presentation,
  Video,
  Timer
} from 'lucide-react';

export default function BookingModal({ isOpen, onClose, space, bookingDetails }) {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { showToastMessage } = useToast();
  const { mutate: createBooking, isPending: isSubmitting } = useCreateBooking();
  const { isConnected, subscribe } = useSpacesWebSocket();

  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isNowUnavailable, setIsNowUnavailable] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState('');
  
  // Track user's own booking to ignore WebSocket event for it
  const lastBookingRef = useRef(null);

  // Map amenities to Lucide icons
  const getAmenityIcon = (amenityName) => {
    const iconMap = {
      'Wi-Fi': Wifi,
      'Monitor': Monitor,
      'Power Outlet': Plug,
      'Standing Desk': Armchair,
      'Whiteboard': Presentation,
      'Projector': Presentation,
      'Video Conference': Video,
    };
    return iconMap[amenityName] || CheckCircle2;
  };

  // Get icon and color scheme based on space type
  const getTypeConfig = () => {
    if (!space) return {};

    if (space.type === 'Hot Desk') {
      return {
        icon: Armchair,
        iconBg: 'bg-blue-600',
        textAccent: 'text-blue-600',
        bgAccent: 'bg-blue-50',
      };
    }
    if (space.type === 'Private Room') {
      return {
        icon: DoorOpen,
        iconBg: 'bg-purple-600',
        textAccent: 'text-purple-600',
        bgAccent: 'bg-purple-50',
      };
    }
    // Meeting Room
    return {
      icon: Users,
      iconBg: 'bg-orange-600',
      textAccent: 'text-orange-600',
      bgAccent: 'bg-orange-50',
    };
  };

  const typeConfig = getTypeConfig();
  const TypeIcon = typeConfig.icon || Users;

  // Reset unavailable state when modal opens with new space
  useEffect(() => {
    if (isOpen && space) {
      setIsNowUnavailable(false);
      setUnavailableMessage('');
    }
  }, [isOpen, space?.id]);

  // Subscribe to WebSocket to detect real-time availability changes
  useEffect(() => {
    if (!isOpen || !space || !isConnected || !subscribe) return;

    console.log('🔔 BookingModal: Subscribing to availability changes for space', space.id);

    const unsubscribe = subscribe('availability_changed', (data) => {
      console.log('📅 BookingModal: Received availability_changed', data);
      console.log('📅 BookingModal: Current lastBookingRef:', lastBookingRef.current);
      
      // Skip if this matches the booking the user just made
      if (lastBookingRef.current) {
        const { space_id, date, start_time, end_time } = lastBookingRef.current;
        const matchesOwnBooking = 
          data.space_id === space_id &&
          data.date === date &&
          data.affected_time_range?.start === start_time &&
          data.affected_time_range?.end === end_time;
        
        console.log('🔍 BookingModal: Comparison details:', {
          'data.space_id': data.space_id,
          'stored space_id': space_id,
          'data.date': data.date,
          'stored date': date,
          'data.start': data.affected_time_range?.start,
          'stored start': start_time,
          'data.end': data.affected_time_range?.end,
          'stored end': end_time,
          'matches': matchesOwnBooking
        });
        
        if (matchesOwnBooking) {
          console.log('✅ BookingModal: Ignoring own booking event');
          return;
        }
      }
      
      // Check if this event affects the currently viewed space
      if (data.space_id === space.id) {
        // Check if the booking overlaps with our selected time
        const eventStart = data.affected_time_range?.start;
        const eventEnd = data.affected_time_range?.end;
        const ourStart = bookingDetails?.startTime;
        const ourEnd = bookingDetails?.endTime;
        const eventDate = data.date;
        const ourDate = bookingDetails?.date;

        // Check if dates match and times overlap
        if (eventDate === ourDate) {
          // Simple overlap check
          const hasOverlap = !(ourEnd <= eventStart || ourStart >= eventEnd);
          
          if (hasOverlap) {
            console.log('⚠️ BookingModal: Space just became unavailable for our time slot!');
            setIsNowUnavailable(true);
            setUnavailableMessage(`This space was just booked by another user for ${eventStart} - ${eventEnd}`);
            
            // Show toast notification
            showToastMessage({
              type: 'warning',
              title: 'Space Just Booked',
              message: `${space.name} was just booked by another user for your selected time.`,
              duration: 5000
            });
          }
        }
      }
    });

    return () => {
      console.log('🔔 BookingModal: Unsubscribing from availability changes');
      unsubscribe();
    };
  }, [isOpen, space?.id, isConnected, subscribe, bookingDetails, showToastMessage, currentUser?.id]);

  // Animate modal entrance
  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      // Reset closing state
      setIsClosing(false);

      // Set initial state
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { scale: 0.95, opacity: 0, y: 10 });

      // Animate in
      const tl = gsap.timeline();
      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.25,
        ease: 'power1.out'
      })
        .to(modalRef.current, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out'
        }, '-=0.15');
    }
  }, [isOpen]);

  if (!isOpen || !space) return null;

  // Check if space is unavailable (either from initial load OR from real-time update)
  const isUnavailable = space.is_available === false || isNowUnavailable;

  /**
   * Reset all states when modal closes
   */
  const handleClose = () => {
    if (isClosing) return; // Prevent multiple close animations

    setIsClosing(true);

    // Animate out
    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
        setIsClosing(false);
      }
    });

    tl.to(modalRef.current, {
      scale: 0.95,
      opacity: 0,
      y: 10,
      duration: 0.25,
      ease: 'power1.in'
    })
      .to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power1.in'
      }, '-=0.15');
  };

  /**
   * Format datetime to "YYYY-MM-DD HH:MM:SS"
   */
  const formatDateTime = (date, time) => {
    return `${date} ${time}:00`;
  };

  const handleConfirmBooking = async () => {
    if (!currentUser?.id) {
      showToastMessage({
        type: 'error',
        title: 'Authentication required',
        message: 'You must be logged in to make a booking',
        duration: 5000
      });
      return;
    }

    // Track this booking BEFORE making the API call
    // This ensures we ignore the WebSocket event that arrives immediately
    lastBookingRef.current = {
      space_id: space.id,
      date: bookingDetails.date,
      start_time: bookingDetails.startTime,
      end_time: bookingDetails.endTime
    };
    
    console.log('🎯 BookingModal: Tracking own booking to ignore WebSocket event:', lastBookingRef.current);
    
    // Clear the tracking after 3 seconds
    setTimeout(() => {
      console.log('🧹 BookingModal: Clearing own booking tracking');
      lastBookingRef.current = null;
    }, 3000);

    const bookingPayload = {
      user_id: currentUser.id,
      space_id: space.id,
      start_at: formatDateTime(bookingDetails.date, bookingDetails.startTime),
      end_at: formatDateTime(bookingDetails.date, bookingDetails.endTime),
    };

    createBooking(bookingPayload, {
      onSuccess: (response) => {
        
        showToastMessage({
          type: 'success',
          title: 'Booking confirmed!',
          message: response.message || `${space.name} has been booked successfully.`,
          duration: 5000
        });

        // Success animation: smooth pulse effect
        if (modalRef.current) {
          gsap.to(modalRef.current, {
            scale: 1.03,
            duration: 0.3,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              handleClose();
            }
          });
        }
      },
      onError: (err) => {
        showToastMessage({
          type: 'error',
          title: 'Booking failed',
          message: err.message || 'Failed to create booking. Please try again.',
          duration: 5000
        });
      }
    });
  };

  const handleConfirmClick = () => {
    hapticClick(confirmButtonRef.current, handleConfirmBooking);
  };

  const handleCancelClick = () => {
    hapticClick(cancelButtonRef.current, handleClose);
  };

  const handleCloseClick = () => {
    hapticClick(closeButtonRef.current, handleClose);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white border-[3px] border-black rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className={`p-6 border-b-[3px] border-black flex items-center justify-between sticky top-0 z-10 ${isNowUnavailable ? 'bg-red-600' : 'bg-black'}`}>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
              {isNowUnavailable ? 'Just Booked!' : isUnavailable ? 'Space Unavailable' : 'Confirm Booking'}
            </h2>
            <p className="text-sm font-bold text-white/70 mt-1 uppercase tracking-wide">
              {isNowUnavailable ? 'Someone just booked this space' : isUnavailable ? 'Cannot be booked now' : 'Review details below'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-lg bg-white border-2 border-black flex items-center justify-center hover:bg-gray-200 transition-colors active:translate-y-px"
          >
            <X size={20} className="text-black" strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[#FFFEF8]">
          {/* Space Info Card */}
          <div className="flex items-start gap-4 p-4 bg-white border-2 border-black rounded-xl mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className={`w-14 h-14 rounded-xl ${typeConfig.iconBg} border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
              <TypeIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-black text-xl uppercase tracking-wide">
                {space.name}
              </h3>
              <p className={`text-sm font-bold uppercase tracking-wider ${typeConfig.textAccent}`}>
                {space.type}
              </p>
            </div>
            <div className="px-3 py-1 bg-black text-white rounded-lg border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
              <Users size={14} className="text-white" strokeWidth={3} />
              <span className="text-xs font-black">{space.capacity}</span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 mb-8">
            <h4 className="text-xs font-black text-black uppercase tracking-widest border-b-2 border-black inline-block pb-1">
              Date & Time
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border-2 border-black rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
                  <Calendar size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date</p>
                  <p className="text-sm font-black text-black">{bookingDetails.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border-2 border-black rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Time</p>
                  <p className="text-sm font-black text-black">
                    {bookingDetails.startTime} - {bookingDetails.endTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isUnavailable ? (
            /* Unavailable Reason */
            <div className={`border-2 border-black rounded-xl p-4 flex gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isNowUnavailable ? 'bg-red-100' : 'bg-red-50'}`}>
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div>
                <h4 className="font-black text-black text-sm mb-1 uppercase tracking-wide">
                  {isNowUnavailable ? '⚡ Just Booked By Another User!' : 'Booking Conflict'}
                </h4>
                <p className="text-sm text-black font-medium leading-relaxed">
                  {isNowUnavailable ? (
                    <span className="text-red-700 font-bold">{unavailableMessage}</span>
                  ) : space.unavailable_reason ? (
                    <span dangerouslySetInnerHTML={{
                      __html: space.unavailable_reason
                        .replace(/(\w+)(?=\s+mulai)/gi, '<strong>$1</strong>')
                        .replace(/(\d{2}:\d{2})/g, '<strong>$1</strong>')
                    }} />
                  ) : (
                    'This space is currently unavailable for the selected time slot.'
                  )}
                </p>
                {isNowUnavailable && (
                  <p className="text-xs text-red-600 mt-2 font-bold">
                    Please close this modal and select another space or time slot.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Amenities */}
              {space.amenities && space.amenities.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-black text-black uppercase tracking-widest border-b-2 border-black inline-block pb-1 mb-3">
                    Included Amenities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {space.amenities.map((amenity, index) => {
                      const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                      const Icon = getAmenityIcon(amenityName);
                      return (
                        <div key={index} className="px-3 py-1.5 bg-white border-2 border-black rounded-lg flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <Icon size={14} className="text-black" strokeWidth={2.5} />
                          <span className="text-xs font-bold text-black uppercase tracking-wide">{amenityName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info Message */}
              <div className="bg-blue-50 border-2 border-black rounded-xl p-4 flex gap-3">
                <Info className="w-6 h-6 text-black flex-shrink-0" strokeWidth={2.5} />
                <p className="text-sm text-black font-bold leading-relaxed">
                  You'll receive a check-in code and instructions via notification once your booking is confirmed.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-[3px] border-black bg-white">
          <div className="flex gap-4">
            {isUnavailable ? (
              <button
                ref={closeButtonRef}
                onClick={handleCloseClick}
                className="w-full bg-black text-white border-[3px] border-black rounded-xl px-4 py-4 font-black text-sm uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  ref={cancelButtonRef}
                  onClick={handleCancelClick}
                  disabled={isSubmitting}
                  className="flex-1 bg-white border-[3px] border-black text-black rounded-xl px-4 py-4 font-black text-sm uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  ref={confirmButtonRef}
                  onClick={handleConfirmClick}
                  disabled={isSubmitting}
                  className="flex-1 bg-black border-[3px] border-black text-white rounded-xl px-4 py-4 font-black text-sm uppercase tracking-widest hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
