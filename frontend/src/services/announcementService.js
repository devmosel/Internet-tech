import { API_CONFIG, API_ENDPOINTS } from './config';
import { auth } from '@/lib/auth';

/**
 * Get headers with authentication token
 * @returns {Object} Headers object with auth token if available
 */
const getAuthHeaders = () => {
    const token = auth.getToken();
    const headers = { ...API_CONFIG.HEADERS };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

/**
 * Fetch all announcements
 * @returns {Promise<Object>} Response containing announcements list
 */
export const getAnnouncements = async () => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ANNOUNCEMENTS}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch announcements');
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch announcements error:', error);
        throw error;
    }
};

/**
 * Create a new announcement
 * @param {Object} announcementData - Announcement data (title, description, department_id)
 * @returns {Promise<Object>} Response containing created announcement
 */
export const createAnnouncement = async (announcementData) => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ANNOUNCEMENTS}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(announcementData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create announcement');
        }

        return await response.json();
    } catch (error) {
        console.error('Create announcement error:', error);
        throw error;
    }
};

/**
 * Update an existing announcement
 * @param {number} id - Announcement ID
 * @param {Object} announcementData - Updated announcement data
 * @returns {Promise<Object>} Response containing updated announcement
 */
export const updateAnnouncement = async (id, announcementData) => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ANNOUNCEMENTS}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(announcementData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update announcement');
        }

        return await response.json();
    } catch (error) {
        console.error('Update announcement error:', error);
        throw error;
    }
};

/**
 * Delete an announcement
 * @param {number} id - Announcement ID
 * @returns {Promise<Object>} Response containing deletion confirmation
 */
export const deleteAnnouncement = async (id) => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ANNOUNCEMENTS}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete announcement');
        }

        return await response.json();
    } catch (error) {
        console.error('Delete announcement error:', error);
        throw error;
    }
};
