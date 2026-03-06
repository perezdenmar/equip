import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Loader2, Edit2, Trash2, User, X, Plus, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

const Trainers = () => {
    const { t } = useTranslation();
    const [trainers, setTrainers] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        assignedCourseIds: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dropdown state for course assignment
    const [courseSearchQuery, setCourseSearchQuery] = useState('');
    const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [trainersRes, qualsRes] = await Promise.all([
                api.get('/users/trainers'),
                api.get('/qualifications')
            ]);
            setTrainers(trainersRes.data);
            setAvailableCourses(qualsRes.data);
            setError('');
        } catch (err) {
            console.error('Failed to load data details:', err.response?.data || err.message);
            setError('Failed to load trainers. You may not have Admin permissions.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (trainer = null) => {
        if (trainer) {
            setEditingId(trainer.id);
            setFormData({
                firstName: trainer.firstName || '',
                lastName: trainer.lastName || '',
                email: trainer.email || '',
                contact: trainer.contact || '',
                assignedCourseIds: trainer.assignedCourses ? trainer.assignedCourses.map(c => c.id) : []
            });
        } else {
            setEditingId(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                contact: '',
                assignedCourseIds: []
            });
        }
        setCourseSearchQuery('');
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                const res = await api.put(`/users/trainers/${editingId}`, formData);
                setTrainers(trainers.map(t => t.id === editingId ? { ...t, ...res.data } : t));
            } else {
                const res = await api.post('/users/trainers', formData);
                setTrainers([...trainers, res.data]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save trainer', err);
            alert(err.response?.data?.error || 'Failed to save trainer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure you want to remove this trainer from the system?')) return;
        try {
            await api.delete(`/users/${id}`);
            setTrainers(trainers.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete trainer', err);
            alert('Failed to delete trainer. They might be tied to existing active records.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <UsersIcon className="mr-4 text-brand-600 dark:text-brand-400" size={40} />
                        Trainers Management
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        Register new trainers, manage their contact information, and assign them to active qualifications.
                    </p>
                </div>

                <button
                    onClick={() => openModal()}
                    className="mt-6 md:mt-0 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-brand-500/20 flex items-center shrink-0"
                >
                    <Plus size={20} className="mr-2" />
                    Add Trainer
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand-600 dark:text-brand-400">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p className="font-medium">Loading trainers directory...</p>
                </div>
            ) : trainers.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                        <UsersIcon size={32} className="text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Trainers Registered</h3>
                    <p className="text-zinc-500">Click "Add Trainer" to onboard your first instructor.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Instructor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Assigned Courses</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                {trainers.map((t) => (
                                    <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold overflow-hidden">
                                                    {t.profilePhoto ? (
                                                        <img src={t.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{t.firstName ? t.firstName[0] : <User size={18} />}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                                        {t.firstName} {t.lastName}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">{t.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-zinc-900 dark:text-zinc-300">{t.contact || <span className="text-zinc-400 italic">Not provided</span>}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {t.assignedCourses && t.assignedCourses.length > 0 ? (
                                                    t.assignedCourses.map(c => (
                                                        <span key={c.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 ring-1 ring-inset ring-zinc-500/20">
                                                            <BookOpen size={10} className="mr-1 opacity-50" /> {c.code || c.title}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-zinc-500 italic">No courses assigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openModal(t)}
                                                className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 mr-4 transition-colors p-1"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
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

            {/* Add/Edit Trainer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 my-8">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {editingId ? 'Edit Trainer Profile' : 'Register New Trainer'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-40">

                                <div className="space-y-4">
                                    <h3 className="font-bold text-zinc-900 dark:text-white flex items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        <User size={16} className="mr-2 text-brand-500" /> Personal Details
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email <span className="text-brand-500">*</span></label>
                                        <input
                                            type="email"
                                            required
                                            disabled={!!editingId}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="trainer@gmail.com"
                                        />
                                        {!editingId && <p className="text-xs text-zinc-500 mt-1">Trainers will use this Gmail address to log in.</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">First Name <span className="text-brand-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Last Name <span className="text-brand-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contact Number</label>
                                        <input
                                            type="text"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                            placeholder="+63 900 000 0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-zinc-900 dark:text-white flex items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        <BookOpen size={16} className="mr-2 text-brand-500" /> Teaching Assignments
                                    </h3>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Assigned Courses (Optional)</label>

                                        {/* Course Dropdown Toggle / Search Input */}
                                        <div
                                            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 transition-all flex flex-wrap items-center p-1.5 focus-within:ring-2 focus-within:ring-brand-500 cursor-text min-h-[46px]"
                                            onClick={() => setIsCourseDropdownOpen(true)}
                                        >
                                            {formData.assignedCourseIds.map(id => {
                                                const c = availableCourses.find(course => course.id === id);
                                                if (!c) return null;
                                                return (
                                                    <span key={id} className="m-1 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                                                        {c.code || c.title}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFormData(prev => ({
                                                                    ...prev, assignedCourseIds: prev.assignedCourseIds.filter(cid => cid !== id)
                                                                }));
                                                            }}
                                                            className="ml-1 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-200 focus:outline-none"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                            <input
                                                type="text"
                                                value={courseSearchQuery}
                                                onChange={(e) => {
                                                    setCourseSearchQuery(e.target.value);
                                                    setIsCourseDropdownOpen(true);
                                                }}
                                                placeholder={formData.assignedCourseIds.length === 0 ? "Search or select courses..." : ""}
                                                className="flex-grow p-1 min-w-[120px] bg-transparent outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400"
                                            />
                                        </div>

                                        {/* Dropdown Auto-Complete List */}
                                        {isCourseDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsCourseDropdownOpen(false)}
                                                />
                                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto left-0">
                                                    {availableCourses.length === 0 ? (
                                                        <div className="p-4 text-sm text-zinc-500 italic text-center">No active courses available in the system.</div>
                                                    ) : (
                                                        availableCourses
                                                            .filter(c => `${c.title} ${c.code}`.toLowerCase().includes(courseSearchQuery.toLowerCase()))
                                                            .map(course => {
                                                                const isSelected = formData.assignedCourseIds.includes(course.id);
                                                                return (
                                                                    <div
                                                                        key={course.id}
                                                                        onClick={() => {
                                                                            if (!isSelected && formData.assignedCourseIds.length >= 3) {
                                                                                alert('A trainer can handle a maximum of 3 courses simultaneously.');
                                                                                return;
                                                                            }
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                assignedCourseIds: isSelected
                                                                                    ? prev.assignedCourseIds.filter(id => id !== course.id)
                                                                                    : [...prev.assignedCourseIds, course.id]
                                                                            }));
                                                                            setCourseSearchQuery('');
                                                                        }}
                                                                        className={`flex items-start space-x-3 cursor-pointer p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors border-b border-zinc-100 dark:border-zinc-700/50 last:border-0 ${isSelected ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
                                                                    >
                                                                        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center ${isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                                                            {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{course.title}</p>
                                                                            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-0.5">{course.code}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        <p className="text-xs text-zinc-500 mt-2">
                                            A trainer can handle one to three courses simultaneously. Each course represents a batch of up to 25 students.
                                        </p>
                                    </div>
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
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                                    {editingId ? 'Save Changes' : 'Register Trainer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trainers;
