import { API_CONFIG, API_ENDPOINTS } from './config';
import { auth } from '@/lib/auth';

const getAuthHeaders = () => {
    const token = auth.getToken();
    const headers = { ...API_CONFIG.HEADERS };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Get all announcements
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
        throw error;
    }
};

// Create announcement
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
        throw error;
    }
};

// Update announcement
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
        throw error;
    }
};

// Delete announcement
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
        throw error;
    }
};
