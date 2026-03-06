import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Award, Clock, Briefcase, FileText, Settings, Users, AlertCircle, Plus, Download, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const safeUser = user || { role: 'STUDENT', email: 'user@example.com' };
    const isAdmin = safeUser.role === 'ADMIN';
    const isTrainer = safeUser.role === 'TRAINER';

    const [trainerData, setTrainerData] = useState(null);
    const [profileData, setProfileData] = useState(null);

    const [recentActivity, setRecentActivity] = useState([]);
    const [requestedEnrollments, setRequestedEnrollments] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);

    useEffect(() => {
        fetchProfileData();
        fetchRecentActivity();
        if (isTrainer) {
            fetchTrainerData();
        }
        if (isAdmin || isTrainer) {
            fetchEnrollmentRequests();
        }
    }, [isAdmin, isTrainer]);

    const fetchRecentActivity = async () => {
        try {
            const res = await api.get('/enrollments/activity');
            const mapped = res.data.map(act => ({
                ...act,
                icon: act.action === 'ENROLLMENT_REQUEST' ? <BookOpen size={16} /> :
                    act.action.includes('PROFILE') ? <Settings size={16} /> :
                        <BookOpen size={16} />,
                time: new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' +
                    new Date(act.time).toLocaleDateString()
            }));
            setRecentActivity(mapped);
        } catch (error) {
            console.error('Failed to load activity', error);
        }
    };

    const fetchProfileData = async () => {
        try {
            const res = await api.get('/auth/me');
            setProfileData(res.data);
        } catch (error) {
            console.error('Failed to load profile data', error);
        }
    };

    const fetchTrainerData = async () => {
        try {
            const res = await api.get('/users/trainers');
            const myTrainerRecord = res.data.find(t => t.email === safeUser.email);
            setTrainerData(myTrainerRecord);
        } catch (error) {
            console.error('Failed to load trainer data', error);
        }
    };

    const handleDownloadCertificate = async (enrollmentId, courseTitle) => {
        try {
            const response = await api.get(`/certificates/${enrollmentId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${courseTitle.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download certificate', error);
        }
    };

    const fetchEnrollmentRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const res = await api.get('/enrollments');
            setRequestedEnrollments(res.data);
        } catch (error) {
            console.error('Failed to load enrollment requests', error);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleEnrollmentAction = async (id, status) => {
        try {
            await api.patch(`/enrollments/${id}/status`, { status });
            // Remove from list or update local state
            setRequestedEnrollments(prev => prev.filter(req => req.id !== id));
            // Trigger activity refresh
            fetchRecentActivity();
        } catch (error) {
            console.error('Failed to update enrollment', error);
            alert('Failed to update enrollment status');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-2">
                    Welcome back, <span className="text-brand-600 dark:text-brand-400">{profileData?.firstName || user.email.split('@')[0]}</span>
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg flex items-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mr-3 tracking-wider
                        ${isAdmin ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'}`}>
                        {user.role}
                    </span>
                    Your personal learning and upside hub.
                </p>
            </div>

            {/* Admin / Trainer Dashboard View */}
            {isAdmin && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-effect p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-brand-500">
                            <div>
                                <p className="text-zinc-500 text-sm font-medium mb-1">Total Students</p>
                                <h3 className="text-3xl font-display font-bold text-zinc-900 dark:text-white">1,248</h3>
                            </div>
                            <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                                <Users size={28} />
                            </div>
                        </div>
                        <Link to="/staff" className="glass-effect p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500 hover:scale-[1.02] transition-transform">
                            <div>
                                <p className="text-zinc-500 text-sm font-medium mb-1">Manage Staff</p>
                                <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white flex items-center">
                                    View All <ArrowRight size={16} className="ml-2" />
                                </h3>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                                <Briefcase size={28} />
                            </div>
                        </Link>
                        <div className="glass-effect p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-accent-500">
                            <div>
                                <p className="text-zinc-500 text-sm font-medium mb-1">Pending Enrollments</p>
                                <h3 className="text-3xl font-display font-bold text-zinc-900 dark:text-white">{requestedEnrollments.length}</h3>
                            </div>
                            <div className="p-4 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-accent-600 dark:text-accent-400">
                                <AlertCircle size={28} />
                            </div>
                        </div>
                        <div className="glass-effect p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-indigo-500">
                            <div>
                                <p className="text-zinc-500 text-sm font-medium mb-1">Active Courses</p>
                                <h3 className="text-3xl font-display font-bold text-zinc-900 dark:text-white">12</h3>
                            </div>
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <BookOpen size={28} />
                            </div>
                        </div>
                        <Link to="/admin/settings" className="glass-effect p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500 hover:shadow-lg transition-all group cursor-pointer group">
                            <div>
                                <p className="text-zinc-500 text-sm font-medium mb-1">Landing Page</p>
                                <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">Settings (CMS)</h3>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                                <Settings size={28} />
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Pending Requests */}
                        <div className="lg:col-span-2 glass-effect rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center">
                                <Award className="mr-2 text-brand-500" />
                                Recent Enrollment Requests
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm uppercase tracking-wider">
                                            <th className="pb-3 px-2 font-medium">Student</th>
                                            <th className="pb-3 px-2 font-medium">Course</th>
                                            <th className="pb-3 px-2 font-medium">Date</th>
                                            <th className="pb-3 px-2 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                        {isLoadingRequests ? (
                                            <tr><td colSpan="4" className="py-8 text-center text-zinc-500 italic">Loading requests...</td></tr>
                                        ) : requestedEnrollments.length === 0 ? (
                                            <tr><td colSpan="4" className="py-8 text-center text-zinc-500 italic">No pending enrollment requests.</td></tr>
                                        ) : requestedEnrollments.map(req => (
                                            <tr key={req.id} className="text-zinc-700 dark:text-zinc-300">
                                                <td className="py-4 px-2 font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{req.user.firstName} {req.user.lastName}</span>
                                                        <span className="text-xs text-zinc-500">{req.user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2">{req.qualification.title}</td>
                                                <td className="py-4 px-2 text-sm text-zinc-500">{new Date(req.requestedAt).toLocaleDateString()}</td>
                                                <td className="py-4 px-2">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEnrollmentAction(req.id, 'APPROVED')}
                                                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleEnrollmentAction(req.id, 'REJECTED')}
                                                            className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                        >
                                                            Deny
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="glass-effect rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Quick Actions</h3>
                            <div className="space-y-4">
                                <Link to="/qualifications" className="flex items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                                    <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                        <Plus size={20} />
                                    </div>
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Courses</div>
                                </Link>
                                <Link to="/trainers" className="w-full flex items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                                    <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Trainers</div>
                                </Link>
                                <Link to="/students" className="w-full flex items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                                    <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                        <Users size={20} />
                                    </div>
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Students</div>
                                </Link>
                                {/* Only ADMIN can manage users/roles */}
                                {user.role === 'ADMIN' && (
                                    <Link to="/users" className="w-full flex items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                                        <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                            <Users size={20} />
                                        </div>
                                        <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Users</div>
                                    </Link>
                                )}
                                <Link to="/staff" className="w-full flex items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg mr-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Staff</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Trainer Dashboard View */}
            {isTrainer && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="glass-effect p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-brand-500">
                            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400 w-max mb-4">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">
                                    {trainerData?.assignedCourses?.length || 0}
                                </h3>
                                <p className="text-zinc-500 text-sm font-medium">Assigned Courses</p>
                            </div>
                        </div>
                        <div className="glass-effect p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-accent-500">
                            <div className="p-3 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-accent-600 dark:text-accent-400 w-max mb-4">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">0</h3>
                                <p className="text-zinc-500 text-sm font-medium">Total Enrolled Students</p>
                            </div>
                        </div>
                        <div className="glass-effect p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-indigo-500">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 w-max mb-4">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">0</h3>
                                <p className="text-zinc-500 text-sm font-medium">Hours Taught</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Assigned Courses List */}
                        <div className="lg:col-span-2 glass-effect rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
                                    <BookOpen className="mr-2 text-brand-500" />
                                    My Teaching Assignments
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {!trainerData ? (
                                    <div className="flex justify-center p-8 text-brand-500"><Loader2 className="animate-spin" /></div>
                                ) : trainerData.assignedCourses && trainerData.assignedCourses.length > 0 ? (
                                    trainerData.assignedCourses.map(course => (
                                        <div key={course.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col md:flex-row items-start justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 hover:border-brand-500/30 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-zinc-900 dark:text-white">{course.title}</h4>
                                                <p className="text-sm text-zinc-500 font-medium mb-3">{course.code}</p>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">0 Students</span>
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

                        {/* Quick Links / Activity */}
                        <div className="glass-effect rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center">
                                <Users className="mr-2 text-brand-500" />
                                Student Management
                            </h3>
                            <div className="space-y-4">
                                <Link to="/students" className="w-full flex items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                                    <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                        <Users size={20} />
                                    </div>
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200">View Students Directory</div>
                                </Link>
                            </div>

                            <h3 className="text-xl font-bold my-6 text-zinc-900 dark:text-white flex items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <Clock className="mr-2 text-zinc-400" />
                                Recent Updates
                            </h3>
                            <div className="text-center p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-sm text-zinc-500 italic">No recent activity to display.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Dashboard View */}
            {!isAdmin && !isTrainer && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-effect p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-brand-500">
                            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400 w-max mb-4">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">1</h3>
                                <p className="text-zinc-500 text-sm font-medium">Active Course</p>
                            </div>
                        </div>
                        <div className="glass-effect p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-accent-500">
                            <div className="p-3 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-accent-600 dark:text-accent-400 w-max mb-4">
                                <Award size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">
                                    {profileData?.enrollments?.filter(e => e.status === 'COMPLETED').length || 0}
                                </h3>
                                <p className="text-zinc-500 text-sm font-medium">Certificates Earned</p>
                            </div>
                        </div>
                        <div className="glass-effect p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-indigo-500">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 w-max mb-4">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">12</h3>
                                <p className="text-zinc-500 text-sm font-medium">Hours Logged</p>
                            </div>
                        </div>
                        <div className="glass-effect p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-emerald-500">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 w-max mb-4">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-white">0</h3>
                                <p className="text-zinc-500 text-sm font-medium">Job Applications</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Current Courses */}
                        <div className="lg:col-span-2 glass-effect rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">My Learning Path</h3>
                                <Link to="/qualifications" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Browse more →</Link>
                            </div>

                            <div className="space-y-4">
                                {!profileData ? (
                                    <div className="flex justify-center p-8 text-brand-500"><Loader2 className="animate-spin" /></div>
                                ) : profileData.enrollments && profileData.enrollments.length > 0 ? (
                                    profileData.enrollments.map(enrollment => (
                                        <div key={enrollment.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 transition-colors hover:border-brand-500/30">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/50 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                                                    {enrollment.status === 'COMPLETED' ? <Award size={24} /> : <BookOpen size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 dark:text-white">{enrollment.qualification.title}</h4>
                                                    <p className="text-sm text-zinc-500 mb-2">
                                                        {enrollment.status === 'COMPLETED'
                                                            ? 'Successfully Certified'
                                                            : enrollment.status === 'APPROVED'
                                                                ? 'Currently Enrolled'
                                                                : enrollment.status === 'PENDING'
                                                                    ? 'Awaiting Application Approval'
                                                                    : 'Enrollment Status: ' + enrollment.status}
                                                    </p>

                                                    {enrollment.status === 'APPROVED' && (
                                                        <>
                                                            <div className="w-full md:w-48 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mb-1">
                                                                <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
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
                                                    <Download size={18} />
                                                    Download Certificate
                                                </button>
                                            ) : enrollment.status === 'APPROVED' ? (
                                                <button className="px-5 py-2 w-full md:w-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                                                    Resume Course
                                                </button>
                                            ) : (
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full
                                                    ${enrollment.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                    {enrollment.status}
                                                </span>
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

                        {/* Recent Activity */}
                        <div className="glass-effect rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center">
                                <Clock className="mr-2 text-zinc-400" />
                                Activity
                            </h3>
                            <div className="space-y-6">
                                {recentActivity.map((activity, index) => (
                                    <div key={activity.id} className="flex relative">
                                        {index !== recentActivity.length - 1 && (
                                            <div className="absolute left-[11px] top-6 w-[2px] h-full bg-zinc-200 dark:bg-zinc-800"></div>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
