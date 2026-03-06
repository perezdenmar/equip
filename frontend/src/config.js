/**
 * Centralized API configuration.
 * All components should import API_BASE_URL from here instead of hardcoding localhost:5000.
 * The value is read from the VITE_API_URL environment variable (set in .env).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
