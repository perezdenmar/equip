import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/client.js';
import {
    Bell, CheckCircle2, AlertCircle, Info, XCircle,
    Trash2, CheckCheck, Loader2, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── helpers ────────────────────────────────────────────────────────────────
const TYPE_META = {
    SUCCESS: { icon: CheckCircle2, color: 'text-green-500',  bg: 'bg-green-50  dark:bg-green-900/20'  },
    WARNING: { icon: AlertCircle,  color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    ERROR:   { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50    dark:bg-red-900/20'    },
    INFO:    { icon: Info,         color: 'text-blue-500',   bg: 'bg-blue-50   dark:bg-blue-900/20'   },
};

const getTypeMeta = (type) => TYPE_META[type] || TYPE_META.INFO;

const FILTERS = ['All', 'Unread', 'SUCCESS', 'WARNING', 'ERROR', 'INFO'];

// ─── skeleton ───────────────────────────────────────────────────────────────
const Skeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="glass-effect border rounded-2xl p-6 animate-pulse">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
                        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/4 mt-3" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// ─── main ───────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [activeFilter, setActiveFilter]   = useState('All');
    const [actionBusy, setActionBusy]       = useState({});

    // ── fetch ──────────────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchNotifications();
    }, [isAuthenticated, fetchNotifications]);

    // ── optimistic helpers ─────────────────────────────────────────────────
    const setBusy = (id, val) =>
        setActionBusy(prev => ({ ...prev, [id]: val }));

    const markAsRead = async (id) => {
        // optimistic
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setBusy(id, 'read');
        try {
            await api.patch(`/notifications/${id}/read`);
        } catch (err) {
            console.error('Error marking read:', err);
            // revert
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: false } : n)
            );
        } finally {
            setBusy(id, null);
        }
    };

    const markAllAsRead = async () => {
        // optimistic
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await api.patch('/notifications/read-all');
        } catch (err) {
            console.error('Error marking all read:', err);
            fetchNotifications(); // revert from server
        }
    };

    const deleteNotification = async (id) => {
        // optimistic
        setNotifications(prev => prev.filter(n => n.id !== id));
        setBusy(id, 'delete');
        try {
            await api.delete(`/notifications/${id}`);
        } catch (err) {
            console.error('Error deleting notification:', err);
            fetchNotifications(); // revert from server
        } finally {
            setBusy(id, null);
        }
    };

    // ── filtered list ──────────────────────────────────────────────────────
    const filtered = notifications.filter(n => {
        if (activeFilter === 'All')    return true;
        if (activeFilter === 'Unread') return !n.isRead;
        return n.type === activeFilter;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // ── render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-zinc-900 dark:text-white">Notifications</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                            {unreadCount > 0
                                ? <><span className="font-bold text-brand-600 dark:text-brand-400">{unreadCount} unread</span> · {notifications.length} total</>
                                : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`
                            }
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
                        >
                            <CheckCheck size={16} />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {FILTERS.map(f => {
                        const count =
                            f === 'All'    ? notifications.length :
                            f === 'Unread' ? unreadCount :
                            notifications.filter(n => n.type === f).length;
                        return (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                    activeFilter === f
                                        ? 'bg-brand-600 text-white border-brand-600'
                                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-brand-400'
                                }`}
                            >
                                {f}
                                {count > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                        activeFilter === f
                                            ? 'bg-white/20 text-white'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                    }`}>{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {loading ? (
                    <Skeleton />
                ) : filtered.length > 0 ? (
                    <div className="space-y-3">
                        {filtered.map(n => {
                            const { icon: Icon, color, bg } = getTypeMeta(n.type);
                            const busy = actionBusy[n.id];
                            return (
                                <div
                                    key={n.id}
                                    className={`glass-effect border rounded-2xl p-5 transition-all group ${
                                        !n.isRead
                                            ? 'border-brand-200 dark:border-brand-800/60 ring-1 ring-brand-100 dark:ring-brand-900/20'
                                            : 'border-zinc-200 dark:border-zinc-800'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${bg}`}>
                                            <Icon size={20} className={color} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="min-w-0">
                                                    <h3 className={`text-base font-bold leading-snug ${
                                                        !n.isRead
                                                            ? 'text-brand-900 dark:text-brand-100'
                                                            : 'text-zinc-900 dark:text-zinc-100'
                                                    }`}>
                                                        {n.title}
                                                        {!n.isRead && (
                                                            <span className="ml-2 inline-block w-1.5 h-1.5 bg-brand-500 rounded-full align-middle" />
                                                        )}
                                                    </h3>
                                                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                </div>

                                                {/* Actions — always visible on mobile, hover on desktop */}
                                                <div className="flex gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(n.id)}
                                                            disabled={!!busy}
                                                            className="p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-brand-600 dark:text-brand-400 transition-colors disabled:opacity-50"
                                                            title="Mark as read"
                                                        >
                                                            {busy === 'read'
                                                                ? <Loader2 size={16} className="animate-spin" />
                                                                : <CheckCheck size={16} />}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(n.id)}
                                                        disabled={!!busy}
                                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {busy === 'delete'
                                                            ? <Loader2 size={16} className="animate-spin" />
                                                            : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="mt-3 text-[11px] text-zinc-400 tabular-nums">
                                                {new Date(n.createdAt).toLocaleDateString(undefined, {
                                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                                {' · '}
                                                {new Date(n.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 glass-effect border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            {activeFilter === 'All'
                                ? <Bell className="text-zinc-300 dark:text-zinc-600" size={32} />
                                : <Filter className="text-zinc-300 dark:text-zinc-600" size={32} />}
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                            {activeFilter === 'All' ? 'No notifications yet' : `No ${activeFilter.toLowerCase()} notifications`}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto">
                            {activeFilter === 'All'
                                ? 'Enrollment updates, course assignments, and alerts will appear here.'
                                : 'Try a different filter to see your other notifications.'}
                        </p>
                        {activeFilter !== 'All' ? (
                            <button
                                onClick={() => setActiveFilter('All')}
                                className="mt-6 px-5 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Show all
                            </button>
                        ) : (
                            <Link
                                to="/dashboard"
                                className="inline-block mt-6 px-6 py-2 rounded-full bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors text-sm"
                            >
                                Return to Dashboard
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
