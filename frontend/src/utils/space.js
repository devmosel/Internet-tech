// Space data helpers

import { SPACE_TYPES } from '@/constants/booking';
import { getOrdinalSuffix } from './date';

// Map API type to display config
export const getSpaceTypeConfig = (apiType) => {
  const typeMap = {
    hot_desk: SPACE_TYPES.HOT_DESK,
    private_room: SPACE_TYPES.PRIVATE_ROOM,
    meeting_room: SPACE_TYPES.MEETING_ROOM,
  };
  
  return typeMap[apiType] || SPACE_TYPES.DEFAULT;
};

// Extract floor number from location string
export const extractFloorFromLocation = (location) => {
  if (!location) return null;
  
  const floorMatch = location.match(/\d+/);
  if (!floorMatch) return location;
  
  const floorNum = floorMatch[0];
  return `${floorNum}${getOrdinalSuffix(floorNum)}`;
};

// Get unique floors, sorted
export const getUniqueFloors = (spaces) => {
  const floors = spaces
    .map(space => space.floor)
    .filter(Boolean);
  
  const uniqueFloors = [...new Set(floors)];
  
  return uniqueFloors.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || 0);
    const numB = parseInt(b.match(/\d+/)?.[0] || 0);
    return numA - numB;
  });
};

// Transform API space data to UI format
export const transformSpaceData = (space) => {
  const typeConfig = getSpaceTypeConfig(space.type);
  const floor = extractFloorFromLocation(space.location);
  
  // Get opening hours from first available day
  const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  let opening_hours = '09:00-18:00';
  
  if (space.opening_hours) {
    for (const day of daysOrder) {
      if (space.opening_hours[day]) {
        const hours = space.opening_hours[day];
        opening_hours = `${hours.start}-${hours.end}`;
        break;
      }
    }
  }
  
  // Handle amenities (array of strings or objects)
  let amenities = [];
  if (Array.isArray(space.amenities)) {
    amenities = space.amenities.map(a => {
      if (typeof a === 'object' && a !== null && a.name) {
        return a.name;
      }
      return String(a);
    });
  }
  
  const transformed = {
    id: space.id,
    name: space.name,
    type: typeConfig.displayName,
    rawType: space.type,
    typeColor: typeConfig.color,
    bgColor: typeConfig.bgColor,
    icon: typeConfig.icon,
    capacity: space.capacity,
    badgeColor: typeConfig.badgeColor,
    badgeTextColor: typeConfig.badgeTextColor,
    opening_hours, // Now correctly mapped
    max_duration: space.max_duration, // Add max_duration
    amenities,
    buttonColor: typeConfig.buttonColor,
    borderColor: typeConfig.borderColor,
    floor,
    location: space.location,
    status: space.status,
    is_available: space.is_available, // Preserve is_available from API
    unavailable_reason: space.unavailable_reason, // Preserve unavailable_reason from API
  };
  
  return transformed;
};

/**
 * Filter spaces by floor and type
 * @param {Array} spaces - Array of space objects
 * @param {string} selectedFloor - Selected floor filter
 * @param {string} selectedType - Selected type filter
 * @returns {Array} Filtered spaces
 */
export const filterSpaces = (spaces, selectedFloor, selectedType) => {
  return spaces.filter(space => {
    const floorMatch = selectedFloor === 'all' || space.floor === selectedFloor;
    
    const typeMatch = selectedType === 'all' || 
      (selectedType === 'hot-desk' && space.type === 'Hot Desk') ||
      (selectedType === 'private' && space.type === 'Private Room') ||
      (selectedType === 'meeting' && space.type === 'Meeting Room');
    
    return floorMatch && typeMatch;
  });
};
