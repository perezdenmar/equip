import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, Trash2, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
    const { token, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchNotifications();
    }, [isAuthenticated, token]);

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

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        const size = 24;
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="text-green-500" size={size} />;
            case 'WARNING': return <AlertCircle className="text-yellow-500" size={size} />;
            case 'ERROR': return <XCircle className="text-red-500" size={size} />;
            default: return <Info className="text-blue-500" size={size} />;
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Notifications</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your alerts and activity updates</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
                        >
                            <CheckCheck size={18} />
                            <span>Mark all as read</span>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                        <p className="mt-4 text-zinc-500">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`glass-effect border rounded-2xl p-6 transition-all group ${!n.isRead ? 'border-brand-200 dark:border-brand-800 ring-1 ring-brand-100 dark:ring-brand-900/20' : ''}`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="mt-1 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`text-lg font-bold ${!n.isRead ? 'text-brand-900 dark:text-brand-100' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {n.title}
                                                    {!n.isRead && <span className="ml-3 inline-block w-2 h-2 bg-brand-500 rounded-full"></span>}
                                                </h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed">
                                                    {n.message}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-600 dark:text-brand-400 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCheck size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(n.id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center text-[11px] text-zinc-400 space-x-4">
                                            <span>{new Date(n.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 glass-effect border rounded-3xl">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="text-zinc-400" size={40} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No notifications yet</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                            When you have enrollment updates, course assignments, or system alerts, they will appear here.
                        </p>
                        <Link
                            to="/dashboard"
                            className="inline-block mt-8 px-6 py-2 rounded-full bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;

