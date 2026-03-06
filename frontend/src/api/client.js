import axios from 'axios';
import { API_BASE_URL } from '../config.js';

/**
 * Shared Axios API client with centralized configuration.
 * All components should use this instead of raw axios calls.
 *
 * Features:
 * - Base URL from environment config
 * - Auto-attaches JWT token to every request
 * - Auto-logout on 401/403 responses (expired/invalid token)
 */
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

// Request interceptor: auto-attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle auth failures globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Token invalid or expired — only auto-logout if we had a token
            const hadToken = localStorage.getItem('token');
            if (hadToken) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?expired=1';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
