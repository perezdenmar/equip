import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Search, Loader2, Award, ExternalLink, Filter, GraduationCap,
    Star, ArrowRight, MonitorPlay, HeartPulse, Wrench, BookOpen, Clock, AlertCircle
} from 'lucide-react';
import api from '../api/client.js';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { API_BASE_URL } from '../config.js';

const Home = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [qualifications, setQualifications] = useState([]);
    const { settings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [loadingQuals, setLoadingQuals] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [providerFilter, setProviderFilter] = useState('All');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, [providerFilter]);

    useEffect(() => {
        fetchCourses();
    }, [providerFilter]);

    useEffect(() => {
        const fetchQuals = async () => {
            setLoadingQuals(true);
            try {
                const res = await api.get('/qualifications');
                const safeData = Array.isArray(res.data) ? res.data : [];
                // Slice only the top 3 newest/active qualifications
                setQualifications(safeData.slice(0, 3));
            } catch (err) {
                console.error('Failed to load featured qualifications', err);
            } finally {
                setLoadingQuals(false);
            }
        };
        fetchQuals();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (providerFilter !== 'All') params.append('provider', providerFilter);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`/courses?${params.toString()}`);
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

    const categories = [
        { id: 1, icon: Wrench, title: 'Heavy Equipment', desc: 'Construction & Industrial' },
        { id: 2, icon: MonitorPlay, title: 'Information Tech', desc: 'Web & Software Dev' },
        { id: 3, icon: HeartPulse, title: 'Healthcare', desc: 'Caregiving & Paramedic' },
        { id: 4, icon: BookOpen, title: 'Business', desc: 'Management & Operations' }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 bg-pattern w-full overflow-x-hidden">

            {/* 1. HERO SECTION */}
            <section className="relative w-full h-[550px] md:h-[650px] bg-zinc-950 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src={settings.branding_assets?.hero_banner ? `${API_BASE_URL}${settings.branding_assets.hero_banner}` : "/hero-banner.jpg"}
                        alt="Vocational Training Collage"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay transition-all duration-1000"
                        style={{ objectPosition: `center ${settings.landing_hero?.imageYAxis || '35'}%` }}
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left w-full">
                    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <span className="inline-block py-1.5 px-3 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                            {(settings?.landing_hero?.subtitle) || t('Equip Quantum Upskilling Institute of the Philippines, Inc.')}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 leading-tight drop-shadow-xl"
                            dangerouslySetInnerHTML={{
                                __html: settings?.landing_hero?.title
                                    ? String(settings.landing_hero.title).replace('Tomorrow.', '<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">Tomorrow.</span>')
                                    : `${t('Master the Skills of')} <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">Tomorrow.</span>`
                            }}>
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-2xl font-light">
                            {(settings?.landing_hero?.description) || t('Access high-quality, free vocational skills training from world-class providers and elevate your career.')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <a
                                href={settings.landing_hero?.button1Link || "#browse-courses"}
                                className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-brand-600/30 flex items-center justify-center"
                            >
                                {settings.landing_hero?.button1Text || t('Explore Courses')} <ArrowRight className="ml-2" size={20} />
                            </a>
                            <a
                                href={settings.landing_hero?.button2Link || "#categories"}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-all backdrop-blur-md flex items-center justify-center"
                            >
                                {settings.landing_hero?.button2Text || t('View Categories')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. CATEGORIES SECTION */}
            <section id="categories" className="py-20 relative z-20 -mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat, idx) => {
                            const Icon = cat.icon;
                            return (
                                <div
                                    key={cat.id}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-4 hover:border-brand-500/50 hover:shadow-brand-500/10 transition-all duration-300 group cursor-pointer animate-in fade-in slide-in-from-bottom-5"
                                >
                                    <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-xl group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 text-brand-600 dark:text-brand-400">
                                        <Icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{cat.title}</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{cat.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3. FEATURED QUALIFICATIONS (TOP 3) */}
            {!loadingQuals && qualifications.length > 0 && (
                <section className="py-24 relative z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                                    <Award className="mr-3 text-brand-500" size={32} />
                                    {settings.featured_spotlight?.title || "Featured Qualifications"}
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-lg">
                                    {settings.featured_spotlight?.subtitle || "Discover our top regional qualifications"}
                                </p>
                            </div>
                            <Link to="/qualifications" className="hidden sm:flex items-center text-brand-600 hover:text-brand-700 font-semibold group">
                                {t('View all')} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {qualifications.map((qual) => (
                                <div key={`feat-${qual.id}`} className="group relative rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 aspect-[4/3] flex flex-col justify-end isolate bg-zinc-900">
                                    {/* Procedural fallback gradient instead of missing image */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-zinc-900 to-zinc-950 transition-transform duration-700 group-hover:scale-105 -z-10"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent -z-10"></div>

                                    <div className="p-6 md:p-8 z-10 w-full relative">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border border-brand-500/30 bg-brand-500/20 text-brand-300 backdrop-blur-md`}>
                                                {qual.code || 'QUAL'}
                                            </span>
                                            <Award className="text-amber-400 drop-shadow-md" size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg group-hover:text-brand-300 transition-colors line-clamp-2">
                                            {qual.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-300 mb-6 drop-shadow-md">
                                            <span className="flex items-center"><Clock size={14} className="mr-1" /> {qual.duration || 'Flexible'}</span>
                                            {qual.level && <span className="text-amber-400 flex items-center">● {qual.level}</span>}
                                        </div>
                                        <a
                                            href="/qualifications"
                                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-brand-600 border border-white/20 text-white font-bold backdrop-blur-md transition-all flex items-center justify-center group/btn"
                                        >
                                            {t('View Details')} <ExternalLink size={16} className="ml-2 group-hover/btn:rotate-45 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. API BROWSE & FILTER SECTION */}
            <section id="browse-courses" className="py-24">
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

            {/* 5. CALL TO ACTION (CTA) FOOTER */}
            <section className="py-24 bg-gradient-to-br from-brand-900 via-brand-950 to-zinc-950 border-t border-brand-800/30 text-center px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <GraduationCap className="w-16 h-16 text-brand-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]" />
                    <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-6 tracking-tight">
                        Ready to elevate your career?
                    </h2>
                    <p className="text-lg md:text-xl text-brand-200/80 mb-10 font-light max-w-2xl mx-auto">
                        Join thousands of forward-thinking individuals leveraging free, world-class online education to secure high-paying jobs globally.
                    </p>
                    <a
                        href="/login"
                        className="inline-flex items-center px-10 py-5 bg-white text-brand-900 rounded-2xl font-black text-lg hover:bg-zinc-100 hover:scale-[1.02] transition-all shadow-xl shadow-brand-500/20"
                    >
                        Sign Up for Free <ArrowRight className="ml-2" size={24} />
                    </a>
                </div>
            </section>

        </div>
    );
};

export default Home;
