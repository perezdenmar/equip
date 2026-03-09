import React, { useState, useEffect } from 'react';
import { Heart, Globe, Mail, Phone, ExternalLink, Loader2, ArrowRight, Gift, LayoutGrid, Info, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/client.js';
import { API_BASE_URL } from '../config.js';

const Partners = () => {
    const { user } = useAuth();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await api.get('/partners');
            setPartners(res.data);
        } catch (error) {
            console.error('Failed to load partners', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center bg-zinc-50 dark:bg-zinc-950">
            <Loader2 className="animate-spin text-brand-500" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-zinc-900 py-24 sm:py-32">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent animate-pulse"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
                        Our Strategic <span className="text-brand-400">Partners</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        We collaborate with world-class organizations to provide exclusive rewards, career opportunities, and growth for the EQUIP community.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {partners.map((partner, index) => (
                        <div
                            key={partner.id}
                            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col hover:-translate-y-2 animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Logo Wrapper */}
                            <div className="h-56 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-center p-12 relative overflow-hidden group-hover:bg-brand-50/10 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-100 transition-opacity duration-700">
                                    <LayoutGrid className="text-zinc-900 dark:text-white" size={120} />
                                </div>

                                {partner.logo ? (
                                    <img
                                        src={partner.logo.startsWith('http') ? partner.logo : `${API_BASE_URL}${partner.logo}`}
                                        alt={partner.name}
                                        className="max-w-full max-h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-md"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-2xl shadow-inner flex items-center justify-center relative z-10">
                                        <Heart className="text-brand-200 dark:text-zinc-700" size={48} />
                                    </div>
                                )}
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                        {partner.name}
                                    </h2>
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                        Verified
                                    </div>
                                </div>

                                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8 flex-1 line-clamp-4">
                                    {partner.description || 'A key contributor to the continuous growth and excellence of our learning ecosystem.'}
                                </p>

                                {/* Contact Details */}
                                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <div className="flex flex-wrap gap-4">
                                        {partner.website && (
                                            <a
                                                href={partner.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                            >
                                                <Globe size={14} /> Website <ExternalLink size={12} className="opacity-50" />
                                            </a>
                                        )}
                                        {partner.email && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                                <Mail size={14} className="opacity-50" /> Support
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                                                        <Gift size={10} className="text-zinc-500" />
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                {partner.rewards?.length || 0} Dynamic Offers
                                            </span>
                                        </div>

                                        <Link
                                            to="/rewards"
                                            className="h-10 px-5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 active:scale-95"
                                        >
                                            Redeem <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {partners.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Info className="text-zinc-300" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Expanding our horizon</h3>
                            <p className="text-zinc-500 max-w-sm mx-auto">We are currently onboarding new strategic partners. Stay tuned for exciting collaborations!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-5xl mx-auto px-4 mt-24 text-center">
                <div className="p-12 rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <h2 className="text-3xl font-bold mb-4 relative z-10">Become a Partner</h2>
                    <p className="text-brand-100 mb-8 max-w-lg mx-auto relative z-10">Join our ecosystem and impact thousands of potential hires while showcasing your brand.</p>
                    <Link to="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-zinc-900 font-bold rounded-2xl hover:bg-brand-50 transition-colors shadow-xl relative z-10">
                        Inquire Partnership <Mail size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Partners;
