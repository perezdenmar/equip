import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
    Search, Loader2, Award, ExternalLink, Filter, GraduationCap,
    Star, ArrowRight, MonitorPlay, HeartPulse, Wrench, BookOpen, Clock, AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config.js';

const COURSES_API_URL = `${API_BASE_URL}/api/courses`;

const Courses = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [providerFilter, setProviderFilter] = useState('All');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, [providerFilter]);

    const fetchCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (providerFilter !== 'All') params.append('provider', providerFilter);
            if (searchTerm) params.append('search', searchTerm);

            const res = await axios.get(`${COURSES_API_URL}?${params.toString()}`);
            setCourses(res.data);
        } catch (err) {
            setError(t('Failed to load courses. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCourses();
    };

    const getProviderBadgeColor = (provider) => {
        switch (provider) {
            case 'edX': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'Alison': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'TESDA Online Program': return 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border-brand-200 dark:border-brand-800';
            case 'Free Courses Online': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
        }
    };

    const featuredCourses = courses.slice(0, 3);

    const categories = [
        { id: 1, icon: Wrench, title: 'Heavy Equipment', desc: 'Construction & Industrial' },
        { id: 2, icon: MonitorPlay, title: 'Information Tech', desc: 'Web & Software Dev' },
        { id: 3, icon: HeartPulse, title: 'Healthcare', desc: 'Caregiving & Paramedic' },
        { id: 4, icon: BookOpen, title: 'Business', desc: 'Management & Operations' }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 bg-pattern w-full overflow-x-hidden">



            {/* 1. API BROWSE & FILTER SECTION */}
            <section id="browse-courses" className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-white mb-4">
                            {t('Complete Course Catalog')}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                            Search thousands of free online courses. Filter by provider or specific skill sets.
                        </p>
                    </div>

                    <div className="glass-effect p-3 md:p-4 rounded-2xl mb-12 shadow-md border border-zinc-200 dark:border-zinc-800 max-w-4xl mx-auto sticky top-24 z-30 transition-shadow hover:shadow-lg">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder={t('Search skills, subjects, or NC II codes...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none bg-zinc-100 dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white font-medium"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative w-full sm:w-56">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
                                    <select
                                        value={providerFilter}
                                        onChange={(e) => setProviderFilter(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 appearance-none rounded-xl border-none bg-zinc-100 dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-zinc-900 dark:text-white font-bold cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    >
                                        <option value="All">{t('All Providers')}</option>
                                        <option value="TESDA Online Program">TESDA TOP</option>
                                        <option value="edX">edX</option>
                                        <option value="Alison">Alison</option>
                                        <option value="Free Courses Online">Free Courses Online</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="px-8 py-3.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition-all active:scale-95 shadow-md shadow-brand-500/20 w-full sm:w-auto flex items-center justify-center whitespace-nowrap"
                                >
                                    {t('Search')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {error && (
                        <div className="mb-10 max-w-4xl mx-auto p-5 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl text-red-700 dark:text-red-400 flex items-center shadow-sm">
                            <AlertCircle className="mr-3 shrink-0" size={24} />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-32 text-brand-500">
                            <Loader2 className="animate-spin w-14 h-14 mb-6" />
                            <p className="font-bold text-lg text-zinc-600 dark:text-zinc-400 animate-pulse">{t('Syncing global course catalog...')}</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-24 glass-effect rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-3xl mx-auto shadow-sm">
                            <Search className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-6" />
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{t('No courses found')}</h3>
                            <p className="text-zinc-500 text-lg">{t('Try adjusting your search criteria or switching the provider filter.')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses.map((course) => (
                                <div
                                    key={`all-${course.id}`}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/50 group"
                                >
                                    <div className="h-44 relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent"></div>
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            {course.isFree && (
                                                <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase shadow-md flex items-center">
                                                    Free
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute bottom-3 right-3">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getProviderBadgeColor(course.provider)} backdrop-blur-md shadow-sm`}>
                                                {course.provider}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {course.skills && course.skills.slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-md text-[11px] font-bold">
                                                    {skill}
                                                </span>
                                            ))}
                                            {course.skills && course.skills.length > 3 && (
                                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md text-[11px] font-bold">
                                                    +{course.skills.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-2">
                                            <div className="flex items-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                                                <Clock size={16} className="mr-2 text-zinc-400" />
                                                {course.duration}
                                            </div>
                                            {course.hasCertificate && (
                                                <div className="flex items-center text-sm font-semibold text-amber-600 dark:text-amber-500">
                                                    <Award size={16} className="mr-2" />
                                                    {t('Free Certificate Included')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-5 pb-5 mt-auto">
                                        <a
                                            href={course.applyLink || '#'}
                                            target={course.applyLink && course.applyLink !== '#' ? "_blank" : "_self"}
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 rounded-lg font-bold transition-all duration-300 flex justify-center items-center group-hover:bg-brand-600 group-hover:text-white group-hover:border-transparent bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                                        >
                                            {t('View Course')} <ExternalLink size={16} className="ml-1.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-1.5 transition-all duration-300" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>



        </div>
    );
};

export default Courses;
