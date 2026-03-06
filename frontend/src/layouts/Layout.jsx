import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import ErrorBoundary from '../components/ErrorBoundary';

const Layout = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check local storage or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDarkMode(true);
        }
    };

    return (
        <div className="flex flex-col min-h-screen relative">
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <main className="flex-grow pt-16">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </main>
            <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                <p>&copy; {new Date().getFullYear()} Equip Quantum Upskilling Institute of the Philippines Inc. All rights reserved.</p>
                <p className="mt-2 text-xs">National Highway, San Jose, Digos City, Davao del Sur 8002 | 0961-701-8568</p>
            </footer>

            {/* Global AI Chat Support Widget */}
            <ChatWidget />
        </div>
    );
};

export default Layout;
