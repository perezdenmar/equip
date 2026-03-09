import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Mail, Bell, CheckCircle, Eye,
    XCircle, Users, BarChart3, Search, Download
} from 'lucide-react';
import api from '../api/client.js';

const AnnouncementReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            const res = await api.get(`/announcements/${id}/report`);
            setReport(res.data);
        } catch (error) {
            console.error('Failed to fetch report', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;
    }

    if (!report) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <XCircle size={64} className="mx-auto text-red-500 mb-4 opacity-20" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Report Not Found</h2>
                <p className="text-zinc-500 mb-8">This announcement may have been deleted or never existed.</p>
                <button onClick={() => navigate('/admin/announcements')} className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const filteredRecipients = report.recipients.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admin/announcements')}
                        className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ChevronLeft size={18} className="mr-1" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="text-brand-500" size={32} />
                        Blast Report: {report.title}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Delivery analysis and recipient interactions.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold text-sm hover:bg-zinc-50 transition-all"
                    >
                        <Download size={16} className="mr-2" /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                            <Users size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Reach</span>
                    </div>
                    <div className="text-3xl font-display font-bold text-zinc-900 dark:text-white">{report.stats.totalSent}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total Recipients</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                            <Eye size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Read</span>
                    </div>
                    <div className="text-3xl font-display font-bold text-zinc-900 dark:text-white">{report.stats.readCount}</div>
                    <div className="text-xs text-zinc-500 mt-1">Confirmed In-App Views</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Engagement</span>
                    </div>
                    <div className="text-3xl font-display font-bold text-zinc-900 dark:text-white">{report.stats.readRate}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Read Rate</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                            <BarChart3 size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Channels</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                        {report.channels.email && <Mail className="text-brand-500" size={24} />}
                        {report.channels.inApp && <Bell className="text-blue-500" size={24} />}
                    </div>
                    <div className="text-xs text-zinc-500 mt-2">Targeted Channels</div>
                </div>
            </div>

            {/* Recipient Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-zinc-900 dark:text-white">Recipient List</h2>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Delivered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredRecipients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-zinc-500 italic">No recipients found matching your search.</td>
                                </tr>
                            ) : (
                                filteredRecipients.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-zinc-900 dark:text-white">{rec.user.name}</div>
                                            <div className="text-xs text-zinc-500">{rec.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">
                                                {rec.user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {rec.user.location || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.isRead ? (
                                                <span className="inline-flex items-center text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                                    <Eye size={12} className="mr-1" /> Read
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-xs font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-0.5 rounded-full">
                                                    <Mail size={12} className="mr-1" /> Delivered
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-zinc-500">
                                            {new Date(rec.sentAt).toLocaleString()}
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

export default AnnouncementReport;
