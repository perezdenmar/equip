import React, { useState, useEffect, useCallback } from 'react';
import {
    Bell, Save, CheckCircle, Loader2, ArrowLeft,
    Shield, History, Info, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

// ─── Toast (inline — same pattern as Dashboard) ───────────────────────────
const Toast = ({ toasts }) => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
            <div
                key={t.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto ${
                    t.type === 'success' ? 'bg-green-600 text-white'
                    : t.type === 'error' ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-white'
                }`}
            >
                {t.type === 'success' && <CheckCircle2 size={16} />}
                {t.type === 'error'   && <XCircle size={16} />}
                {t.message}
            </div>
        ))}
    </div>
);

// ─── Toggle switch ────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }) => (
    <button
        role="switch"
        aria-checked={on}
        onClick={onChange}
        className={`w-12 h-6 rounded-full p-1 transition-colors relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
            on ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'
        }`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
);

// ─── default config ───────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
    NEW_STUDENT_REGISTRATION: {
        title: 'New Student Registration',
        description: 'Triggered when a new student creates an account.',
        inApp: true,  email: true,
        recipients: ['ADMIN', 'STAFF'], severity: 'INFO'
    },
    WISHLIST: {
        title: 'Wishlist Action',
        description: 'Triggered when a student adds a course to their wishlist.',
        inApp: true,  email: true,
        recipients: ['ADMIN'], severity: 'INFO'
    },
    ENROLLMENT_REQUEST: {
        title: 'Enrollment Request',
        description: 'Triggered when a student applies for an open qualification.',
        inApp: true,  email: true,
        recipients: ['ADMIN'], severity: 'WARNING'
    },
    ENROLLMENT_STATUS_UPDATE: {
        title: 'Enrollment Status Update',
        description: 'Triggered when an admin approves or rejects an enrollment.',
        inApp: true,  email: true,
        recipients: ['STUDENT'], severity: 'SUCCESS'
    },
    COURSE_COMPLETION: {
        title: 'Course Completion',
        description: 'Triggered when a student successfully completes a qualification.',
        inApp: true,  email: false,
        recipients: ['STUDENT'], severity: 'SUCCESS'
    },
};

const ROLES = ['ADMIN', 'STAFF', 'TRAINER', 'STUDENT'];

const SEVERITY_META = {
    WARNING: { icon: AlertTriangle, color: 'text-amber-500' },
    SUCCESS: { icon: CheckCircle,   color: 'text-green-500' },
    ERROR:   { icon: XCircle,       color: 'text-red-500'   },
    INFO:    { icon: Info,          color: 'text-blue-500'  },
};

// ─── main ─────────────────────────────────────────────────────────────────
const NotificationDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading]   = useState(true);
    const [saving,  setSaving]    = useState(false);
    const [config,  setConfig]    = useState(DEFAULT_CONFIG);
    const [auditLogs, setAuditLogs] = useState([]);
    const [toasts,  setToasts]    = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    // ── fetch ────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/settings');
                if (res.data?.notification_config) {
                    setConfig(prev => ({ ...prev, ...res.data.notification_config }));
                }
                // fetch audit logs when endpoint is ready
                try {
                    const logsRes = await api.get('/settings/audit-log');
                    setAuditLogs(logsRes.data || []);
                } catch {
                    // endpoint may not exist yet — leave empty
                }
            } catch (err) {
                console.error('Failed to load notification settings', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // ── toggles ───────────────────────────────────────────────────────────
    const handleChannelToggle = (key, channel) =>
        setConfig(prev => ({
            ...prev,
            [key]: { ...prev[key], [channel]: !prev[key][channel] }
        }));

    const handleRecipientToggle = (key, role) =>
        setConfig(prev => {
            const current = prev[key].recipients || [];
            const next = current.includes(role)
                ? current.filter(r => r !== role)
                : [...current, role];
            return { ...prev, [key]: { ...prev[key], recipients: next } };
        });

    // ── save ──────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings/notifications', config);
            addToast('Notification settings saved successfully.', 'success');
        } catch (err) {
            console.error('Failed to save settings', err);
            addToast('Failed to save settings. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ── loading ───────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96 text-brand-500">
                <Loader2 className="animate-spin w-12 h-12" />
            </div>
        );
    }

    // ── render ────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Toast toasts={toasts} />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admin/settings')}
                        className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Back to CMS Settings
                    </button>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-3">
                        <Bell className="text-brand-500" size={32} />
                        Notification Settings
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Configure triggers, delivery channels, and recipient rules.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
                >
                    {saving
                        ? <><Loader2 className="animate-spin" size={18} /> Saving...</>
                        : <><Save size={18} /> Save Configuration</>
                    }
                </button>
            </div>

            {/* Rules table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                    <h2 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <Shield className="text-brand-500" size={18} /> Notification Rules & Routing
                    </h2>
                    <span className="text-xs text-zinc-500">Admin only</span>
                </div>

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {Object.entries(config).map(([key, item]) => {
                        const { icon: SevIcon, color: sevColor } = SEVERITY_META[item.severity] || SEVERITY_META.INFO;
                        return (
                            <div key={key} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                                    {/* Description */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <SevIcon size={15} className={sevColor} />
                                            <h3 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wide">
                                                {item.title || key}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex flex-wrap items-center gap-8 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">

                                        {/* Channel toggles */}
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase">In-App</span>
                                                <Toggle on={item.inApp} onChange={() => handleChannelToggle(key, 'inApp')} />
                                            </div>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Email</span>
                                                <Toggle on={item.email} onChange={() => handleChannelToggle(key, 'email')} />
                                            </div>
                                        </div>

                                        <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-800 hidden lg:block" />

                                        {/* Recipient toggles */}
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Recipients</span>
                                            <div className="flex flex-wrap gap-2">
                                                {ROLES.map(role => (
                                                    <button
                                                        key={role}
                                                        onClick={() => handleRecipientToggle(key, role)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                                                            item.recipients?.includes(role)
                                                                ? 'bg-brand-500 border-brand-500 text-white'
                                                                : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                        }`}
                                                    >
                                                        {role}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Audit log */}
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-6 border border-dashed border-zinc-300 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-4 text-zinc-600 dark:text-zinc-400">
                    <History size={18} />
                    <h2 className="font-bold">Recent Policy Changes</h2>
                </div>

                {auditLogs.length > 0 ? (
                    <div className="space-y-3">
                        {auditLogs.map((log, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-zinc-700 dark:text-zinc-300 font-medium">{log.message}</p>
                                    <p className="text-zinc-400 text-xs tabular-nums">{new Date(log.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-400 dark:text-zinc-500 text-sm italic text-center py-6">
                        Changes to notification policies will be recorded here as you save configurations.
                    </p>
                )}
            </div>
        </div>
    );
};

export default NotificationDashboard;
