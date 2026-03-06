import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides auth state + helpers.
 * Components consume via useAuth() hook instead of directly reading localStorage.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    const isAuthenticated = !!token && !!user;
    const isProfileComplete = user?.firstName && user?.lastName;

    const login = (newToken, newUser) => {
        const userToStore = {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName
        };
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userToStore));
        setToken(newToken);
        setUser(userToStore);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await api.get('/auth/me');
            const freshUser = {
                id: res.data.id,
                email: res.data.email,
                role: res.data.role,
                firstName: res.data.firstName,
                lastName: res.data.lastName
            };
            localStorage.setItem('user', JSON.stringify(freshUser));
            setUser(freshUser);
        } catch {
            // If /me fails (404/401), the interceptor handles logout
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isProfileComplete, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * useAuth() — hook to access auth state from any component.
 * Usage: const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
