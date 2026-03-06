import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Loader2, Edit2, Trash2, User, X, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

const STATUS_COLORS = {
    POOL: 'bg-zinc-100 text-zinc-800 border-[1px] border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    ENROLLED: 'bg-blue-100 text-blue-800 border-[1px] border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    GRADUATED: 'bg-green-100 text-green-800 border-[1px] border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
    DEBARRED: 'bg-red-100 text-red-800 border-[1px] border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800'
};

const Students = () => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        studentStatus: 'POOL'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // debounce fetch
        const delayDebounceFn = setTimeout(() => {
            fetchStudents();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, statusFilter]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            let url = '/users/students';
            const params = new URLSearchParams();
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            if (statusFilter !== 'ALL') {
                params.append('status', statusFilter);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const res = await api.get(url);
            setStudents(res.data);
            setError('');
        } catch (err) {
            console.error('Failed to load students:', err);
            setError('Failed to load students. You may not have proper permissions.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (student) => {
        setEditingId(student.id);
        setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            email: student.email,
            studentStatus: student.studentStatus || 'POOL'
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.put(`/users/students/${editingId}`, formData);
            setStudents(students.map(s => s.id === editingId ? { ...s, ...res.data } : s));
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to update student', err);
            alert(err.response?.data?.error || 'Failed to update student. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure you want to completely delete this student record? This will also remove their enrollments and logs.')) return;
        try {
            await api.delete(`/users/students/${id}`);
            setStudents(students.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete student', err);
            alert('Failed to delete student record.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <UsersIcon className="mr-4 text-brand-600 dark:text-brand-400" size={40} />
                        Students Directory
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        Manage registered students, track their enrollment status, and update records.
                    </p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    />
                </div>

                <div className="relative w-full sm:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-zinc-400" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors cursor-pointer appearance-none"
                    >
                        <option value="ALL">All Status</option>
                        <option value="POOL">Pool</option>
                        <option value="ENROLLED">Enrolled</option>
                        <option value="GRADUATED">Graduated</option>
                        <option value="DEBARRED">Debarred</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand-600 dark:text-brand-400">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p className="font-medium">Loading students directory...</p>
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                        <UsersIcon size={32} className="text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Students Found</h3>
                    <p className="text-zinc-500">Adjust your filters or wait for learners to register.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Learner</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                {students.map((s) => (
                                    <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold overflow-hidden">
                                                    {s.profilePhoto ? (
                                                        <img src={s.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{s.firstName ? s.firstName[0] : <User size={18} />}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                                        {s.firstName} {s.lastName}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-zinc-900 dark:text-zinc-300">{s.contact || <span className="text-zinc-400 italic">Not provided</span>}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[s.studentStatus] || STATUS_COLORS.POOL}`}>
                                                {s.studentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openModal(s)}
                                                className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 mr-4 transition-colors p-1"
                                                title="Edit Status"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm overflow-y-auto w-full">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 my-8">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                Update Student Status
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Learner</label>
                                    <div className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 text-sm">
                                        <span className="font-bold text-zinc-900 dark:text-white">{formData.firstName} {formData.lastName}</span>
                                        <br />
                                        {formData.email}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Student Status <span className="text-brand-500">*</span></label>
                                    <select
                                        value={formData.studentStatus}
                                        onChange={(e) => setFormData({ ...formData, studentStatus: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white font-medium cursor-pointer"
                                    >
                                        <option value="POOL">Pool (Unenrolled)</option>
                                        <option value="ENROLLED">Enrolled in Course</option>
                                        <option value="GRADUATED">Graduated</option>
                                        <option value="DEBARRED">Debarred / Dropped</option>
                                    </select>
                                    <p className="text-xs text-zinc-500 mt-2">
                                        Updating this status will be permanently recorded in the system audit logs.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-zinc-900 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-lg font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/20 flex items-center"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Save Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
