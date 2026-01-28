'use client';

import { useEffect } from 'react';

/**
 * Toast Component
 * Displays success/error notifications in bottom-right corner
 * 
 * @param {boolean} show - Whether to show the toast
 * @param {string} title - Toast title (e.g., "Booking confirmed!")
 * @param {string} message - Toast message (e.g., "Conference A has been booked successfully.")
 * @param {string} type - Toast type: 'success' or 'error' (default: 'success')
 * @param {function} onClose - Callback when toast auto-closes
 * @param {number} duration - Auto-close duration in ms (default: 3000)
 */
export default function Toast({ 
  show, 
  title, 
  message, 
  type = 'success',
  onClose, 
  duration = 3000 
}) {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  if (!show) return null;

  // Icon based on type
  const icon = type === 'success' 
    ? '/assets/55e415a215f3ac2873bfb3705018cf983f9a40b0.svg'
    : '/assets/error-icon.svg';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slideIn">
      <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[8px] shadow-lg min-w-[330px] p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-0.5">
            <img 
              src={icon}
              alt={type === 'success' ? 'Success' : 'Error'} 
              className="w-5 h-5"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-0.5 flex-1">
            {/* Title */}
            <p className="font-medium text-[13px] leading-[19.5px] tracking-[-0.0762px] text-neutral-950">
              {title}
            </p>
            
            {/* Message */}
            <p className="font-normal text-[13px] leading-[18.2px] tracking-[-0.0762px] text-[#717182]">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
