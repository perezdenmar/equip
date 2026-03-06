import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, DollarSign, Calendar, ExternalLink, Loader2, Award, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { regions, provinces } from '../utils/phLocations';
import api from '../api/client.js';

const Jobs = () => {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);

    // Helper for Provinces
    const getProvinces = (regionName) => {
        if (!regionName) return [];
        const region = regions.find(r => r.name === regionName);
        return region ? provinces.filter(p => p.region === region.code) : [];
    };

    // 1. Fetch user's enrolled courses to smartly default the job search
    useEffect(() => {
        const fetchUserContext = async () => {
            try {
                const res = await api.get('/auth/me');

                const enrollments = res.data.enrollments || [];
                let defaultSearch = ''; // Fallback

                if (enrollments.length > 0) {
                    // Get the latest enrolled course title
                    defaultSearch = enrollments[0].qualification.title;
                }

                setSearchInput(defaultSearch);
                setQuery(defaultSearch);
            } catch (error) {
                console.error("Failed to load user profile context", error);
                setSearchInput('');
                setQuery('');
            } finally {
                setIsProfileLoaded(true);
            }
        };

        fetchUserContext();
    }, []);

    // 2. Fetch jobs whenever the query changes AND profile is loaded (even if query is empty to get default list)
    useEffect(() => {
        if (isProfileLoaded) {
            fetchJobs();
        }
    }, [query, isProfileLoaded]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/jobs?query=${encodeURIComponent(query)}`);
            setJobs(response.data.jobs || []);
        } catch (error) {
            console.error("Failed to load aggregated jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        let targetQuery = searchInput.trim();
        let locationContext = '';

        if (selectedProvince) {
            locationContext = ` ${selectedProvince}`;
        } else if (selectedRegion) {
            locationContext = ` ${selectedRegion}`;
        }

        // Combine the search term with the location filter (if set).
        // e.g., "Developer" + " Japan" -> "Developer Japan"
        if (locationContext) {
            targetQuery += locationContext;
        }

        setQuery(targetQuery || '');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-3">
                        {t('nav.jobs', 'Jobs Exchange')}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-lg flex items-center gap-2">
                        <Globe className="text-brand-500 hidden sm:block" size={24} />
                        {t('jobs.subtitle', 'Discover targeted opportunities in the Philippines and across Asia. Specifically matched to your acquired TESDA qualifications.')}
                    </p>
                </div>
            </div>

            {/* Smart Search Bar */}
            <form onSubmit={handleSearch} className="mb-10 max-w-3xl">
                <div className="relative flex items-center group">
                    <Search className="absolute left-4 text-zinc-400 group-focus-within:text-brand-500 transition-colors" size={24} />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t('jobs.searchPlaceholder', 'Find roles, skills, or specific Qualification Codes (e.g. HEO-FL-01)...')}
                        className="w-full pl-14 pr-32 py-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-brand-500 focus:ring-0 outline-none transition-all text-zinc-900 dark:text-white text-lg font-medium shadow-sm"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 px-8 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-transform hover:scale-[1.02] shadow-lg shadow-brand-500/20"
                    >
                        {t('common.search', 'Search')}
                    </button>
                </div>

                {/* Advanced Location Filters */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <select
                        value={selectedRegion}
                        onChange={(e) => {
                            setSelectedRegion(e.target.value);
                            setSelectedProvince('');
                        }}
                        className="w-full sm:w-1/2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                        <option value="">{t('jobs.allLocations', 'All Locations (Local & Global)')}</option>

                        <optgroup label="Philippines (Local)">
                            {regions.map(r => (
                                <option key={r.code} value={r.name}>{r.name}</option>
                            ))}
                        </optgroup>

                        <optgroup label="International / Remote">
                            <option value="Japan">Japan (Visa Sponsored)</option>
                            <option value="Asia">Asia Pacific (Remote)</option>
                            <option value="Worldwide">Worldwide / Global Remote</option>
                        </optgroup>
                    </select>

                    <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        disabled={!selectedRegion}
                        className="w-full sm:w-1/2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">{t('jobs.allProvinces', 'All Provinces')}</option>
                        {getProvinces(selectedRegion).map(p => (
                            <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {!loading && query && (
                    <p className="mt-3 text-sm text-zinc-500 font-medium">
                        {t('jobs.showingResults', 'Showing localized results for:')} <span className="text-brand-600 dark:text-brand-400 font-bold px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 rounded">{query}</span>
                    </p>
                )}
            </form>

            {/* Job Listings Grid */}
            {!isProfileLoaded || loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-brand-600 dark:text-brand-400">
                    <div className="relative">
                        <Loader2 className="animate-spin mb-6" size={48} />
                        <MapPin className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-brand-400" size={20} opacity={0.5} />
                    </div>
                    <p className="font-bold text-lg animate-pulse">{t('jobs.locating', 'Locating highly-relevant Philippine and Asian opportunities...')}</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t('jobs.noJobsHeader', 'No localized jobs currently found')}</h3>
                    <p className="text-zinc-500 max-w-md mx-auto">{t('jobs.noJobsDesc', 'Try broadening your search term or exploring different vocational trades in the region.')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className={`glass-effect rounded-2xl p-6 hover:shadow-xl hover:border-brand-500/50 transition-all duration-300 group flex flex-col h-full relative overflow-hidden bg-white dark:bg-zinc-900 border ${job.source === 'PhilJobNet' ? 'border-brand-200 dark:border-brand-900/50' : 'border-zinc-200 dark:border-zinc-800'}`}>

                            {/* Source Badge overlay */}
                            <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1.5 rounded-bl-lg border-b border-l flex items-center gap-1.5
                                ${job.source === 'PhilJobNet'
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                                    : ['JapanDev', 'TokyoDev', 'GaijinPot', 'WorkJapan', 'Daijob'].includes(job.source)
                                        ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                                }`}
                            >
                                {job.source === 'PhilJobNet' && <Award size={14} />}
                                {['JapanDev', 'TokyoDev', 'GaijinPot', 'WorkJapan', 'Daijob'].includes(job.source) && <Globe size={14} />}
                                {job.source}
                            </div>

                            <div className="mb-4 mt-3">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors pr-8">
                                    {job.title}
                                </h3>
                                <div className="flex items-center text-zinc-600 dark:text-zinc-400 mt-3 text-sm font-semibold">
                                    <Building size={16} className="mr-2 text-zinc-400" />
                                    {job.company}
                                </div>
                            </div>

                            {/* Required Qualification Highlight for localized connections */}
                            {job.requiredQualification && (
                                <div className={`mb-4 inline-flex items-start rounded-lg p-3 border 
                                    ${job.source === 'PhilJobNet'
                                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                        : ['JapanDev', 'TokyoDev', 'GaijinPot', 'WorkJapan', 'Daijob'].includes(job.source)
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                            : 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                                    }`}
                                >
                                    <Award size={20} className={`
                                        ${job.source === 'PhilJobNet'
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : ['JapanDev', 'TokyoDev', 'GaijinPot', 'WorkJapan', 'Daijob'].includes(job.source)
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-brand-600 dark:text-brand-400'
                                        } mr-2 shrink-0 mt-0.5`} />
                                    <div>
                                        <p className={`text-[11px] font-bold uppercase tracking-widest mb-0.5 
                                            ${job.source === 'PhilJobNet'
                                                ? 'text-amber-800 dark:text-amber-300'
                                                : ['JapanDev', 'TokyoDev', 'GaijinPot', 'WorkJapan', 'Daijob'].includes(job.source)
                                                    ? 'text-red-800 dark:text-red-300'
                                                    : 'text-brand-800 dark:text-brand-300'
                                            }`}
                                        >
                                            {job.source === 'PhilJobNet' ? "TESDA NC REQUIRED" : ['JapanDev', 'TokyoDev', 'GaijinPot', 'WorkJapan', 'Daijob'].includes(job.source) ? "LANGUAGE & SKILL REQUIREMENT" : t('jobs.requiredCert', 'REQUIRED CERTIFICATION')}
                                        </p>
                                        <p className={`text-sm font-bold 
                                            ${job.source === 'PhilJobNet'
                                                ? 'text-amber-900 dark:text-amber-100'
                                                : ['JapanDev', 'TokyoDev', 'GaijinPot', 'WorkJapan', 'Daijob'].includes(job.source)
                                                    ? 'text-red-900 dark:text-red-100'
                                                    : 'text-brand-900 dark:text-white'
                                            }`}>
                                            {job.requiredQualification}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 mb-8 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                <div className="flex items-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    <MapPin size={16} className="mr-3 text-brand-500" />
                                    {job.location}
                                </div>
                                <div className="flex items-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    <DollarSign size={16} className="mr-3 text-emerald-500" />
                                    {job.salary}
                                </div>
                                <div className="flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-500">
                                    <Calendar size={16} className="mr-3 text-zinc-400" />
                                    {t('jobs.posted', 'Posted')}: {formatDate(job.posted)}
                                </div>
                            </div>

                            <a
                                href={job.url || '#'}
                                target={job.url && job.url !== '#' ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className={`mt-auto w-full py-3 rounded-xl font-bold transition-all duration-300 flex justify-center items-center group-hover:shadow-lg
                                    ${job.source === 'PhilJobNet'
                                        ? 'bg-brand-600 hover:bg-brand-700 text-white'
                                        : ['JapanDev', 'TokyoDev', 'GaijinPot', 'WorkJapan', 'Daijob'].includes(job.source)
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900'
                                    }`}
                            >
                                {t('jobs.applyNow', 'Apply / View Details')} <ExternalLink size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Jobs;
