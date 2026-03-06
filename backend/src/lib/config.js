/**
 * Shared application configuration constants.
 * Sourced from environment variables to avoid hardcoding in route files.
 */

// Authorized admin emails — only these accounts can hold the ADMIN role.
// Set via ADMIN_EMAILS env var as a comma-separated list.
export const STRICT_ADMINS = (process.env.ADMIN_EMAILS || 'quantumgroupph@gmail.com,perezdenmars@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

export const JWT_EXPIRY = '1d';
