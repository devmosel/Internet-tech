/**
 * Booking Page
 * Content only - Sidebar and NotificationPanel from layout
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import BookingModal from '@/component/BookingModal';
import DateTimeSelector from '@/component/DateTimeSelector';
import FilterBar from '@/component/FilterBar';
import SpacesGrid from '@/component/SpacesGrid';
import FloorPlan from '@/component/floor-plan/FloorPlan';
import LevelTabs from '@/component/floor-plan/LevelTabs';
import { useBookingSearch } from '@/hooks/useBookingSearch';
import { getUniqueFloors, filterSpaces } from '@/utils/space';
import DefaultMsg from '@/component/DefaultMsg';

export default function BookingPage() {
  // UI State
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('floorplan'); // 'grid' or 'floorplan'
  const [selectedDeskId, setSelectedDeskId] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('lantai1'); // For floor plan view

  // Set default date to today on mount
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    setSelectedDate(formattedDate);
  }, []);

  // Custom hooks for data management
  const { spaces, loading, error, hasSearched, searchSpaces } = useBookingSearch();

  // Debug: Track when spaces change
  useEffect(() => {
    console.log('📊 Booking Page: Spaces updated, count:', spaces.length);
    if (spaces.length > 0) {
      console.log('📊 First space:', spaces[0].name, '| is_available:', spaces[0].is_available);
      const occupied = spaces.filter(s => s.is_available === false);
      console.log('📊 Occupied spaces:', occupied.map(s => s.name));
    }
  }, [spaces]);

  // Derived state
  const availableFloors = getUniqueFloors(spaces);
  const filteredSpaces = filterSpaces(spaces, selectedFloor, selectedType);

  // Filter spaces for Lantai 1
  const floor1HotDesks = spaces.filter(space => {
    const isFloor1 = space.location?.includes('Lantai 1') || space.floor === '1st';
    const isHotDesk = space.rawType === 'hot_desk' || space.type === 'Hot Desk';
    return isFloor1 && isHotDesk;
  });

  const floor1MeetingRooms = spaces.filter(space => {
    const isFloor1 = space.location?.includes('Lantai 1') || space.floor === '1st';
    const isMeetingRoom = space.rawType === 'meeting_room' || space.type === 'Meeting Room';
    return isFloor1 && isMeetingRoom;
  });

  const floor1PrivateRooms = spaces.filter(space => {
    const isFloor1 = space.location?.includes('Lantai 1') || space.floor === '1st';
    const isPrivateRoom = space.rawType === 'private_room' || space.type === 'Private Room';
    return isFloor1 && isPrivateRoom;
  });

  // Filter spaces for Lantai 2
  const floor2HotDesks = spaces.filter(space => {
    const isFloor2 = space.location?.includes('Lantai 2') || space.floor === '2nd';
    const isHotDesk = space.rawType === 'hot_desk' || space.type === 'Hot Desk';
    return isFloor2 && isHotDesk;
  });

  const floor2MeetingRooms = spaces.filter(space => {
    const isFloor2 = space.location?.includes('Lantai 2') || space.floor === '2nd';
    const isMeetingRoom = space.rawType === 'meeting_room' || space.type === 'Meeting Room';
    return isFloor2 && isMeetingRoom;
  });

  // Filter spaces for Lantai 3
  const floor3MeetingRooms = spaces.filter(space => {
    const isFloor3 = space.location?.includes('Lantai 3') || space.floor === '3rd';
    const isMeetingRoom = space.rawType === 'meeting_room' || space.type === 'Meeting Room';
    return isFloor3 && isMeetingRoom;
  });

  const floor3PrivateRooms = spaces.filter(space => {
    const isFloor3 = space.location?.includes('Lantai 3') || space.floor === '3rd';
    const isPrivateRoom = space.rawType === 'private_room' || space.type === 'Private Room';
    return isFloor3 && isPrivateRoom;
  });

  // Map API spaces to SVG element IDs using useMemo to track changes
  // Lantai 1: hotDesk01-12 (12 desks)
  // Lantai 2: hotDesk13-20 (8 desks) - continuing numbering from Lantai 1
  // Lantai 1: meetingRoom01-03
  // Lantai 2: meetingRoom04-06 - continuing numbering from Lantai 1
  const { deskSpaceMap, occupiedDesks } = useMemo(() => {
    const deskSpaceMap = {};
    const occupiedDesks = [];

  // Map Lantai 1 hot desks (hotDesk01-12)
  floor1HotDesks.forEach((space, index) => {
    const deskId = `hotDesk${String(index + 1).padStart(2, '0')}`;
    deskSpaceMap[deskId] = space;

    const isNotAvailable = space.is_available === false;
    if (isNotAvailable) {
      occupiedDesks.push(deskId);
    }
  });

  // Map Lantai 2 hot desks (hotDesk13-20) - start from 13
  floor2HotDesks.forEach((space, index) => {
    const deskId = `hotDesk${String(13 + index).padStart(2, '0')}`;
    deskSpaceMap[deskId] = space;

    const isNotAvailable = space.is_available === false;
    if (isNotAvailable) {
      occupiedDesks.push(deskId);
    }
  });

  // Map Lantai 1 meeting rooms (meetingRoom01-03)
  floor1MeetingRooms.forEach((space, index) => {
    const roomId = `meetingRoom${String(index + 1).padStart(2, '0')}`;
    deskSpaceMap[roomId] = space;

    const isNotAvailable = space.is_available === false;
    if (isNotAvailable) {
      occupiedDesks.push(roomId);
    }
  });

  // Map Lantai 2 meeting rooms (meetingRoom04-06) - start from 04
  floor2MeetingRooms.forEach((space, index) => {
    const roomId = `meetingRoom${String(4 + index).padStart(2, '0')}`;
    deskSpaceMap[roomId] = space;

    const isNotAvailable = space.is_available === false;
    if (isNotAvailable) {
      occupiedDesks.push(roomId);
    }
  });

  // Map Lantai 1 private rooms (privateRoom01-02)
  floor1PrivateRooms.forEach((space, index) => {
    const roomId = `privateRoom${String(index + 1).padStart(2, '0')}`;
    deskSpaceMap[roomId] = space;

    const isNotAvailable = space.is_available === false;
    if (isNotAvailable) {
      occupiedDesks.push(roomId);
    }
  });

  // Map Lantai 3 meeting rooms (meetingRoom07-08) - start from 07
  floor3MeetingRooms.forEach((space, index) => {
    const roomId = `meetingRoom${String(7 + index).padStart(2, '0')}`;
    deskSpaceMap[roomId] = space;

    const isNotAvailable = space.is_available === false;
    if (isNotAvailable) {
      occupiedDesks.push(roomId);
    }
  });

  // Map Lantai 3 private rooms (privateRoom03-08) - start from 03
  floor3PrivateRooms.forEach((space, index) => {
    const roomId = `privateRoom${String(3 + index).padStart(2, '0')}`;
    deskSpaceMap[roomId] = space;

    const isNotAvailable = space.is_available === false;
    if (isNotAvailable) {
      occupiedDesks.push(roomId);
    }
  });

    // Debug log to verify mapping
    console.log('Floor Spaces Mapping:', {
      lantai1: {
        totalHotDesks: floor1HotDesks.length,
        totalMeetingRooms: floor1MeetingRooms.length,
        totalPrivateRooms: floor1PrivateRooms.length,
      },
      lantai2: {
        totalHotDesks: floor2HotDesks.length,
        totalMeetingRooms: floor2MeetingRooms.length,
      },
      lantai3: {
        totalMeetingRooms: floor3MeetingRooms.length,
        totalPrivateRooms: floor3PrivateRooms.length,
      },
      deskSpaceMap: Object.keys(deskSpaceMap),
      occupiedDesks,
      availableSpaces: Object.keys(deskSpaceMap).filter(id => !occupiedDesks.includes(id))
    });

    return { deskSpaceMap, occupiedDesks };
  }, [spaces, floor1HotDesks, floor1MeetingRooms, floor1PrivateRooms, floor2HotDesks, floor2MeetingRooms, floor3MeetingRooms, floor3PrivateRooms]);

  // Calculate available spaces per floor
  const lantai1Spaces = Object.keys(deskSpaceMap).filter(id => {
    const metadata = id.match(/^(hotDesk|meetingRoom|privateRoom)(\d+)$/);
    if (!metadata) return false;
    const num = parseInt(metadata[2]);
    if (id.startsWith('hotDesk')) return num >= 1 && num <= 12;
    if (id.startsWith('meetingRoom')) return num >= 1 && num <= 3;
    if (id.startsWith('privateRoom')) return num >= 1 && num <= 2;
    return false;
  });

  const lantai2Spaces = Object.keys(deskSpaceMap).filter(id => {
    const metadata = id.match(/^(hotDesk|meetingRoom)(\d+)$/);
    if (!metadata) return false;
    const num = parseInt(metadata[2]);
    if (id.startsWith('hotDesk')) return num >= 13 && num <= 20;
    if (id.startsWith('meetingRoom')) return num >= 4 && num <= 6;
    return false;
  });

  const lantai3Spaces = Object.keys(deskSpaceMap).filter(id => {
    const metadata = id.match(/^(meetingRoom|privateRoom)(\d+)$/);
    if (!metadata) return false;
    const num = parseInt(metadata[2]);
    if (id.startsWith('meetingRoom')) return num >= 7 && num <= 8;
    if (id.startsWith('privateRoom')) return num >= 3 && num <= 8;
    return false;
  });

  const availableSpacesLantai1 = lantai1Spaces.filter(id => !occupiedDesks.includes(id)).length;
  const availableSpacesLantai2 = lantai2Spaces.filter(id => !occupiedDesks.includes(id)).length;
  const availableSpacesLantai3 = lantai3Spaces.filter(id => !occupiedDesks.includes(id)).length;

  // Event handlers
  const handleSearch = () => {
    searchSpaces(selectedDate, startTime, endTime);
  };

  const handleBookSpace = (space) => {
    setSelectedSpace(space);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSpace(null);
    setSelectedDeskId(null);
  };

  const handleDeskSelect = (desk) => {
    setSelectedDeskId(desk.id);

    // Get the space data from API based on desk ID
    const deskSpace = deskSpaceMap[desk.id];

    if (deskSpace) {
      // Use the actual space data from API, including unavailable_reason
      handleBookSpace(deskSpace);
    } else {
      // Fallback if space not found in API data (shouldn't happen if API is correct)
      const isMeetingRoom = desk.type === 'meetingRoom';
      const isPrivateRoom = desk.type === 'privateRoom';

      let fallbackName, fallbackType, fallbackCapacity, fallbackAmenities;

      if (isMeetingRoom) {
        fallbackName = `Meeting Room ${desk.number}`;
        fallbackType = 'Meeting Room';
        fallbackCapacity = 8;
        fallbackAmenities = ['Whiteboard', 'Projector', 'Conference Phone', 'WiFi'];
      } else if (isPrivateRoom) {
        fallbackName = `Private Room ${desk.number}`;
        fallbackType = 'Private Room';
        fallbackCapacity = 4;
        fallbackAmenities = ['Whiteboard', 'Monitor', 'Privacy Door', 'WiFi'];
      } else {
        fallbackName = `Hot Desk ${desk.number}`;
        fallbackType = 'Hot Desk';
        fallbackCapacity = 1;
        fallbackAmenities = ['Monitor', 'Desk Lamp', 'Ergonomic Chair'];
      }

      const fallbackSpace = {
        id: desk.id,
        name: desk.name || fallbackName,
        type: fallbackType,
        floor: '1st',
        capacity: fallbackCapacity,
        amenities: fallbackAmenities,
        opening_hours: '09:00-18:00',
        max_duration: 480,
        status: 'available',
        is_available: true
      };
      handleBookSpace(fallbackSpace);
    }
  };

  return (
    <div className="min-h-full px-4 sm:px-6 md:px-8 py-8 md:py-10 bg-[#FFFEF8]" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-gray-500 font-medium mb-1 pl-1">
              Find your perfect spot
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
              BOOK A <span className="text-gray-400">SPACE</span>
            </h1>
          </div>
        </div>

        {/* Date and Time Selector */}
        <DateTimeSelector
          selectedDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          onDateChange={setSelectedDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* View Mode Toggle */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-h-[44px] flex items-center">
            {viewMode === 'grid' && (
              <FilterBar
                selectedFloor={selectedFloor}
                selectedType={selectedType}
                availableFloors={availableFloors}
                onFloorChange={setSelectedFloor}
                onTypeChange={setSelectedType}
              />
            )}

          </div>

          <div className="flex items-center gap-2 bg-white border-[3px] border-black rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all border-2 ${viewMode === 'grid'
                ? 'bg-black text-white border-black ring-0'
                : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
                Grid View
              </div>
            </button>
            <button
              onClick={() => setViewMode('floorplan')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all border-2 ${viewMode === 'floorplan'
                ? 'bg-black text-white border-black ring-0'
                : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M1 5h14M5 1v14" stroke="currentColor" strokeWidth="2" />
                </svg>
                Floor Plan
              </div>
            </button>
          </div>
        </div>

        {/* Conditional rendering based on view mode */}
        {viewMode === 'floorplan' ? (
          hasSearched ? (
            <div className="bg-[#FFFEF8] rounded-[24px] overflow-hidden relative pl-36 z-10">
              <FloorPlan
                occupiedDesks={occupiedDesks}
                onDeskSelect={handleDeskSelect}
                selectedDeskId={selectedDeskId}
                selectedDate={selectedDate}
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
              />
              <div className="absolute left-0 top-0 bottom-0 z-20 h-full">
                <LevelTabs
                  selectedLevel={selectedLevel}
                  onSelectLevel={setSelectedLevel}
                  availability={{
                    lantai1: availableSpacesLantai1,
                    lantai2: availableSpacesLantai2,
                    lantai3: availableSpacesLantai3
                  }}
                />
              </div>
            </div>
          ) : (
            <DefaultMsg />
          )
        ) : (
          <div className="overflow-visible pb-4 relative z-10">
            <SpacesGrid
              spaces={spaces}
              filteredSpaces={filteredSpaces}
              loading={loading}
              error={error}
              hasSearched={hasSearched}
              selectedDate={selectedDate}
              onBookSpace={handleBookSpace}
            />
          </div>
        )}

        {/* Booking Modal */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          space={selectedSpace}
          bookingDetails={{
            date: selectedDate,
            startTime: startTime,
            endTime: endTime
          }}
        />
      </div>
    </div>
  );
}
