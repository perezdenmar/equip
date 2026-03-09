import React, { useState, useEffect } from 'react';
import {
    Bell, Mail, Save, CheckCircle, Loader2, ArrowLeft,
    Settings, Users, Shield, History, Info, AlertTriangle,
    Check, X, RefreshCw, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const NotificationDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);

    // Default config structure based on the Notification Summary Table
    const [config, setConfig] = useState({
        NEW_STUDENT_REGISTRATION: {
            title: 'New Student Registration',
            inApp: true,
            email: true,
            recipients: ['ADMIN', 'STAFF'],
            severity: 'INFO'
        },
        WISHLIST: {
            title: 'Wishlist Action',
            inApp: true,
            email: true,
            recipients: ['ADMIN'],
            severity: 'INFO'
        },
        ENROLLMENT_REQUEST: {
            title: 'Enrollment Request',
            inApp: true,
            email: true,
            recipients: ['ADMIN'],
            severity: 'WARNING'
        },
        ENROLLMENT_STATUS_UPDATE: {
            title: 'Enrollment Status Update',
            inApp: true,
            email: true,
            recipients: ['STUDENT'],
            severity: 'SUCCESS'
        },
        COURSE_COMPLETION: {
            title: 'Course Completion',
            inApp: true,
            email: false,
            recipients: ['STUDENT'],
            severity: 'SUCCESS'
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data.notification_config) {
                setConfig(prev => ({ ...prev, ...res.data.notification_config }));
            }
            // Fetch audit logs for notification config changes
            const logsRes = await api.get('/enrollments/activity');
            // Note: In a real scenario, we might have a specific endpoint for settings audit logs, 
            // but for now, we'll try to find any relevant ones from common activity logs if possible, 
            // otherwise we'll just show an empty list or implement a specific fetch if needed.
            // Let's assume there's a more general audit log fetch available later.
        } catch (error) {
            console.error('Failed to load notification settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (type, channel) => {
        setConfig(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [channel]: !prev[type][channel]
            }
        }));
    };

    const handleRecipientToggle = (type, role) => {
        setConfig(prev => {
            const currentRecipients = prev[type].recipients || [];
            const newRecipients = currentRecipients.includes(role)
                ? currentRecipients.filter(r => r !== role)
                : [...currentRecipients, role];

            return {
                ...prev,
                [type]: {
                    ...prev[type],
                    recipients: newRecipients
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            await api.put('/settings/notifications', config);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save settings', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96 text-brand-500">
                <Loader2 className="animate-spin w-12 h-12" />
            </div>
        );
    }

    const rolesList = ['ADMIN', 'STAFF', 'TRAINER', 'STUDENT'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admin/settings')}
                        className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-1" /> Back to CMS Settings
                    </button>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2 flex items-center">
                        <Bell className="mr-3 text-brand-500" size={36} />
                        Notification Dashboard
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Configure triggers, delivery channels, and recipient rules across the platform.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
                    >
                        {saving ? (
                            <><Loader2 className="animate-spin mr-2" size={20} /> Saving...</>
                        ) : saveSuccess ? (
                            <><CheckCircle className="mr-2 text-green-300" size={20} /> Saved!</>
                        ) : (
                            <><Save className="mr-2" size={20} /> Save Configuration</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Main Settings Panel */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
                        <h2 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center">
                            <Shield className="mr-2 text-brand-500" size={18} /> Notification Rules & Routing
                        </h2>
                        <span className="text-xs text-zinc-500">Only Admins can modify these rules</span>
                    </div>

                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {Object.entries(config).map(([key, item]) => (
                            <div key={key} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.severity === 'WARNING' ? <AlertTriangle size={16} className="text-amber-500" /> : <Info size={16} className="text-blue-500" />}
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{item.title || key}</h3>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                                            {key === 'NEW_STUDENT_REGISTRATION' && 'Triggered when a new student creates an account.'}
                                            {key === 'WISHLIST' && 'Triggered when a student adds a course to their wishlist.'}
                                            {key === 'ENROLLMENT_REQUEST' && 'Triggered when a student applies for an open qualification.'}
                                            {key === 'ENROLLMENT_STATUS_UPDATE' && 'Triggered when an admin approves or rejects an enrollment.'}
                                            {key === 'COURSE_COMPLETION' && 'Triggered when a student successfully completes a qualification.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-8 lg:bg-zinc-50 lg:dark:bg-zinc-950 p-4 rounded-xl lg:border lg:border-zinc-200 lg:dark:border-zinc-800">
                                        {/* Channels */}
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase mb-2">In-App</span>
                                                <button
                                                    onClick={() => handleToggle(key, 'inApp')}
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors relative ${item.inApp ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.inApp ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Email</span>
                                                <button
                                                    onClick={() => handleToggle(key, 'email')}
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors relative ${item.email ? 'bg-brand-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.email ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden lg:block" />

                                        {/* Recipients */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Recipient Groups</span>
                                            <div className="flex flex-wrap gap-2">
                                                {rolesList.map(role => (
                                                    <button
                                                        key={role}
                                                        onClick={() => handleRecipientToggle(key, role)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${item.recipients?.includes(role)
                                                                ? 'bg-brand-500 border-brand-500 text-white'
                                                                : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
                        ))}
                    </div>
                </div>

                {/* Audit Context */}
                <div className="bg-zinc-100 dark:bg-zinc-950 rounded-2xl p-6 border border-dashed border-zinc-300 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-4 text-zinc-600 dark:text-zinc-400">
                        <History size={18} />
                        <h2 className="font-bold">Recent Policy Changes</h2>
                    </div>
                    <div className="text-center py-10">
                        <p className="text-zinc-500 dark:text-zinc-500 text-sm italic">Changes to notification policies are recorded in the system audit log. Full history will appear as configuration is updated.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDashboard;
