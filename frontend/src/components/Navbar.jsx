import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Menu, X, Bell, CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, logout, token } = useAuth();
    const { settings } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    const [navItems, setNavItems] = useState([
        { id: 'home', title: t('nav.home'), path: '/', isVisible: true },
        { id: 'quals', title: t('nav.qualifications'), path: '/qualifications', isVisible: true },
        { id: 'jobs', title: t('nav.jobs'), path: '/jobs', isVisible: true },
        { id: 'partners', title: 'Partners', path: '/partners', isVisible: true },
        { id: 'courses', title: 'Online Courses', path: '/courses', isVisible: true },
        { id: 'contact', title: 'Contact Us', path: '/contact', isVisible: true }
    ]);

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, token]);

    // Close notification dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
                setIsNotificationOpen(false);
            }
        };
        if (isNotificationOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isNotificationOpen]);

    useEffect(() => {
        if (settings && settings.navigation_menu) {
            const dynamicItems = settings.navigation_menu;
            if (!dynamicItems.find(item => item.id === 'partners' || item.path === '/partners')) {
                const partnersItem = { id: 'partners', title: 'Partners', path: '/partners', isVisible: true };
                const contactIndex = dynamicItems.findIndex(item => item.id === 'contact');
                if (contactIndex !== -1) {
                    dynamicItems.splice(contactIndex, 0, partnersItem);
                } else {
                    dynamicItems.push(partnersItem);
                }
            }
            setNavItems([...dynamicItems]);
        }
    }, [settings]);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch(`${API_BASE_URL}/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    // Group notifications by type for cleaner display
    const groupedNotifications = notifications.slice(0, 10).reduce((acc, n) => {
        const key = n.title;
        if (!acc[key]) acc[key] = { ...n, count: 1, latestAt: n.createdAt };
        else { acc[key].count++; acc[key].latestAt = n.createdAt > acc[key].latestAt ? n.createdAt : acc[key].latestAt; }
        return acc;
    }, {});
    const displayNotifications = Object.values(groupedNotifications);

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="text-green-500" size={18} />;
            case 'WARNING': return <AlertCircle className="text-yellow-500" size={18} />;
            case 'ERROR':   return <XCircle className="text-red-500" size={18} />;
            default:        return <Info className="text-blue-500" size={18} />;
        }
    };

    return (
        <nav className="fixed w-full z-50 glass-effect border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-2">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <img
                                src={settings.branding_assets?.logo ? `${API_BASE_URL}${settings.branding_assets.logo}` : "/logo.png"}
                                alt="EQUIP Logo"
                                className="h-10 w-auto group-hover:scale-105 transition-transform"
                            />
                            <span className="text-2xl font-display font-bold text-gradient tracking-tight">
                                EQUIP
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex space-x-8 items-center">
                        {navItems.filter(item => item.isVisible).map(item => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={item.id === 'courses'
                                    ? "text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20 px-3 py-1 rounded-full text-sm"
                                    : "text-zinc-600 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
                                }
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="hidden md:flex items-center space-x-3">
                            {isAuthenticated ? (
                                <>
                                    {/* Notifications — with outside-click backdrop */}
                                    <div className="relative" ref={notificationRef}>
                                        <button
                                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300 relative"
                                            aria-label="Notifications"
                                        >
                                            <Bell size={20} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {isNotificationOpen && (
                                            <>
                                                {/* Transparent backdrop to catch outside clicks */}
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsNotificationOpen(false)}
                                                />
                                                <div className="absolute right-0 mt-2 w-80 glass-effect border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                    <div className="p-4 border-b flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                                                        <h3 className="font-bold text-sm">Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <button
                                                                onClick={markAllAsRead}
                                                                className="text-[11px] text-brand-600 hover:text-brand-700 font-medium"
                                                            >
                                                                Mark all read
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="max-h-96 overflow-y-auto">
                                                        {displayNotifications.length > 0 ? (
                                                            displayNotifications.map((n) => (
                                                                <div
                                                                    key={n.id}
                                                                    onClick={() => {
                                                                        if (!n.isRead) markAsRead(n.id);
                                                                        setIsNotificationOpen(false);
                                                                    }}
                                                                    className={`p-4 border-b last:border-0 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!n.isRead ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
                                                                >
                                                                    <div className="flex space-x-3">
                                                                        <div className="mt-0.5">{getIcon(n.type)}</div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="text-sm font-semibold leading-tight">{n.title}</p>
                                                                                {n.count > 1 && (
                                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                                                                                        ×{n.count}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{n.message}</p>
                                                                            <p className="text-[10px] text-zinc-400 mt-1">
                                                                                {new Date(n.latestAt).toLocaleDateString()} at {new Date(n.latestAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 text-center text-zinc-400 text-sm">
                                                                No notifications yet
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Link
                                                        to="/notifications"
                                                        onClick={() => setIsNotificationOpen(false)}
                                                        className="block p-3 text-center text-xs font-semibold text-brand-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-t"
                                                    >
                                                        View All Notifications
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <Link
                                        to="/dashboard"
                                        className="px-5 py-2 rounded-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium transition-colors text-sm"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="px-5 py-2 rounded-full bg-accent-50 hover:bg-accent-100 dark:bg-accent-900/30 dark:hover:bg-accent-900/50 text-accent-700 dark:text-accent-300 font-medium transition-colors text-sm"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-5 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-medium transition-colors text-sm cursor-pointer"
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-5 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors text-sm"
                                >
                                    {t('nav.login')}
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden glass-effect border-b animate-in slide-in-from-top duration-200">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {navItems.filter(item => item.isVisible).map(item => (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-3 rounded-xl text-base font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                {item.title}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            {isAuthenticated ? (
                                <div className="space-y-2">
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300">Dashboard</Link>
                                    <Link to="/notifications" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-medium bg-zinc-50 dark:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">Notifications</Link>
                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-medium bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300">Profile</Link>
                                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-3 rounded-xl text-base font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-medium bg-brand-600 text-white text-center">
                                    {t('nav.login')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
