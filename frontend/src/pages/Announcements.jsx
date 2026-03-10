import React, { useState, useEffect } from 'react';
import {
    Megaphone, Plus, Clock, CheckCircle, AlertCircle,
    MoreVertical, Trash2, Send, Eye, Users, Mail, Bell,
    ChevronLeft, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const Announcements = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (error) {
            console.error('Failed to fetch announcements', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'SENT': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'SCHEDULED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'FAILED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SENT': return <CheckCircle size={14} className="mr-1" />;
            case 'SCHEDULED': return <Clock size={14} className="mr-1" />;
            case 'FAILED': return <AlertCircle size={14} className="mr-1" />;
            default: return null;
        }
    };

    const handleDelete = async (ann) => {
        if (!window.confirm(`Are you sure you want to permanently delete the announcement "${ann.title}"? This will remove all delivery records.`)) return;

        try {
            await api.delete(`/announcements/${ann.id}`);
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to delete announcement', error);
            alert('Failed to delete announcement.');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admin/settings')}
                        className="flex items-center text-brand-600 hover:text-brand-500 font-bold transition-colors mb-4"
                    >
                        <ChevronLeft size={18} className="mr-1" /> Back to CMS Settings
                    </button>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2 flex items-center">
                        <Megaphone className="mr-3 text-brand-500" size={36} />
                        Announcements
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Send blast emails and in-app notifications to targeted user segments.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/announcements/create')}
                    className="flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus className="mr-2" size={20} /> Create Announcement
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Announcement</th>
                                <th className="px-6 py-4">Targets</th>
                                <th className="px-6 py-4">Channels</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {announcements.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-zinc-500 italic">No announcements found. Create your first blast!</td>
                                </tr>
                            ) : (
                                announcements.map((ann) => (
                                    <tr key={ann.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div
                                                onClick={() => navigate(`/admin/announcements/${ann.id}/report?tab=content`)}
                                                className="font-bold text-zinc-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer hover:underline transition-all"
                                            >
                                                {ann.title}
                                            </div>
                                            <div className="text-xs text-zinc-500 truncate max-w-xs">{ann.subject || 'No subject'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                                                <Users size={14} className="mr-1 opacity-60" />
                                                {ann._count?.recipients || 0} users
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {ann.channels.email && <Mail size={16} className="text-brand-500" title="Email" />}
                                                {ann.channels.inApp && <Bell size={16} className="text-blue-500" title="In-App" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusStyle(ann.status)}`}>
                                                {getStatusIcon(ann.status)}
                                                {ann.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {ann.sentAt ? new Date(ann.sentAt).toLocaleDateString() : ann.scheduledAt ? `Sched: ${new Date(ann.scheduledAt).toLocaleDateString()}` : 'Draft'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {ann.status === 'SENT' ? (
                                                    <button
                                                        onClick={() => navigate(`/admin/announcements/${ann.id}/report?tab=metrics`)}
                                                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-brand-500 transition-colors"
                                                        title="View Delivery Metrics"
                                                    >
                                                        <BarChart3 size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/admin/announcements/create?edit=${ann.id}`)}
                                                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-brand-500 transition-colors"
                                                        title="Edit/View Draft"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                )}
                                                {ann.status === 'DRAFT' && (
                                                    <button onClick={() => api.post(`/announcements/${ann.id}/send`).then(fetchAnnouncements)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-green-500 transition-colors" title="Send Now">
                                                        <Send size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(ann)}
                                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
