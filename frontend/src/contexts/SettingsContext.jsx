import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client.js';
import { API_BASE_URL } from '../config.js';

const SettingsContext = createContext(null);

/**
 * SettingsProvider — fetches site settings once and shares across all components.
 * Prevents duplicate /api/settings calls from Navbar, Home, Contact, etc.
 */
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                setSettings(res.data || {});
            } catch (err) {
                console.error('Failed to load site settings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Dynamically update favicon
    useEffect(() => {
        if (settings.branding_assets?.favicon) {
            const faviconUrl = `${API_BASE_URL}${settings.branding_assets.favicon}`;
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = faviconUrl;
        }
    }, [settings.branding_assets?.favicon]);

    const refreshSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data || {});
        } catch (err) {
            console.error('Failed to refresh site settings', err);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

/**
 * useSettings() — hook to access site settings from any component.
 * Usage: const { settings, loading, refreshSettings } = useSettings();
 */
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export default SettingsContext;
