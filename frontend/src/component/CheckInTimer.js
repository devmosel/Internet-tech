/**
 * CheckInTimer Component
 * Shows active check-in status with elapsed time
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';

export default function CheckInTimer({ booking }) {
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    if (!booking?.checkin_at) return;

    const updateElapsedTime = () => {
      // Parse the checkin time - try to handle timezone properly
      let checkinTime;
      
      // If the string doesn't include timezone info, treat it as UTC
      if (typeof booking.checkin_at === 'string' && !booking.checkin_at.includes('Z') && !booking.checkin_at.includes('+')) {
        // Append 'Z' to treat as UTC
        checkinTime = new Date(booking.checkin_at + 'Z');
      } else {
        checkinTime = new Date(booking.checkin_at);
      }
      
      const now = new Date();
      
      // Calculate difference in total seconds
      const diffSeconds = Math.max(0, Math.floor((now.getTime() - checkinTime.getTime()) / 1000));
      
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;
      
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(minutes).padStart(2, '0');
      const secondsStr = String(seconds).padStart(2, '0');
      
      setElapsedTime(`${hoursStr}:${minutesStr}:${secondsStr}`);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [booking?.checkin_at]);

  if (!booking) return null;

  return (
    <div className="bg-[#E0F2FE] border-[3px] border-black rounded-xl px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-3">
        {/* Pulsing indicator */}
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-black animate-pulse"></div>
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-500 animate-ping opacity-75"></div>
        </div>

        {/* Timer and space info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-black/60 uppercase tracking-wider">
              Checked In
            </span>
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-black" strokeWidth={2.5} />
              <span className="text-xs font-bold text-black">
                {booking.space_name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            <Clock size={14} className="text-black" strokeWidth={2.5} />
            <span className="text-lg font-black text-black font-mono tracking-wider leading-none">
              {elapsedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
