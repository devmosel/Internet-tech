import { API_CONFIG, API_ENDPOINTS } from './config';

/**
 * Get all blackouts
 */
export const getAllBlackouts = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.BLACKOUTS}`, {
            method: 'GET',
            headers: {
                ...API_CONFIG.HEADERS,
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch blackouts');
        }

        return data;
    } catch (error) {
        console.error('Error fetching blackouts:', error);
        throw error;
    }
};

/**
 * Create a new blackout
 */
export const createBlackout = async (blackoutData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.BLACKOUTS}`, {
            method: 'POST',
            headers: {
                ...API_CONFIG.HEADERS,
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(blackoutData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create blackout');
        }

        return data;
    } catch (error) {
        console.error('Error creating blackout:', error);
        throw error;
    }
};

/**
 * Update an existing blackout
 */
export const updateBlackout = async (blackoutId, blackoutData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.BLACKOUTS}/${blackoutId}`, {
            method: 'PUT',
            headers: {
                ...API_CONFIG.HEADERS,
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(blackoutData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update blackout');
        }

        return data;
    } catch (error) {
        console.error('Error updating blackout:', error);
        throw error;
    }
};

/**
 * Delete a blackout
 */
export const deleteBlackout = async (blackoutId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.BLACKOUTS}/${blackoutId}`, {
            method: 'DELETE',
            headers: {
                ...API_CONFIG.HEADERS,
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete blackout');
        }

        return data;
    } catch (error) {
        console.error('Error deleting blackout:', error);
        throw error;
    }
};
