import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { API_BASE_URL } from '../config.js';

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, logout } = useAuth();
    const { settings } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [navItems, setNavItems] = useState([
        { id: 'home', title: t('nav.home'), path: '/', isVisible: true },
        { id: 'quals', title: t('nav.qualifications'), path: '/qualifications', isVisible: true },
        { id: 'jobs', title: t('nav.jobs'), path: '/jobs', isVisible: true },
        { id: 'courses', title: 'Online Courses', path: '/courses', isVisible: true },
        { id: 'contact', title: 'Contact Us', path: '/contact', isVisible: true }
    ]);

    useEffect(() => {
        if (settings && settings.navigation_menu) {
            setNavItems(settings.navigation_menu);
        }
    }, [settings]);


    const handleLogout = () => {
        logout();
        window.location.href = '/login';
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
                            {/* Conditional Auth Rendering */}
                            {isAuthenticated ? (
                                <>
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

            {/* Mobile Menu Overlay */}
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
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-3 rounded-xl text-base font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-3 rounded-xl text-base font-medium bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-3 rounded-xl text-base font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-3 rounded-xl text-base font-medium bg-brand-600 text-white text-center"
                                >
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
