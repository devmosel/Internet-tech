/**
 * Booking page constants
 * Centralized configuration for booking functionality
 * https://backend-openbo.devmosel.com/api/health
 * http://192.168.1.101:5000/api/health
 * http://localhost:5001/api/health
 */

export const API_BASE_URL = 'http://localhost:5001/api/health';

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

export const SPACE_TYPES = {
  HOT_DESK: {
    apiValue: 'hot_desk',
    displayName: 'Hot Desk',
    filterValue: 'hot-desk',
    color: '#1447E6',
    bgColor: '#DBEAFE',
    icon: '/assets/e9a8acb8b17cb2cce7386825cc93d8c3562d4e74.svg',
    badgeColor: '#DBEAFE',
    badgeTextColor: '#1447E6',
    buttonColor: '#2563EB',
    borderColor: '#2B7FFF',
  },
  PRIVATE_ROOM: {
    apiValue: 'private_room',
    displayName: 'Private Room',
    filterValue: 'private',
    color: '#8200DB',
    bgColor: '#F3E8FF',
    icon: '/assets/b277a61a694aff124f107ca648d2a70df5cc1d10.svg',
    badgeColor: '#F3E8FF',
    badgeTextColor: '#8200DB',
    buttonColor: '#9333EA',
    borderColor: '#AD46FF',
  },
  MEETING_ROOM: {
    apiValue: 'meeting_room',
    displayName: 'Meeting Room',
    filterValue: 'meeting',
    color: '#CA3500',
    bgColor: '#FFEDD4',
    icon: '/assets/2f942f19516ee84dd5c5646164f23bcd8aa2a546.svg',
    badgeColor: '#FFEDD4',
    badgeTextColor: '#CA3500',
    buttonColor: '#EA580C',
    borderColor: '#FF6900',
  },
  DEFAULT: {
    apiValue: '',
    displayName: '',
    filterValue: '',
    color: '#4A5565',
    bgColor: '#F3F4F6',
    icon: '/assets/e9a8acb8b17cb2cce7386825cc93d8c3562d4e74.svg',
    badgeColor: '#F3F4F6',
    badgeTextColor: '#4A5565',
    buttonColor: '#6B7280',
    borderColor: '#D1D5DB',
  },
};

export const FILTER_OPTIONS = {
  FLOORS: {
    ALL: 'all',
  },
  TYPES: {
    ALL: 'all',
    HOT_DESK: 'hot-desk',
    PRIVATE: 'private',
    MEETING: 'meeting',
  },
};
