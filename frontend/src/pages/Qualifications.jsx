import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Loader2, Plus, Edit2, Trash2, X, Clock, User, Target, Layers, Bell, Calendar, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

const Qualifications = () => {
    const { t } = useTranslation();
    const [qualifications, setQualifications] = useState([]);
    const [availableTrainers, setAvailableTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // PQF Autocomplete State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        code: '',
        description: '',
        trainerIds: [],
        duration: '',
        level: 'BEGINNER',
        category: '',
        status: 'COMING_SOON',
        startDate: '',
        endDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Trainer Search State
    const [trainerSearchQuery, setTrainerSearchQuery] = useState('');
    const [isTrainerDropdownOpen, setIsTrainerDropdownOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem('user')) || { role: 'GUEST' };
    const isAdminOrTrainer = user && (user.role === 'ADMIN' || user.role === 'TRAINER');
    const isStudent = user && user.role === 'STUDENT';

    useEffect(() => {
        fetchQualifications();
        if (isAdminOrTrainer) {
            fetchTrainers();
        }
    }, [isAdminOrTrainer]);

    const fetchQualifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/qualifications');
            setQualifications(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to load qualifications', err);
            setError('Failed to load qualifications. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainers = async () => {
        try {
            const res = await api.get('/users/trainers');
            setAvailableTrainers(res.data);
        } catch (err) {
            console.error('Failed to load trainers', err);
        }
    };

    const handleSearchPqf = async (query) => {
        setSearchQuery(query);
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await api.get(`/qualifications/official/search?q=${query}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error('Failed to search PQF', err);
        } finally {
            setIsSearching(false);
        }
    };

    const selectOfficialPqf = (qual) => {
        setFormData({
            ...formData,
            title: qual.title,
            code: qual.code,
            description: qual.descriptor || formData.description,
            category: formData.category || '' // Allow user to fill
        });
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this qualification?')) return;

        try {
            await api.delete(`/qualifications/${id}`);
            setQualifications(qualifications.filter(q => q.id !== id));
        } catch (err) {
            console.error('Failed to delete qualification', err);
            alert(err.response?.data?.error || 'Failed to delete qualification.');
        }
    };

    const openModal = (qual = null) => {
        if (qual) {
            setEditingId(qual.id);
            setFormData({
                title: qual.title,
                code: qual.code,
                description: qual.description || '',
                trainerIds: qual.trainers ? qual.trainers.map(t => t.id) : [],
                duration: qual.duration || '',
                level: qual.level || 'BEGINNER',
                category: qual.category || '',
                status: qual.status || 'COMING_SOON',
                startDate: qual.startDate ? new Date(qual.startDate).toISOString().split('T')[0] : '',
                endDate: qual.endDate ? new Date(qual.endDate).toISOString().split('T')[0] : '',
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                code: '',
                description: '',
                trainerIds: [],
                duration: '',
                level: 'BEGINNER',
                category: '',
                status: 'COMING_SOON',
                startDate: '',
                endDate: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingId) {
                const res = await api.put(`/qualifications/${editingId}`, formData);
                setQualifications(qualifications.map(q => q.id === editingId ? res.data : q));
            } else {
                const res = await api.post('/qualifications', formData);
                setQualifications([res.data, ...qualifications]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save qualification', err);
            alert(err.response?.data?.error || 'Failed to save qualification.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWishlistAdd = async (qualificationId) => {
        try {
            await api.post('/wishlist', { qualificationId });
            alert('Added to wishlist! You will be notified when this course opens.');
        } catch (err) {
            console.error('Failed to add to wishlist', err);
            alert(err.response?.data?.error || 'Failed to add to wishlist.');
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'COMING_SOON': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'CLOSED': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
        }
    };

    const getLevelBadgeColor = (level) => {
        switch (level) {
            case 'ADVANCED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'INTERMEDIATE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <GraduationCap className="mr-4 text-brand-600 dark:text-brand-400" size={40} />
                        Qualifications
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        Browse our comprehensive list of available upskilling courses and request enrollment to start your journey.
                    </p>
                </div>

                {isAdminOrTrainer && (
                    <button
                        onClick={() => openModal()}
                        className="mt-6 md:mt-0 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-brand-500/20 flex items-center shrink-0"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Course
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand-600 dark:text-brand-400">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p className="font-medium">Loading courses...</p>
                </div>
            ) : qualifications.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                        <BookOpen size={32} className="text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No qualifications available</h3>
                    <p className="text-zinc-500">Check back later for new course offerings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {qualifications.map(qual => (
                        <div key={qual.id} className="glass-effect rounded-2xl flex flex-col h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-xl hover:border-brand-500/30 transition-all group">
                            {/* Course Banner Placeholder */}
                            <div className="h-32 bg-gradient-to-r from-brand-600 to-accent-600 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10"></div>
                                {/* Top Badges */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                    <span className="px-3 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-brand-700 dark:text-brand-300 text-xs font-bold rounded-full tracking-wider uppercase shadow-sm">
                                        {qual.code}
                                    </span>

                                    {isAdminOrTrainer && (
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(qual)} className="p-1.5 text-zinc-700 hover:text-brand-600 bg-white/90 backdrop-blur-sm rounded-md shadow-sm transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(qual.id)} className="p-1.5 text-zinc-700 hover:text-red-600 bg-white/90 backdrop-blur-sm rounded-md shadow-sm transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-sm ${getStatusBadgeColor(qual.status)}`}>
                                        {qual.status?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-3 float-left flex-wrap">
                                    {qual.category && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                            <Layers size={12} className="mr-1" /> {qual.category}
                                        </span>
                                    )}
                                    {qual.level && (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold  ${getLevelBadgeColor(qual.level)}`}>
                                            <Target size={12} className="mr-1" /> {qual.level}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                                    {qual.title}
                                </h3>

                                <div className="grid grid-cols-2 gap-y-2 mb-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    {qual.trainers && qual.trainers.length > 0 && (
                                        <div className="flex items-start col-span-2 mb-1">
                                            <User size={14} className="mr-1.5 mt-0.5 text-zinc-400 shrink-0" />
                                            <span className="line-clamp-2">
                                                {qual.trainers.map(t => `${t.firstName || ''} ${t.lastName || ''}`).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    {qual.startDate && (
                                        <div className="flex items-center"><Calendar size={14} className="mr-1.5 text-zinc-400" /> <span className="truncate">{new Date(qual.startDate).toLocaleDateString()}</span></div>
                                    )}
                                </div>

                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 flex-grow line-clamp-3">
                                    {qual.description || "No description provided for this course."}
                                </p>

                                {isStudent && (
                                    <div className="mt-auto space-y-3">
                                        {qual.status === 'OPEN' ? (
                                            <button
                                                onClick={() => handleEnrollRequest(qual.id)}
                                                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={18} />
                                                Request Enrollment
                                            </button>
                                        ) : qual.status === 'COMING_SOON' ? (
                                            <button
                                                onClick={() => handleWishlistAdd(qual.id)}
                                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                                            >
                                                <Bell size={18} />
                                                Add to Wish List
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 rounded-lg font-bold cursor-not-allowed"
                                            >
                                                Enrollment Closed
                                            </button>
                                        )}
                                    </div>
                                )}
                                {!user || user.role === 'GUEST' ? (
                                    <button
                                        onClick={() => window.location.href = '/login'}
                                        className="mt-auto w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold transition-colors shadow-md"
                                    >
                                        Log in to Enroll
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 my-8">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {editingId ? 'Edit Course Details' : 'Design New Course'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6">
                            {/* PQF Autocomplete Search */}
                            <div className="mb-6 relative z-50">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Search Official PQF Qualification <span className="text-brand-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by title or code (e.g., NC II)"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchPqf(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-900/10 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                    />
                                    {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-500" size={16} />}

                                    {searchResults.length > 0 && (
                                        <div className="absolute w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {searchResults.map(res => (
                                                <button
                                                    key={res.id}
                                                    type="button"
                                                    onClick={() => selectOfficialPqf(res)}
                                                    className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-b border-zinc-100 dark:border-zinc-700/50 last:border-0"
                                                >
                                                    <div className="font-bold text-sm text-zinc-900 dark:text-white">{res.title}</div>
                                                    <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">{res.code}</div>
                                                    {res.descriptor && <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{res.descriptor}</div>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Qualifications must be selected from the official Philippine Qualifications Framework registry.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-40">
                                {/* Left Column */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Course Title</label>
                                        <input
                                            type="text"
                                            required
                                            readOnly
                                            value={formData.title}
                                            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Code</label>
                                            <input
                                                type="text"
                                                required
                                                readOnly
                                                value={formData.code}
                                                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                                placeholder="e.g. IT & Software"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                                        <textarea
                                            rows="5"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white resize-none"
                                            placeholder="Briefly describe what students will learn..."
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-5">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Assigned Trainers</label>

                                        {/* Dropdown Toggle / Search Input */}
                                        <div
                                            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 transition-all flex flex-wrap items-center p-1.5 focus-within:ring-2 focus-within:ring-brand-500 cursor-text"
                                            onClick={() => setIsTrainerDropdownOpen(true)}
                                        >
                                            {formData.trainerIds.map(id => {
                                                const t = availableTrainers.find(trainer => trainer.id === id);
                                                if (!t) return null;
                                                return (
                                                    <span key={id} className="m-1 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                                                        {t.firstName} {t.lastName}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFormData(prev => ({
                                                                    ...prev, trainerIds: prev.trainerIds.filter(tid => tid !== id)
                                                                }));
                                                            }}
                                                            className="ml-1 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-200"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                            <input
                                                type="text"
                                                value={trainerSearchQuery}
                                                onChange={(e) => {
                                                    setTrainerSearchQuery(e.target.value);
                                                    setIsTrainerDropdownOpen(true);
                                                }}
                                                placeholder={formData.trainerIds.length === 0 ? "Search or select trainers..." : ""}
                                                className="flex-grow p-1 min-w-[120px] bg-transparent outline-none text-sm text-zinc-900 dark:text-white"
                                            />
                                        </div>

                                        {/* Dropdown Auto-Complete List */}
                                        {isTrainerDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsTrainerDropdownOpen(false)}
                                                />
                                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                    {availableTrainers.length === 0 ? (
                                                        <div className="p-3 text-sm text-zinc-500 italic">No trainers available in the system.</div>
                                                    ) : (
                                                        availableTrainers
                                                            .filter(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(trainerSearchQuery.toLowerCase()))
                                                            .map(trainer => {
                                                                const isSelected = formData.trainerIds.includes(trainer.id);
                                                                return (
                                                                    <div
                                                                        key={trainer.id}
                                                                        onClick={() => {
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                trainerIds: isSelected
                                                                                    ? prev.trainerIds.filter(id => id !== trainer.id)
                                                                                    : [...prev.trainerIds, trainer.id]
                                                                            }));
                                                                            setTrainerSearchQuery('');
                                                                            // Keep open to allow multi-select smoothly
                                                                        }}
                                                                        className={`flex items-center space-x-3 cursor-pointer p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors ${isSelected ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                                                            {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                                                                                {(trainer.firstName?.[0] || '?')}{(trainer.lastName?.[0] || '')}
                                                                            </div>
                                                                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{trainer.firstName} {trainer.lastName}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                    )}
                                                    {availableTrainers.filter(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(trainerSearchQuery.toLowerCase())).length === 0 && availableTrainers.length > 0 && (
                                                        <div className="p-3 text-sm text-zinc-500 italic">No matching trainers found.</div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Expected Duration</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                            <input
                                                type="text"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                                placeholder="e.g. 40 Hours"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Difficulty Level</label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white appearance-none"
                                        >
                                            <option value="BEGINNER">🟢 Beginner</option>
                                            <option value="INTERMEDIATE">🟠 Intermediate</option>
                                            <option value="ADVANCED">🔴 Advanced</option>
                                        </select>
                                    </div>
                                    <div className="pt-2">
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Course Availability</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['OPEN', 'COMING_SOON', 'CLOSED'].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: s })}
                                                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${formData.status === s
                                                        ? 'bg-brand-600 border-brand-600 text-white shadow-md'
                                                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-brand-500'}`}
                                                >
                                                    {s.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                <input
                                                    type="date"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                <input
                                                    type="date"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
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
                                    {editingId ? 'Save Changes' : 'Publish Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Qualifications;
