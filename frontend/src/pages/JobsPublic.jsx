import React, { useState, useEffect } from 'react';
import {
    Search, MapPin, Building, DollarSign, Calendar,
    ExternalLink, Loader2, Award, Globe, Sparkles,
    Briefcase, Zap, Shield, TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

const JobsPublic = () => {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const fetchJobs = async (searchQuery = '') => {
        setLoading(true);
        try {
            const response = await api.get(`/jobs?query=${encodeURIComponent(searchQuery)}`);
            setJobs(response.data.jobs || []);
        } catch (error) {
            console.error("Failed to load aggregated jobs", error);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchJobs(); // Initial fetch
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setQuery(searchInput);
        fetchJobs(searchInput);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Hero Section */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 pt-20 pb-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-bold mb-6 animate-bounce">
                        <Sparkles size={16} />
                        AI-Powered Semantic Job Search
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black text-zinc-900 dark:text-white mb-6 tracking-tight">
                        Find Your Next <span className="text-brand-600">Opportunity</span>
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl mb-10 leading-relaxed">
                        Search across Indeed, RemoteOK, and OnlineJobs.ph with simple natural language.
                        Our AI understands your intent and finds the most relevant matches.
                    </p>

                    {/* Master Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-emerald-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center">
                            <Search className="absolute left-6 text-zinc-400 group-focus-within:text-brand-500 transition-colors" size={24} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="e.g., 'Senior React roles with Node.js experience in Asia'"
                                className="w-full pl-16 pr-40 py-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-brand-500 outline-none transition-all text-zinc-900 dark:text-white text-xl font-medium shadow-2xl"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-3 px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {t('common.search', 'Search')}
                            </button>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-zinc-500 font-medium">
                            <span>Try:</span>
                            <button type="button" onClick={() => { setSearchInput('Remote UX Designer'); fetchJobs('Remote UX Designer'); }} className="hover:text-brand-600 underline">Remote UX Designer</button>
                            <button type="button" onClick={() => { setSearchInput('Junior Backend PH'); fetchJobs('Junior Backend PH'); }} className="hover:text-brand-600 underline">Junior Backend PH</button>
                            <button type="button" onClick={() => { setSearchInput('High paying React jobs'); fetchJobs('High paying React jobs'); }} className="hover:text-brand-600 underline">High paying React jobs</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {/* Stats / Feedback Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="text-brand-500" size={24} />
                        {jobs.length} Job Openings Found
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 pr-6">
                            <Shield className="text-blue-500" size={16} /> Verified Sources
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 pr-6">
                            <Zap className="text-amber-500" size={16} /> Instant Refresh
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
                            <TrendingUp className="text-emerald-500" size={16} /> Semantic Ranking
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-brand-600 transition-opacity">
                        <Loader2 className="animate-spin mb-4" size={56} />
                        <p className="font-bold text-lg animate-pulse tracking-widest uppercase">Analyzing Intent & Scraping Opportunities...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="bg-zinc-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-zinc-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">No matching jobs found</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto">Try a broader search term or different natural language query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map((job) => (
                            <div key={job.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 relative flex flex-col h-full">

                                {/* AI Score Badge */}
                                {job.relevanceScore > 0 && (
                                    <div className="absolute -top-3 left-8 px-4 py-1.5 bg-gradient-to-r from-brand-600 to-emerald-600 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg border-2 border-white dark:border-zinc-900">
                                        {Math.round(job.relevanceScore * 100)}% Match
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 transition-colors`}>
                                        <Briefcase className="text-zinc-400 group-hover:text-brand-500 transition-colors" size={24} />
                                    </div>
                                    <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                        {job.source}
                                    </span>
                                </div>

                                <div className="mb-6 flex-grow">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight mb-3 group-hover:text-brand-600 transition-colors line-clamp-2 uppercase tracking-tight">
                                        {job.title}
                                    </h3>
                                    <div className="flex items-center text-zinc-600 dark:text-zinc-400 font-bold text-sm">
                                        <Building size={16} className="mr-2 text-brand-500/50" />
                                        {job.company}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
                                    <div className="flex items-center text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                        <MapPin size={16} className="mr-3 text-brand-500" />
                                        {job.location || 'Remote'}
                                        {job.type && <span className="ml-2 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] uppercase font-bold">{job.type}</span>}
                                    </div>
                                    {job.salary && (
                                        <div className="flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                            <DollarSign size={16} className="mr-3" />
                                            {job.salary}
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm font-medium text-zinc-400">
                                        <Calendar size={16} className="mr-3" />
                                        {formatDate(job.postedAt)}
                                    </div>
                                </div>

                                <a
                                    href={job.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-8 w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-600 dark:hover:bg-brand-50 transition-all duration-300 group-hover:shadow-xl active:scale-[0.98] uppercase tracking-wider text-xs"
                                >
                                    View Details <ExternalLink size={14} />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobsPublic;
