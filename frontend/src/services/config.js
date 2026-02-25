/**
 * API Configuration
 * Centralized API base URL and common configurations
 * https://backend-openbo.devmosel.com/
 * http://192.168.1.101:5000/
 * http://localhost:5001/
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:5001',
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',

  // Spaces
  SPACES: '/api/spaces',
  SPACE_BY_ID: (id) => `/api/spaces/${id}`,
  MANAGE_SPACES: '/api/spaces/manage',

  // Bookings
  BOOKINGS: '/api/bookings',
  BOOKING_BY_ID: (id) => `/api/bookings/${id}`,
  MANAGE_BOOKINGS: '/api/bookings/manage',
  USER_BOOKINGS: '/api/bookings/user',
  USER_BOOKINGS_BY_ID: (userId) => `/api/bookings/user/${userId}`,

  // User
  USER_PROFILE: '/api/user/profile',
  UPDATE_PROFILE: '/api/user/profile',
  USERS: '/api/users',
  TEAM_USERS: '/api/users/department/my-team',
  TEAM_USER_BY_ID: (id) => `/api/users/department/my-team/${id}`,

  // Departments
  DEPARTMENTS: '/api/departments',

  // Floors
  FLOORS: '/api/floors',

  // Amenities
  AMENITIES: '/api/amenities',

  // Blackouts
  BLACKOUTS: '/api/blackouts',

  // Stats
  STATS: '/api/stats',

  // Announcements
  ANNOUNCEMENTS: '/api/announcements',

  // Assignments
  ASSIGNMENTS: '/api/assignments',
  ASSIGNMENT_BY_ID: (id) => `/api/assignments/${id}`,

  // Tasks
  TASKS_BY_ASSIGNMENT: (assignmentId) => `/api/tasks/assignment/${assignmentId}`,
  POST_TASK_TO_ASSIGNMENT: (assignmentId) => `/api/tasks/assignment/${assignmentId}`,
  UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`,
  DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,
};
