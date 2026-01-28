
'use client';

import { useState } from 'react';
import { FILTER_OPTIONS } from '@/constants/booking';

export default function FilterBar({
  selectedFloor,
  selectedType,
  availableFloors,
  onFloorChange,
  onTypeChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (type, value) => {
    if (type === 'floor') {
      onFloorChange(value);
    } else {
      onTypeChange(value);
    }
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-[3px] h-[44px] ${isOpen
          ? 'bg-black text-white border-black'
          : 'bg-white text-black border-black hover:-translate-y-0.5'
          }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M4 6h12M7 10h10M4 14h12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        FILTERS
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M6 12l4-4-4-4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Horizontal Panel */}
      {isOpen && (
        <div className="bg-white border-[3px] border-black rounded-[20px] overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Floor Filters */}
              <button
                onClick={() => handleFilterChange('floor', FILTER_OPTIONS.FLOORS.ALL)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${selectedFloor === FILTER_OPTIONS.FLOORS.ALL
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:-translate-y-0.5'
                  }`}
              >
                All Floors
              </button>

              {availableFloors.map(floor => (
                <button
                  key={floor}
                  onClick={() => handleFilterChange('floor', floor)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border-2 ${selectedFloor === floor
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:-translate-y-0.5'
                    }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                  {floor} Floor
                </button>
              ))}

              {/* Divider */}
              <div className="w-0.5 h-8 bg-black mx-2"></div>

              {/* Type Filters */}
              <button
                onClick={() => handleFilterChange('type', FILTER_OPTIONS.TYPES.ALL)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${selectedType === FILTER_OPTIONS.TYPES.ALL
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:-translate-y-0.5'
                  }`}
              >
                All Types
              </button>

              <button
                onClick={() => handleFilterChange('type', FILTER_OPTIONS.TYPES.HOT_DESK)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border-2 ${selectedType === FILTER_OPTIONS.TYPES.HOT_DESK
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:-translate-y-0.5'
                  }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Hot Desks
              </button>

              <button
                onClick={() => handleFilterChange('type', FILTER_OPTIONS.TYPES.PRIVATE)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border-2 ${selectedType === FILTER_OPTIONS.TYPES.PRIVATE
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:-translate-y-0.5'
                  }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Private Rooms
              </button>

              <button
                onClick={() => handleFilterChange('type', FILTER_OPTIONS.TYPES.MEETING)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border-2 ${selectedType === FILTER_OPTIONS.TYPES.MEETING
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:-translate-y-0.5'
                  }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Meeting Rooms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
