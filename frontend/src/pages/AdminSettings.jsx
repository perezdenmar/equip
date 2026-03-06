import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, LayoutTemplate, Palette, Zap, Save, CheckCircle, Loader2, Menu, Award, Eye, EyeOff, Building2, Image, FileUp, Globe } from 'lucide-react';
import api from '../api/client.js';

const AdminSettings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Initial default state if DB is empty
    const [settings, setSettings] = useState({
        landing_hero: {
            subtitle: 'Equip Quantum Upskilling Institute of the Philippines, Inc.',
            title: 'Master the Skills of Tomorrow.',
            description: 'Access high-quality, free vocational skills training from world-class providers and elevate your career.',
            button1Text: 'Explore Courses',
            button1Link: '#browse-courses',
            button2Text: 'View Categories',
            button2Link: '#categories',
            imageYAxis: '35'
        },
        navigation_menu: [
            { id: 'home', title: 'Home', path: '/', isVisible: true },
            { id: 'quals', title: 'Qualifications', path: '/qualifications', isVisible: true },
            { id: 'jobs', title: 'Jobs', path: '/jobs', isVisible: true },
            { id: 'courses', title: 'Online Courses', path: '/courses', isVisible: true },
            { id: 'contact', title: 'Contact Us', path: '/contact', isVisible: true }
        ],
        featured_spotlight: {
            title: 'Featured Qualifications',
            subtitle: 'Discover our top regional qualifications'
        },
        contact_info: {
            companyName: 'Equip Quantum Upskilling Institute of the Philippines, Inc.',
            address: 'National Highway, San Jose, Digos City, Davao del Sur 8002',
            phone: '0961-701-8568',
            email: 'quantumgroupph@gmail.com',
            facebook: 'https://www.facebook.com/equipdigos'
        },
        theme_config: {
            primaryColor: '#f97316' // Setup for future tailwind overrides
        },
        branding_assets: {
            logo: '',
            favicon: '',
            hero_banner: ''
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            // Merge fetched settings over the defaults
            if (Object.keys(res.data).length > 0) {
                setSettings(prev => ({ ...prev, ...res.data }));
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            await api.put('/settings', settings);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save settings', error);
            alert('Failed to save settings. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    const handleHeroChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            landing_hero: {
                ...prev.landing_hero,
                [name]: value
            }
        }));
    };

    const handleNavChange = (index, field, value) => {
        const newNav = [...(settings.navigation_menu || [])];
        newNav[index] = { ...newNav[index], [field]: value };
        setSettings(prev => ({ ...prev, navigation_menu: newNav }));
    };

    const handleSpotlightChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, featured_spotlight: { ...prev.featured_spotlight, [name]: value } }));
    };

    const handleContactInfoChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, contact_info: { ...prev.contact_info, [name]: value } }));
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('asset', file);

        try {
            const res = await api.post('/settings/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSettings(prev => ({
                ...prev,
                branding_assets: {
                    ...prev.branding_assets,
                    [field]: res.data.path
                }
            }));
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.');
        }
    };

    const tabs = [
        { id: 'branding', label: 'Branding Assets', icon: <Palette size={20} /> },
        { id: 'hero', label: 'Hero Banner', icon: <LayoutTemplate size={20} /> },
        { id: 'nav', label: 'Navigation Menu', icon: <Menu size={20} /> },
        { id: 'spotlight', label: 'Featured Spotlight', icon: <Award size={20} /> },
        { id: 'contact', label: 'Company Info', icon: <Building2 size={20} /> },
        { id: 'theme', label: 'Theme Config', icon: <Zap size={20} /> },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96 text-brand-500">
                <Loader2 className="animate-spin w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-white mb-2 flex items-center">
                        <Settings className="mr-3 text-brand-500" size={36} />
                        Site Settings (CMS)
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage dynamic layouts, hero banners, and global configurations.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
                >
                    {saving ? (
                        <><Loader2 className="animate-spin mr-2" size={20} /> Saving...</>
                    ) : saveSuccess ? (
                        <><CheckCircle className="mr-2 text-green-300" size={20} /> Saved!</>
                    ) : (
                        <><Save className="mr-2" size={20} /> Publish Changes</>
                    )}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-5 py-4 text-left font-semibold transition-colors
                                    ${activeTab === tab.id
                                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-l-4 border-brand-500'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-l-4 border-transparent'
                                    }`}
                            >
                                <span className={`mr-3 ${activeTab === tab.id ? 'text-brand-500' : 'text-zinc-400'}`}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Editor Panel */}
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">

                    {/* BRANDING ASSETS TAB */}
                    {activeTab === 'branding' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Sitewide Branding</h2>
                                <p className="text-sm text-zinc-500 mb-6">Manage your brand assets that appear across the entire platform.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* LOGO UPLOAD */}
                                <div className="space-y-4 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center">
                                            <Image className="mr-2 text-brand-500" size={18} /> Site Logo
                                        </h3>
                                        <span className="text-[10px] uppercase font-bold text-zinc-400">Transparent PNG preferred</span>
                                    </div>
                                    <div className="h-32 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 overflow-hidden relative group">
                                        {settings.branding_assets?.logo ? (
                                            <img src={`${api.defaults.baseURL.replace('/api', '')}${settings.branding_assets.logo}`} alt="Logo Preview" className="max-h-24 object-contain" />
                                        ) : (
                                            <div className="text-zinc-400 flex flex-col items-center">
                                                <Image size={32} className="mb-2 opacity-50" />
                                                <span className="text-sm">No logo uploaded</span>
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-brand-600/90 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <FileUp size={24} className="mb-1" />
                                            <span className="text-xs font-bold">Replace Logo</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-zinc-500 italic">This logo appears in the top navigation bar.</p>
                                </div>

                                {/* FAVICON UPLOAD */}
                                <div className="space-y-4 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center">
                                            <Globe className="mr-2 text-blue-500" size={18} /> Browser Favicon
                                        </h3>
                                        <span className="text-[10px] uppercase font-bold text-zinc-400">ICO or PNG (Square)</span>
                                    </div>
                                    <div className="h-32 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 overflow-hidden relative group">
                                        {settings.branding_assets?.favicon ? (
                                            <img src={`${api.defaults.baseURL.replace('/api', '')}${settings.branding_assets.favicon}`} alt="Favicon Preview" className="w-16 h-16 object-contain" />
                                        ) : (
                                            <div className="text-zinc-400 flex flex-col items-center">
                                                <Globe size={32} className="mb-2 opacity-50" />
                                                <span className="text-sm">Default Favicon</span>
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-blue-600/90 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <FileUp size={24} className="mb-1" />
                                            <span className="text-xs font-bold">Change Favicon</span>
                                            <input type="file" className="hidden" accept="image/x-icon,image/png" onChange={(e) => handleFileUpload(e, 'favicon')} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-zinc-500 italic">The small icon displayed in browser tabs.</p>
                                </div>
                            </div>

                            {/* HERO BANNER UPLOAD */}
                            <div className="space-y-4 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center">
                                        <LayoutTemplate className="mr-2 text-amber-500" size={18} /> Hero Banner Image
                                    </h3>
                                    <span className="text-[10px] uppercase font-bold text-zinc-400">High Res (1920x1080) Recommended</span>
                                </div>
                                <div className="h-56 flex items-center justify-center bg-zinc-950 rounded-xl border-2 border-dashed border-zinc-700 overflow-hidden relative group">
                                    {settings.branding_assets?.hero_banner ? (
                                        <img src={`${api.defaults.baseURL.replace('/api', '')}${settings.branding_assets.hero_banner}`} alt="Hero Preview" className="w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <div className="text-zinc-500 flex flex-col items-center">
                                            <Image size={48} className="mb-2 opacity-30" />
                                            <span className="text-sm">Default Hero Image (Collage)</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-zinc-900/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <FileUp size={32} className="mb-1" />
                                        <span className="text-sm font-bold">Replace Hero Banner</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero_banner')} />
                                    </label>
                                </div>
                                <p className="text-xs text-zinc-500 italic">This massive background image appears behind the headline on the home page.</p>
                            </div>
                        </div>
                    )}

                    {/* HERO BANNER TAB */}
                    {activeTab === 'hero' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Hero Banner Configuration</h2>
                                <p className="text-sm text-zinc-500 mb-6">Modify the main landing page introductory text and calls to action.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Eyebrow Subtitle (Badge)</label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={settings.landing_hero?.subtitle || ''}
                                        onChange={handleHeroChange}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Main Headline</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={settings.landing_hero?.title || ''}
                                        onChange={handleHeroChange}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-display text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Description / Hook</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        value={settings.landing_hero?.description || ''}
                                        onChange={handleHeroChange}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Primary Button Text</label>
                                        <input
                                            type="text"
                                            name="button1Text"
                                            value={settings.landing_hero?.button1Text || ''}
                                            onChange={handleHeroChange}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Primary Button Link</label>
                                        <input
                                            type="text"
                                            name="button1Link"
                                            value={settings.landing_hero?.button1Link || ''}
                                            onChange={handleHeroChange}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Secondary Button Text</label>
                                        <input
                                            type="text"
                                            name="button2Text"
                                            value={settings.landing_hero?.button2Text || ''}
                                            onChange={handleHeroChange}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Secondary Button Link</label>
                                        <input
                                            type="text"
                                            name="button2Link"
                                            value={settings.landing_hero?.button2Link || ''}
                                            onChange={handleHeroChange}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Image Y-Axis Focus (%)</label>
                                    <input
                                        type="number"
                                        name="imageYAxis"
                                        min="0"
                                        max="100"
                                        value={settings.landing_hero?.imageYAxis || '50'}
                                        onChange={handleHeroChange}
                                        className="w-full md:w-1/3 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    />
                                    <p className="text-xs text-zinc-500 mt-2">Adjusting this moves the focal point of the massive background image. 50 is center, 35 pulls the image up (revealing the top), 70 pushes it down.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NAVIGATION MENU TAB */}
                    {activeTab === 'nav' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Navigation Menu</h2>
                                <p className="text-sm text-zinc-500 mb-6">Rename the core navigation links or toggle their visibility.</p>
                            </div>

                            <div className="space-y-4">
                                {(settings.navigation_menu || []).map((item, index) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Link Title</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => handleNavChange(index, 'title', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Path</label>
                                            <input
                                                type="text"
                                                value={item.path}
                                                onChange={(e) => handleNavChange(index, 'path', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed outline-none"
                                                disabled
                                            />
                                        </div>
                                        <div className="flex items-center justify-center pt-5 sm:pt-0 pl-2">
                                            <button
                                                onClick={() => handleNavChange(index, 'isVisible', !item.isVisible)}
                                                className={`p-2 rounded-full transition-colors flex items-center justify-center ${item.isVisible ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                                                title={item.isVisible ? "Visible to public" : "Hidden from public"}
                                            >
                                                {item.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FEATURED SPOTLIGHT TAB */}
                    {activeTab === 'spotlight' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Featured Spotlight</h2>
                                <p className="text-sm text-zinc-500 mb-6">Control the labels for the trending/featured section automatically pulled from the database.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Section Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={settings.featured_spotlight?.title || ''}
                                        onChange={handleSpotlightChange}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-display text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Section Subtitle</label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={settings.featured_spotlight?.subtitle || ''}
                                        onChange={handleSpotlightChange}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COMPANY INFO TAB */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Company Information</h2>
                                <p className="text-sm text-zinc-500 mb-6">Manage the official contact details displayed on the Contact Us page.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Company Name (Full Legal Name)</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={settings.contact_info?.companyName || ''}
                                        onChange={handleContactInfoChange}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Headquarters Address</label>
                                    <textarea
                                        name="address"
                                        rows="2"
                                        value={settings.contact_info?.address || ''}
                                        onChange={handleContactInfoChange}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Support Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={settings.contact_info?.phone || ''}
                                            onChange={handleContactInfoChange}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Support Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={settings.contact_info?.email || ''}
                                            onChange={handleContactInfoChange}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Facebook Page URL</label>
                                    <input
                                        type="url"
                                        name="facebook"
                                        value={settings.contact_info?.facebook || ''}
                                        onChange={handleContactInfoChange}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {(activeTab !== 'hero' && activeTab !== 'nav' && activeTab !== 'spotlight' && activeTab !== 'contact') && (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 animate-in fade-in">
                            <Settings size={48} className="mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Module Under Construction</h3>
                            <p className="text-center max-w-sm">The '{activeTab}' configuration module is currently being built and will be available in the next iteration.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
