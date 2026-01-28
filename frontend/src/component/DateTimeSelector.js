'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import CustomCalendar from './CustomCalendar';
import { TIME_SLOTS } from '@/constants/booking';
import ButtonV1 from './ButtonV1';

export default function DateTimeSelector({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onSearch,
  loading,
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border-[3px] border-black rounded-[32px] p-8 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-visible z-50">

      <div className="relative">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-black tracking-tight mb-2 uppercase" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
            Select Date & Time
          </h3>
          <p className="text-sm font-bold text-gray-500">
            Choose when you need a workspace to see availability
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Date and Time Inputs Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Input */}
            <div className="flex flex-col gap-2 relative" ref={calendarRef}>
              <label className="text-sm font-bold text-black uppercase tracking-wide">
                Date
              </label>

              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3.5 text-sm font-bold text-black text-left flex items-center justify-between focus:outline-none transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>{formatDateDisplay(selectedDate)}</span>
                <CalendarIcon size={20} strokeWidth={2.5} className="text-black" />
              </button>

              {showCalendar && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-[100]">
                  <CustomCalendar
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                      onDateChange(date);
                      setShowCalendar(false);
                    }}
                    onClose={() => setShowCalendar(false)}
                  />
                </div>
              )}
            </div>

            {/* Start Time Select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-black uppercase tracking-wide">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3.5 text-sm font-bold text-black focus:outline-none transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] appearance-none bg-no-repeat bg-right pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.25rem 1.25rem'
                }}
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* End Time Select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-black uppercase tracking-wide">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-xl px-4 py-3.5 text-sm font-bold text-black focus:outline-none transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] appearance-none bg-no-repeat bg-right pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.25rem 1.25rem'
                }}
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end">
            <button
              onClick={onSearch}
              disabled={loading}
              className="px-8 py-3.5 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search Availability</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
