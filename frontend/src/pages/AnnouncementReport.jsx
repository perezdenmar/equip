import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft, Mail, Bell, CheckCircle, Eye,
    XCircle, Users, BarChart3, Search, Download,
    FileText, Zap, Megaphone
} from 'lucide-react';
import api from '../api/client.js';

const AnnouncementReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse tab from URL if present
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'content';

    const [activeTab, setActiveTab] = useState(initialTab); // 'content' or 'metrics'
    const [announcement, setAnnouncement] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            // First fetch basic details - this should be fast
            const res = await api.get(`/announcements/${id}`);
            setAnnouncement(res.data);

            // If it's already sent, we can automatically try to fetch metrics too
            if (res.data.status === 'SENT') {
                fetchReport(false); // Don't block the main UI loading
            }
        } catch (err) {
            console.error('Failed to fetch announcement details', err);
            setError(err.response?.data?.error || 'Announcement not found or access denied.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async (isManualClick = true) => {
        if (isManualClick) setReportLoading(true);
        try {
            setError(null);
            const res = await api.get(`/announcements/${id}/report`);
            setReport(res.data);
        } catch (err) {
            console.error('Failed to fetch report metrics', err);
            if (isManualClick) {
                alert('Delivery report data is currently unavailable. Please try again later.');
            }
            setError(err.response?.status || 500);
        } finally {
            if (isManualClick) setReportLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;
    }

    if (error || !announcement) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <XCircle size={64} className="mx-auto text-red-500 mb-4 opacity-20" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{error === 404 ? 'Report Not Found' : (error || 'Announcement Not Found')}</h2>
                <p className="text-zinc-500 mb-8">The requested announcement could not be loaded. It may have been deleted or never existed.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('/admin/announcements')} className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold transition-transform active:scale-95">
                        Return to Announcements
                    </button>
                    <button onClick={() => fetchInitialData()} className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl font-bold">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const getUserName = (u) => {
        if (!u) return 'Unknown';
        return `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'No Name';
    };

    const filteredRecipients = report?.recipients?.filter(r =>
        getUserName(r.user).toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admin/announcements')}
                        className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ChevronLeft size={18} className="mr-1" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white flex items-center gap-3 text-left">
                        <Megaphone className="text-brand-500" size={32} />
                        {announcement.title}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${announcement.status === 'SENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                            announcement.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                            }`}>
                            {announcement.status}
                        </span>
                        <span className="text-zinc-400 text-xs">
                            {announcement.sentAt ? `Sent on ${new Date(announcement.sentAt).toLocaleString()}` :
                                announcement.scheduledAt ? `Scheduled for ${new Date(announcement.scheduledAt).toLocaleString()}` :
                                    'Draft Version'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold text-sm hover:bg-zinc-50 transition-all"
                    >
                        <Download size={16} className="mr-2" /> Export
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8 overflow-x-auto scroller-hidden">
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'content'
                        ? 'text-brand-600 border-b-2 border-brand-600'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border-b-2 border-transparent'
                        }`}
                >
                    <FileText size={18} /> Announcement Content
                </button>
                <button
                    onClick={() => {
                        setActiveTab('metrics');
                        if (!report) fetchReport(true);
                    }}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'metrics'
                        ? 'text-brand-600 border-b-2 border-brand-600'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border-b-2 border-transparent'
                        }`}
                >
                    <BarChart3 size={18} /> Delivery Report & Metrics
                </button>
            </div>

            {activeTab === 'content' ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="md:col-span-2 space-y-8">
                            {/* Message Preview */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-center">
                                    <h2 className="font-bold text-zinc-900 dark:text-white">Message Details</h2>
                                    <div className="flex gap-2">
                                        {announcement.channels.email && <Mail className="text-zinc-400" size={16} title="Includes email" />}
                                        {announcement.channels.inApp && <Bell className="text-zinc-400" size={16} title="Includes in-app notification" />}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="mb-6">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Subject</label>
                                        <div className="text-lg font-bold text-zinc-900 dark:text-white">{announcement.subject || 'No Subject'}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Notice Body</label>
                                        <div
                                            className="prose dark:prose-invert max-w-none bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700 break-words"
                                            dangerouslySetInnerHTML={{ __html: announcement.content }}
                                        />
                                    </div>
                                    {announcement.ctaLink && (
                                        <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-900/30">
                                            <label className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block mb-1">Primary CTA Link</label>
                                            <a href={announcement.ctaLink} target="_blank" rel="noopener noreferrer" className="text-brand-500 font-bold hover:underline break-all">
                                                {announcement.ctaLink}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Configuration Info */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm lg:sticky lg:top-8">
                                <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Execution Config</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Target Segments</label>
                                        <div className="flex flex-wrap gap-2">
                                            {announcement.targetCriteria.roles?.map(r => (
                                                <span key={r} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400">{r}</span>
                                            ))}
                                            {(!announcement.targetCriteria.roles || announcement.targetCriteria.roles.length === 0) && <span className="text-xs text-zinc-500 italic">Global (Everyone)</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Delivery Priority</label>
                                        <div className="flex items-center gap-2">
                                            {announcement.priority ? (
                                                <span className="flex items-center text-red-500 text-xs font-bold gap-1">
                                                    <Zap size={14} fill="currentColor" /> HIGH PRIORITY
                                                </span>
                                            ) : (
                                                <span className="text-zinc-500 text-xs font-medium uppercase">STANDARD</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Recipients Reach</label>
                                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">{announcement._count?.recipients || 0}</div>
                                        <p className="text-[10px] text-zinc-500">Total users processed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Metrics Section */}
                    {reportLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
                            <p className="text-zinc-500 font-medium font-display uppercase tracking-widest text-xs">Analyzing delivery data...</p>
                        </div>
                    ) : report ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <Users size={120} />
                                    </div>
                                    <div className="relative z-10 text-left">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Total Sent</span>
                                        <div className="text-4xl font-display font-bold text-zinc-900 dark:text-white">{report.stats.totalSent}</div>
                                        <p className="text-xs text-zinc-500 mt-2">Delivered to unique user accounts</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <Eye size={120} />
                                    </div>
                                    <div className="relative z-10 text-left">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Read Count</span>
                                        <div className="text-4xl font-display font-bold text-zinc-900 dark:text-white">{report.stats.readCount}</div>
                                        <p className="text-xs text-zinc-500 mt-2">In-app notifications seen by users</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <BarChart3 size={120} />
                                    </div>
                                    <div className="relative z-10 text-left">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Read Rate</span>
                                        <div className="text-4xl font-display font-bold text-zinc-900 dark:text-white">{report.stats.readRate}%</div>
                                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                                            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${report.stats.readRate}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recipient Table */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden text-left">
                                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <h2 className="font-bold text-zinc-900 dark:text-white">Recipient Logs</h2>
                                    <div className="relative w-full md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Filter recipients..."
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
                                                <th className="px-6 py-4">Participant</th>
                                                <th className="px-6 py-4">Role</th>
                                                <th className="px-6 py-4 text-right">Processed At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                            {filteredRecipients.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-10 text-center text-zinc-500 italic">No activity logs available matching this criteria.</td>
                                                </tr>
                                            ) : (
                                                filteredRecipients.map((rec) => (
                                                    <tr key={rec.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-zinc-900 dark:text-white">
                                                                {getUserName(rec.user)}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-500 font-medium">{rec.user.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 uppercase">
                                                                {rec.user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-xs text-zinc-500 font-mono">
                                                            {new Date(rec.sentAt).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center px-4">
                            <XCircle size={48} className="text-zinc-300 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Metrics Unavailable</h3>
                            <p className="text-zinc-500 max-w-sm mx-auto mb-6">Execution metrics might still be processing or failed to sync. Announcement content is visible in the primary tab.</p>
                            <button onClick={() => fetchReport(true)} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-md transition-transform active:scale-95">
                                Retry Fetching Data
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnnouncementReport;
