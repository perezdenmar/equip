import React, { useState, useEffect } from 'react';
import { Heart, Plus, Edit2, Trash2, Globe, Mail, Phone, ExternalLink, Loader2, Save, X, Image as ImageIcon, LayoutGrid, Gift } from 'lucide-react';
import api from '../api/client.js';
import { API_BASE_URL } from '../config.js';

const ManagePartners = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        logo: null, // Now holds the File object
        contact: '',
        email: '',
        description: '',
        website: '',
        isActive: true
    });
    const [logoPreview, setLogoPreview] = useState('');

    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    const [currentPartnerId, setCurrentPartnerId] = useState(null);
    const [editingReward, setEditingReward] = useState(null);
    const [rewardFormData, setRewardFormData] = useState({
        title: '',
        description: '',
        points: 100,
        category: 'General',
        image: null, // Now holds File object
        isActive: true
    });
    const [rewardImagePreview, setRewardImagePreview] = useState('');

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/partners');
            setPartners(res.data);
        } catch (error) {
            console.error('Failed to load partners', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (partner = null) => {
        if (partner) {
            setEditingPartner(partner);
            setFormData({
                name: partner.name || '',
                logo: null,
                contact: partner.contact || '',
                email: partner.email || '',
                description: partner.description || '',
                website: partner.website || '',
                isActive: partner.isActive
            });
            setLogoPreview(partner.logo || '');
        } else {
            setEditingPartner(null);
            setFormData({
                name: '',
                logo: null,
                contact: '',
                email: '',
                description: '',
                website: '',
                isActive: true
            });
            setLogoPreview('');
        }
        setIsModalOpen(true);
    };

    const handleSavePartner = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('contact', formData.contact);
        data.append('email', formData.email);
        data.append('description', formData.description);
        data.append('website', formData.website);
        data.append('isActive', formData.isActive);

        if (formData.logo) {
            data.append('logo', formData.logo);
        }

        try {
            if (editingPartner) {
                await api.put(`/partners/${editingPartner.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/partners', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setIsModalOpen(false);
            fetchPartners();
        } catch (error) {
            console.error('Failed to save partner', error);
            alert('Failed to save partner');
        }
    };

    const handleFileChange = (e, type = 'partner') => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'partner') {
                setFormData({ ...formData, logo: file });
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setRewardFormData({ ...rewardFormData, image: file });
                const reader = new FileReader();
                reader.onloadend = () => {
                    setRewardImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleDeletePartner = async (id) => {
        if (!window.confirm('Are you sure you want to delete this partner? This will also delete all associated rewards.')) return;
        try {
            await api.delete(`/partners/${id}`);
            fetchPartners();
        } catch (error) {
            console.error('Failed to delete partner', error);
        }
    };

    const handleOpenRewardModal = (partnerId, reward = null) => {
        setCurrentPartnerId(partnerId);
        if (reward) {
            setEditingReward(reward);
            setRewardFormData({
                title: reward.title || '',
                description: reward.description || '',
                points: reward.points || 0,
                category: reward.category || '',
                image: null,
                isActive: reward.isActive
            });
            setRewardImagePreview(reward.image || '');
        } else {
            setEditingReward(null);
            setRewardFormData({
                title: '',
                description: '',
                points: 100,
                category: 'General',
                image: null,
                isActive: true
            });
            setRewardImagePreview('');
        }
        setIsRewardModalOpen(true);
    };

    const handleSaveReward = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', rewardFormData.title);
        data.append('description', rewardFormData.description);
        data.append('points', rewardFormData.points);
        data.append('category', rewardFormData.category);
        data.append('isActive', rewardFormData.isActive);

        if (rewardFormData.image) {
            data.append('image', rewardFormData.image);
        } else if (rewardImagePreview && !rewardImagePreview.startsWith('data:')) {
            // Keep existing image if no new one uploaded
            data.append('image', rewardImagePreview);
        }

        try {
            if (editingReward) {
                await api.put(`/partners/rewards/${editingReward.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                data.append('partnerId', currentPartnerId);
                await api.post('/partners/rewards', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setIsRewardModalOpen(false);
            fetchPartners();
        } catch (error) {
            console.error('Failed to save reward', error);
            alert('Failed to save reward');
        }
    };

    const handleDeleteReward = async (id) => {
        if (!window.confirm('Delete this reward offer?')) return;
        try {
            await api.delete(`/partners/rewards/${id}`);
            fetchPartners();
        } catch (error) {
            console.error('Failed to delete reward', error);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-brand-500" size={40} /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white flex items-center">
                        <Heart className="mr-4 text-emerald-500" size={36} />
                        Partners Management
                    </h1>
                    <p className="text-zinc-500 mt-1 text-sm">Manage company partnerships and reward catalogs.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
                >
                    <Plus size={20} /> Add New Partner
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {partners.map(partner => (
                    <div key={partner.id} className="glass-effect rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between gap-6 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                                    {partner.logo ? (
                                        <img
                                            src={partner.logo.startsWith('http') ? partner.logo : `${API_BASE_URL}${partner.logo}`}
                                            alt={partner.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    ) : (
                                        <ImageIcon className="text-zinc-300" size={32} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{partner.name}</h2>
                                        {!partner.isActive && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded">Inactive</span>}
                                    </div>
                                    <p className="text-zinc-500 text-sm mb-4 max-w-2xl">{partner.description}</p>
                                    <div className="flex flex-wrap gap-4 text-xs">
                                        {partner.email && <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400"><Mail size={14} /> {partner.email}</span>}
                                        {partner.contact && <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400"><Phone size={14} /> {partner.contact}</span>}
                                        {partner.website && (
                                            <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-emerald-600 font-bold hover:underline">
                                                <Globe size={14} /> Website <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => handleOpenModal(partner)}
                                    className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                    title="Edit Partner"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleOpenRewardModal(partner.id)}
                                    className="p-2.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors"
                                    title="Add Reward"
                                >
                                    <Plus size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeletePartner(partner.id)}
                                    className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    title="Delete Partner"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                <Gift size={16} /> Reward Catalog ({partner.rewards?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {partner.rewards?.map(reward => (
                                    <div key={reward.id} className="group p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-brand-500/50 hover:shadow-xl transition-all relative">
                                        <div className="aspect-video mb-4 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                                            {reward.image ? <img src={reward.image.startsWith('http') ? reward.image : `${API_BASE_URL}${reward.image}`} alt={reward.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-zinc-300" /></div>}
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase text-brand-600 rounded shadow-sm">{reward.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-zinc-900 dark:text-white leading-tight">{reward.title}</h4>
                                            <span className="text-xs font-black text-brand-600 dark:text-brand-400 whitespace-nowrap ml-2">{reward.points} Pts</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{reward.description}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenRewardModal(partner.id, reward)}
                                                className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReward(reward.id)}
                                                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        {!reward.isActive && <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl"><span className="px-4 py-1 bg-red-600 text-white text-xs font-black uppercase rounded shadow-lg">Deactivated</span></div>}
                                    </div>
                                ))}
                                {(!partner.rewards || partner.rewards.length === 0) && (
                                    <div className="col-span-full py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800/50 rounded-2xl">
                                        <Plus className="mx-auto mb-2 opacity-20" size={32} />
                                        <p className="text-sm">No reward offers created for this partner.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Partner Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="glass-effect w-full max-w-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="px-8 py-6 bg-emerald-600 text-white flex justify-between items-center">
                            <h2 className="text-2xl font-display font-bold">{editingPartner ? 'Edit Partner' : 'Create New Partner'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSavePartner} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Company Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="e.g., GrabFood PH"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Partner Logo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview.startsWith('data:') || logoPreview.startsWith('http') ? logoPreview : `${API_BASE_URL}${logoPreview}`}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            ) : (
                                                <ImageIcon className="text-zinc-300" size={32} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="logo-upload"
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                <Plus size={16} /> {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                            </label>
                                            <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest font-bold">JPG, PNG, or WEBP (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Public Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Contact Number</label>
                                    <input
                                        type="text"
                                        value={formData.contact}
                                        onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Website URL</label>
                                    <input
                                        type="text"
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Short Description</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 accent-emerald-600 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Partner is currently active and visible to students</label>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} /> {editingPartner ? 'Update Partner' : 'Create Partner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reward Modal */}
            {isRewardModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="glass-effect w-full max-w-xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="px-8 py-6 bg-brand-600 text-white flex justify-between items-center">
                            <h2 className="text-2xl font-display font-bold">{editingReward ? 'Edit Reward Offer' : 'Add Reward Offer'}</h2>
                            <button onClick={() => setIsRewardModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveReward} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Reward Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={rewardFormData.title}
                                        onChange={e => setRewardFormData({ ...rewardFormData, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 outline-none"
                                        placeholder="e.g., PHP 100 Grab Voucher"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Required Points</label>
                                        <input
                                            required
                                            type="number"
                                            value={rewardFormData.points}
                                            onChange={e => setRewardFormData({ ...rewardFormData, points: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Category</label>
                                        <select
                                            value={rewardFormData.category}
                                            onChange={e => setRewardFormData({ ...rewardFormData, category: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 outline-none"
                                        >
                                            <option value="General">General</option>
                                            <option value="Food">Food & Dining</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Travel">Travel</option>
                                            <option value="Education">Education</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Reward Photo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-16 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                            {rewardImagePreview ? (
                                                <img
                                                    src={rewardImagePreview.startsWith('data:') || rewardImagePreview.startsWith('http') ? rewardImagePreview : `${API_BASE_URL}${rewardImagePreview}`}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="text-zinc-300" size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'reward')}
                                                className="hidden"
                                                id="reward-image-upload"
                                            />
                                            <label
                                                htmlFor="reward-image-upload"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                <Plus size={16} /> {rewardImagePreview ? 'Change Photo' : 'Upload Photo'}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Description</label>
                                    <textarea
                                        rows="2"
                                        value={rewardFormData.description}
                                        onChange={e => setRewardFormData({ ...rewardFormData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                    />
                                </div>
                                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        id="rw_active"
                                        checked={rewardFormData.isActive}
                                        onChange={e => setRewardFormData({ ...rewardFormData, isActive: e.target.checked })}
                                        className="w- 5 h-5 accent-brand-600 rounded"
                                    />
                                    <label htmlFor="rw_active" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Reward is available for redemption</label>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsRewardModalOpen(false)}
                                    className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} /> {editingReward ? 'Update Offer' : 'Add Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePartners;
