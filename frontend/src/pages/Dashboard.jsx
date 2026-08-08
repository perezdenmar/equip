import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, Award, Clock, Briefcase, FileText, Settings, Users,
    AlertCircle, Plus, Download, Loader2, ArrowRight, Heart,
    CheckCircle2, XCircle, TrendingUp, GraduationCap, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

// ─── Toast ────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
            <div
                key={t.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto ${
                    t.type === 'success'
                        ? 'bg-green-600 text-white'
                        : t.type === 'error'
                        ? 'bg-red-600 text-white'
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

// ─── Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, loading, to }) => {
    const inner = (
        <div className="glass-effect p-6 rounded-2xl flex items-center justify-between w-full">
            <div>
                <p className="text-zinc-500 text-sm font-medium mb-1">{label}</p>
                {loading ? (
                    <div className="h-9 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                ) : (
                    <h3 className="text-3xl font-display font-bold text-zinc-900 dark:text-white tabular-nums">
                        {value ?? '—'}
                    </h3>
                )}
            </div>
            <div className={`p-4 rounded-xl ${iconBg}`}>
                <Icon size={28} className={iconColor} />
            </div>
        </div>
    );
    return to
        ? <Link to={to} className="hover:scale-[1.02] transition-transform block">{inner}</Link>
        : <div>{inner}</div>;
};

// ─── Quick Action Link ─────────────────────────────────────────────────────
const QuickLink = ({ to, icon: Icon, iconBg, iconColor, label }) => (
    <Link
        to={to}
        className="w-full flex items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group"
    >
        <div className={`p-2 rounded-lg mr-4 group-hover:opacity-80 transition-opacity ${iconBg}`}>
            <Icon size={20} className={iconColor} />
        </div>
        <div className="font-medium text-zinc-800 dark:text-zinc-200">{label}</div>
        <ArrowRight size={14} className="ml-auto text-zinc-400 group-hover:text-brand-500 transition-colors" />
    </Link>
);

// ─── Activity Feed ──────────────────────────────────────────────────────────
const ActivityFeed = ({ items, loading }) => {
    if (loading) {
        return (
            <div className="space-y-5">
                {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                        <div className="flex-1 space-y-1.5 pt-1">
                            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                            <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (!items.length) {
        return (
            <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <Bell size={24} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm text-zinc-500 italic">No recent activity yet.</p>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {items.map((activity, index) => (
                <div key={activity.id} className="flex relative">
                    {index !== items.length - 1 && (
                        <div className="absolute left-[11px] top-6 w-[2px] h-full bg-zinc-200 dark:bg-zinc-800" />
                    )}
                    <div className="mt-0.5 mr-4 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 relative z-10 shrink-0 border-2 border-white dark:border-zinc-950">
                        {activity.icon}
                    </div>
                    <div>
                        <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">{activity.text}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{activity.time}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const safeUser  = user || { role: 'STUDENT', email: 'user@example.com' };
    const isAdmin   = safeUser.role === 'ADMIN';
    const isTrainer = safeUser.role === 'TRAINER';

    // — profile / trainer data
    const [profileData, setProfileData] = useState(null);
    const [trainerData, setTrainerData] = useState(null);

    // — admin live stats
    const [adminStats, setAdminStats] = useState({ students: null, courses: null });
    const [statsLoading, setStatsLoading] = useState(false);

    // — enrollment requests
    const [requestedEnrollments, setRequestedEnrollments]   = useState([]);
    const [isLoadingRequests, setIsLoadingRequests]         = useState(false);
    const [actionLoading, setActionLoading]                 = useState({});

    // — activity feed
    const [recentActivity, setRecentActivity]   = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);

    // — toasts
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    }, []);

    useEffect(() => {
        fetchProfileData();
        fetchRecentActivity();
        if (isTrainer) fetchTrainerData();
        if (isAdmin) {
            fetchAdminStats();
            fetchEnrollmentRequests();
        }
        if (isTrainer) fetchEnrollmentRequests();
    }, [isAdmin, isTrainer]);

    // ── fetch helpers ───────────────────────────────────────────────────────
    const fetchProfileData = async () => {
        try { const res = await api.get('/auth/me'); setProfileData(res.data); }
        catch (e) { console.error('profile fetch failed', e); }
    };

    const fetchRecentActivity = async () => {
        setActivityLoading(true);
        try {
            const res  = await api.get('/enrollments/activity');
            const icon = (action) => (
                action === 'ENROLLMENT_REQUEST' ? <BookOpen size={16} /> :
                action.includes('PROFILE')       ? <Settings size={16} /> :
                                                   <BookOpen size={16} />
            );
            const fmt = (d) =>
                new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                ' · ' + new Date(d).toLocaleDateString();
            setRecentActivity(res.data.map(a => ({ ...a, icon: icon(a.action), time: fmt(a.time) })));
        } catch (e) {
            console.error('activity fetch failed', e);
        } finally {
            setActivityLoading(false);
        }
    };

    const fetchTrainerData = async () => {
        try {
            const res = await api.get('/users/trainers');
            const me  = res.data.find(tr => tr.email === safeUser.email);
            setTrainerData(me || null);
        } catch (e) { console.error('trainer fetch failed', e); }
    };

    const fetchAdminStats = async () => {
        setStatsLoading(true);
        try {
            const [stuRes, courseRes] = await Promise.allSettled([
                api.get('/students'),
                api.get('/qualifications'),
            ]);
            setAdminStats({
                students: stuRes.status === 'fulfilled'   ? stuRes.value.data.length   : null,
                courses:  courseRes.status === 'fulfilled' ? courseRes.value.data.length : null,
            });
        } catch (e) {
            console.error('stats fetch failed', e);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchEnrollmentRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const res = await api.get('/enrollments');
            setRequestedEnrollments(res.data);
        } catch (e) {
            console.error('enrollments fetch failed', e);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    // ── enrollment approve / deny ─────────────────────────────────────────
    const handleEnrollmentAction = async (id, status) => {
        setActionLoading((prev) => ({ ...prev, [id]: status }));
        try {
            await api.patch(`/enrollments/${id}/status`, { status });
            setRequestedEnrollments((prev) => prev.filter((r) => r.id !== id));
            fetchRecentActivity();
            const studentName = requestedEnrollments.find(r => r.id === id)?.user?.firstName || 'Student';
            addToast(
                status === 'APPROVED'
                    ? `✓ Enrollment approved for ${studentName}`
                    : `Enrollment denied for ${studentName}`,
                status === 'APPROVED' ? 'success' : 'info'
            );
        } catch (e) {
            console.error('enrollment action failed', e);
            addToast('Failed to update enrollment status. Please try again.', 'error');
        } finally {
            setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; });
        }
    };

    const handleDownloadCertificate = async (enrollmentId, courseTitle) => {
        try {
            const response = await api.get(`/certificates/${enrollmentId}`, { responseType: 'blob' });
            const url  = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${courseTitle.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('certificate download failed', e);
            addToast('Failed to download certificate. Please try again.', 'error');
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">

            <Toast toasts={toasts} />

            {/* ── Header ── */}
            <div className="mb-10">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-2">
                    Welcome back,{' '}
                    <span className="text-brand-600 dark:text-brand-400">
                        {profileData?.firstName || safeUser.email.split('@')[0]}
                    </span>
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg flex items-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mr-3 tracking-wider ${
                        isAdmin
                            ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                    }`}>
                        {safeUser.role}
                    </span>
                    Your personal learning and upside hub.
                </p>
            </div>

            {/* ══════════════════ ADMIN ══════════════════ */}
            {isAdmin && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">

                    {/* KPI row — live counts, no fake numbers, no colored side borders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Total Students"
                            value={adminStats.students?.toLocaleString()}
                            loading={statsLoading}
                            icon={Users}
                            iconBg="bg-brand-50 dark:bg-brand-900/20"
                            iconColor="text-brand-600 dark:text-brand-400"
                        />
                        <StatCard
                            label="Active Courses"
                            value={adminStats.courses?.toLocaleString()}
                            loading={statsLoading}
                            icon={BookOpen}
                            iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                            iconColor="text-indigo-600 dark:text-indigo-400"
                        />
                        <StatCard
                            label="Pending Enrollments"
                            value={requestedEnrollments.length}
                            loading={isLoadingRequests}
                            icon={AlertCircle}
                            iconBg="bg-accent-50 dark:bg-accent-900/20"
                            iconColor="text-accent-600 dark:text-accent-400"
                        />
                        <StatCard
                            label="Manage Staff"
                            value={null}
                            loading={false}
                            icon={Briefcase}
                            iconBg="bg-amber-50 dark:bg-amber-900/20"
                            iconColor="text-amber-600 dark:text-amber-400"
                            to="/staff"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Enrollment Requests table */}
                        <div className="lg:col-span-2 glass-effect rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center">
                                <GraduationCap className="mr-2 text-brand-500" size={22} />
                                Pending Enrollment Requests
                                {requestedEnrollments.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                                        {requestedEnrollments.length}
                                    </span>
                                )}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                                            <th className="pb-3 px-2 font-bold">Student</th>
                                            <th className="pb-3 px-2 font-bold">Course</th>
                                            <th className="pb-3 px-2 font-bold">Date</th>
                                            <th className="pb-3 px-2 font-bold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                        {isLoadingRequests ? (
                                            <tr><td colSpan="4" className="py-8 text-center">
                                                <Loader2 className="animate-spin mx-auto text-brand-500" />
                                            </td></tr>
                                        ) : requestedEnrollments.length === 0 ? (
                                            <tr><td colSpan="4" className="py-10 text-center">
                                                <CheckCircle2 size={28} className="mx-auto mb-2 text-green-500 opacity-60" />
                                                <p className="text-sm text-zinc-500">All caught up! No pending requests.</p>
                                            </td></tr>
                                        ) : requestedEnrollments.map((req) => {
                                            const busy = !!actionLoading[req.id];
                                            return (
                                                <tr key={req.id} className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                    <td className="py-4 px-2">
                                                        <p className="font-medium text-sm">{req.user.firstName} {req.user.lastName}</p>
                                                        <p className="text-xs text-zinc-500">{req.user.email}</p>
                                                    </td>
                                                    <td className="py-4 px-2 text-sm">{req.qualification.title}</td>
                                                    <td className="py-4 px-2 text-sm text-zinc-500">{new Date(req.requestedAt).toLocaleDateString()}</td>
                                                    <td className="py-4 px-2">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEnrollmentAction(req.id, 'APPROVED')}
                                                                disabled={busy}
                                                                className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                {busy && actionLoading[req.id] === 'APPROVED'
                                                                    ? <Loader2 size={11} className="animate-spin" />
                                                                    : <CheckCircle2 size={11} />}
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleEnrollmentAction(req.id, 'REJECTED')}
                                                                disabled={busy}
                                                                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                {busy && actionLoading[req.id] === 'REJECTED'
                                                                    ? <Loader2 size={11} className="animate-spin" />
                                                                    : <XCircle size={11} />}
                                                                Deny
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right column: Quick Actions + Activity */}
                        <div className="space-y-6">
                            <div className="glass-effect rounded-2xl p-6">
                                <h3 className="text-xl font-bold mb-5 text-zinc-900 dark:text-white">Quick Actions</h3>
                                <div className="space-y-3">
                                    <QuickLink to="/qualifications" icon={Plus}     iconBg="bg-brand-100 dark:bg-brand-900/50"   iconColor="text-brand-600 dark:text-brand-400"   label="Manage Courses" />
                                    <QuickLink to="/trainers"      icon={BookOpen}  iconBg="bg-brand-100 dark:bg-brand-900/50"   iconColor="text-brand-600 dark:text-brand-400"   label="Manage Trainers" />
                                    <QuickLink to="/students"      icon={Users}     iconBg="bg-brand-100 dark:bg-brand-900/50"   iconColor="text-brand-600 dark:text-brand-400"   label="Manage Students" />
                                    {safeUser.role === 'ADMIN' && (
                                        <QuickLink to="/users"     icon={Users}     iconBg="bg-brand-100 dark:bg-brand-900/50"   iconColor="text-brand-600 dark:text-brand-400"   label="Manage Users" />
                                    )}
                                    <QuickLink to="/admin/partners" icon={Heart}    iconBg="bg-emerald-100 dark:bg-emerald-900/50" iconColor="text-emerald-600 dark:text-emerald-400" label="Manage Partners" />
                                    <QuickLink to="/staff"         icon={Briefcase} iconBg="bg-amber-100 dark:bg-amber-900/50"   iconColor="text-amber-600 dark:text-amber-400"   label="Manage Staff" />
                                    <QuickLink to="/admin/settings" icon={Settings} iconBg="bg-amber-100 dark:bg-amber-900/50"   iconColor="text-amber-600 dark:text-amber-400"   label="Landing Page (CMS)" />
                                </div>
                            </div>

                            <div className="glass-effect rounded-2xl p-6">
                                <h3 className="text-xl font-bold mb-5 text-zinc-900 dark:text-white flex items-center">
                                    <Clock className="mr-2 text-zinc-400" size={20} /> Recent Activity
                                </h3>
                                <ActivityFeed items={recentActivity} loading={activityLoading} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════ TRAINER ══════════════════ */}
            {isTrainer && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            label="Assigned Courses"
                            value={trainerData?.assignedCourses?.length ?? 0}
                            loading={!trainerData}
                            icon={BookOpen}
                            iconBg="bg-brand-50 dark:bg-brand-900/20"
                            iconColor="text-brand-600 dark:text-brand-400"
                        />
                        <StatCard
                            label="Pending Enrollment Requests"
                            value={requestedEnrollments.length}
                            loading={isLoadingRequests}
                            icon={AlertCircle}
                            iconBg="bg-accent-50 dark:bg-accent-900/20"
                            iconColor="text-accent-600 dark:text-accent-400"
                        />
                        <StatCard
                            label="Total Students Enrolled"
                            value={trainerData?.assignedCourses?.reduce((acc, c) => acc + (c.enrolledCount || 0), 0) ?? 0}
                            loading={!trainerData}
                            icon={Users}
                            iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                            iconColor="text-indigo-600 dark:text-indigo-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Assigned Courses */}
                        <div className="lg:col-span-2 glass-effect rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center mb-6">
                                <BookOpen className="mr-2 text-brand-500" /> My Teaching Assignments
                            </h3>
                            <div className="space-y-4">
                                {!trainerData ? (
                                    <div className="flex justify-center p-8 text-brand-500"><Loader2 className="animate-spin" /></div>
                                ) : trainerData.assignedCourses?.length > 0 ? (
                                    trainerData.assignedCourses.map(course => (
                                        <div key={course.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col md:flex-row items-start justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 hover:border-brand-500/30 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-zinc-900 dark:text-white">{course.title}</h4>
                                                <p className="text-sm text-zinc-500 font-medium mb-3">{course.code}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                                        {course.enrolledCount ?? 0} Students
                                                    </span>
                                                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded">Active</span>
                                                </div>
                                            </div>
                                            <button className="px-5 py-2 w-full md:w-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                                                Manage Class
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-zinc-500">You are not assigned to any active courses yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: pending requests + activity */}
                        <div className="space-y-6">
                            {requestedEnrollments.length > 0 && (
                                <div className="glass-effect rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white flex items-center gap-2">
                                        <GraduationCap className="text-brand-500" size={20} />
                                        Enrollment Requests
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                                            {requestedEnrollments.length}
                                        </span>
                                    </h3>
                                    <div className="space-y-3">
                                        {requestedEnrollments.map((req) => {
                                            const busy = !!actionLoading[req.id];
                                            return (
                                                <div key={req.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{req.user.firstName} {req.user.lastName}</p>
                                                    <p className="text-xs text-zinc-500 mb-2">{req.qualification.title}</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEnrollmentAction(req.id, 'APPROVED')} disabled={busy}
                                                            className="flex-1 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                                                            {busy && actionLoading[req.id] === 'APPROVED' ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Approve
                                                        </button>
                                                        <button onClick={() => handleEnrollmentAction(req.id, 'REJECTED')} disabled={busy}
                                                            className="flex-1 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                                                            {busy && actionLoading[req.id] === 'REJECTED' ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />} Deny
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="glass-effect rounded-2xl p-6">
                                <h3 className="text-xl font-bold mb-5 text-zinc-900 dark:text-white flex items-center">
                                    <Clock className="mr-2 text-zinc-400" size={20} /> Recent Activity
                                </h3>
                                <ActivityFeed items={recentActivity} loading={activityLoading} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════ STUDENT ══════════════════ */}
            {!isAdmin && !isTrainer && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Active Courses"
                            value={profileData?.enrollments?.filter(e => e.status === 'APPROVED').length ?? 0}
                            loading={!profileData}
                            icon={BookOpen}
                            iconBg="bg-brand-50 dark:bg-brand-900/20"
                            iconColor="text-brand-600 dark:text-brand-400"
                        />
                        <StatCard
                            label="Certificates Earned"
                            value={profileData?.enrollments?.filter(e => e.status === 'COMPLETED').length ?? 0}
                            loading={!profileData}
                            icon={Award}
                            iconBg="bg-accent-50 dark:bg-accent-900/20"
                            iconColor="text-accent-600 dark:text-accent-400"
                        />
                        <StatCard
                            label="Hours Logged"
                            value={12}
                            loading={false}
                            icon={Clock}
                            iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                            iconColor="text-indigo-600 dark:text-indigo-400"
                        />
                        <StatCard
                            label="Job Applications"
                            value={0}
                            loading={false}
                            icon={Briefcase}
                            iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                            iconColor="text-emerald-600 dark:text-emerald-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* My Learning Path */}
                        <div className="lg:col-span-2 glass-effect rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">My Learning Path</h3>
                                <Link to="/qualifications" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Browse more →</Link>
                            </div>
                            <div className="space-y-4">
                                {!profileData ? (
                                    <div className="flex justify-center p-8 text-brand-500"><Loader2 className="animate-spin" /></div>
                                ) : profileData.enrollments?.length > 0 ? (
                                    profileData.enrollments.map(enrollment => (
                                        <div key={enrollment.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 hover:border-brand-500/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/50 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                                                    {enrollment.status === 'COMPLETED' ? <Award size={24} /> : <BookOpen size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 dark:text-white">{enrollment.qualification.title}</h4>
                                                    <p className="text-sm text-zinc-500 mb-2">
                                                        {enrollment.status === 'COMPLETED'  ? 'Successfully Certified'
                                                        : enrollment.status === 'APPROVED'  ? 'Currently Enrolled'
                                                        : enrollment.status === 'PENDING'   ? 'Awaiting Application Approval'
                                                        : 'Enrollment Status: ' + enrollment.status}
                                                    </p>
                                                    {enrollment.status === 'APPROVED' && (
                                                        <>
                                                            <div className="w-full md:w-48 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mb-1">
                                                                <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '45%' }} />
                                                            </div>
                                                            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">45% Completed</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {enrollment.status === 'COMPLETED' ? (
                                                <button
                                                    onClick={() => handleDownloadCertificate(enrollment.id, enrollment.qualification.title)}
                                                    className="flex items-center gap-2 px-5 py-2 w-full md:w-auto bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all hover:scale-[1.02] shadow-sm"
                                                >
                                                    <Download size={18} /> Download Certificate
                                                </button>
                                            ) : enrollment.status === 'APPROVED' ? (
                                                <button className="px-5 py-2 w-full md:w-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                                                    Resume Course
                                                </button>
                                            ) : (
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                                    enrollment.status === 'PENDING'
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}>{enrollment.status}</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-zinc-500 italic">You haven't enrolled in any courses yet.</p>
                                        <Link to="/qualifications" className="text-brand-600 dark:text-brand-400 text-sm font-bold mt-2 inline-block">Start Learning Now</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity feed */}
                        <div className="glass-effect rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center">
                                <Clock className="mr-2 text-zinc-400" size={20} /> Activity
                            </h3>
                            <ActivityFeed items={recentActivity} loading={activityLoading} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
