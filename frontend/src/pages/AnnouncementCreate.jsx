import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Send, Save, Eye, EyeOff, Users, Mail, Bell,
    Filter, Calendar, ChevronRight, ChevronLeft,
    ExternalLink, AlertTriangle, Loader2, ArrowLeft,
    CheckCircle, Megaphone
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';

const AnnouncementCreate = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [step, setStep] = useState(1);
    const [fetching, setFetching] = useState(!!editId);
    const [saving, setSaving] = useState(false);
    const [targetCount, setTargetCount] = useState(0);
    const [loadingCount, setLoadingCount] = useState(false);
    const [scheduleParts, setScheduleParts] = useState({
        date: '',
        hour: '12',
        minute: '00',
        ampm: 'AM'
    });

    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        content: '',
        ctaLink: '',
        priority: false,
        channels: { inApp: true, email: true },
        targetCriteria: {
            roles: [],
            locations: [],
            qualificationIds: []
        },
        scheduledAt: ''
    });

    useEffect(() => {
        if (editId) {
            fetchAnnouncement();
        }
    }, [editId]);

    const fetchAnnouncement = async () => {
        try {
            const res = await api.get(`/announcements/${editId}`);
            const data = res.data;
            let formattedDate = '';
            // Format date for datetime-local input
            if (data.scheduledAt) {
                const date = new Date(data.scheduledAt);
                formattedDate = date.toISOString();

                // Extract local components
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const datePart = `${yyyy}-${mm}-${dd}`;
                
                let h = date.getHours();
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12;
                h = h ? h : 12; // 0 becomes 12
                const hourPart = String(h);
                const minutePart = String(date.getMinutes()).padStart(2, '0');

                setScheduleParts({
                    date: datePart,
                    hour: hourPart,
                    minute: minutePart,
                    ampm: ampm
                });
            }

            setFormData({
                title: data.title,
                subject: data.subject || '',
                content: data.content,
                ctaLink: data.ctaLink || '',
                priority: !!data.priority,
                channels: data.channels || { inApp: true, email: true },
                targetCriteria: data.targetCriteria || { roles: [], locations: [], qualificationIds: [] },
                scheduledAt: formattedDate
            });
        } catch (error) {
            console.error('Failed to fetch announcement for editing', error);
            alert('Failed to load announcement data.');
            navigate('/admin/announcements');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!fetching) fetchTargetCount();
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.targetCriteria, fetching]);

    const fetchTargetCount = async () => {
        setLoadingCount(true);
        try {
            const res = await api.post('/announcements/count-targets', formData.targetCriteria);
            setTargetCount(res.data.count);
        } catch (error) {
            console.error('Failed to count targets', error);
        } finally {
            setLoadingCount(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleCriteriaChange = (type, value) => {
        setFormData(prev => {
            const current = prev.targetCriteria[type] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return {
                ...prev,
                targetCriteria: { ...prev.targetCriteria, [type]: updated }
            };
        });
    };

    const handlePublish = async (isTest = false) => {
        if (isTest) {
            try {
                // Assemble scheduledAt from parts if date is set
                let finalScheduledAt = formData.scheduledAt;
                if (scheduleParts.date) {
                    const [y, m, d] = scheduleParts.date.split('-');
                    let h = parseInt(scheduleParts.hour);
                    if (scheduleParts.ampm === 'PM' && h < 12) h += 12;
                    if (scheduleParts.ampm === 'AM' && h === 12) h = 0;
                    const dateObj = new Date(y, m - 1, d, h, parseInt(scheduleParts.minute));
                    finalScheduledAt = dateObj.toISOString();
                }

                await api.post('/announcements/preview', { ...formData, scheduledAt: finalScheduledAt });
                alert('Test email sent to your address!');
            } catch (error) {
                alert('Failed to send test email.');
            }
            return;
        }

        setSaving(true);
        try {
            // Assemble scheduledAt from parts if date is set
            let finalScheduledAt = null;
            if (scheduleParts.date) {
                const [y, m, d] = scheduleParts.date.split('-');
                let h = parseInt(scheduleParts.hour);
                if (scheduleParts.ampm === 'PM' && h < 12) h += 12;
                if (scheduleParts.ampm === 'AM' && h === 12) h = 0;
                const dateObj = new Date(y, m - 1, d, h, parseInt(scheduleParts.minute));
                finalScheduledAt = dateObj.toISOString();
            }

            const submissionData = { ...formData, scheduledAt: finalScheduledAt };

            if (editId) {
                await api.patch(`/announcements/${editId}`, submissionData);
            } else {
                await api.post('/announcements', submissionData);
            }
            navigate('/admin/announcements');
        } catch (error) {
            console.error('Failed to save announcement', error);
            alert('Failed to save announcement.');
        } finally {
            setSaving(false);
        }
    };

    const roles = ['STUDENT', 'STAFF', 'TRAINER', 'ADMIN'];

    const isStep1Valid = formData.title.trim() !== '' &&
        formData.subject.trim() !== '' &&
        formData.content.trim() !== '' &&
        formData.content !== '<p><br></p>';

    const handleImmediateSend = async () => {
        if (!window.confirm('Are you sure you want to send this announcement to all targets immediately?')) return;
        
        setSaving(true);
        try {
            let id = editId;
            if (id) {
                await api.patch(`/announcements/${id}`, { ...formData, scheduledAt: null });
            } else {
                const res = await api.post('/announcements', { ...formData, scheduledAt: null });
                id = res.data.id;
            }
            
            await api.post(`/announcements/${id}/send`);
            navigate('/admin/announcements');
        } catch (error) {
            console.error('Immediate send failed', error);
            alert('Failed to send announcement.');
        } finally {
            setSaving(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="animate-spin text-brand-500 mb-4" size={48} />
                <p className="text-zinc-500 font-medium">Loading announcement data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                <div>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <button
                            onClick={() => navigate('/admin/announcements')}
                            className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/admin/settings')}
                            className="flex items-center text-brand-600 hover:text-brand-500 font-bold transition-colors"
                        >
                            <ChevronLeft size={18} className="mr-1" /> Back to CMS Settings
                        </button>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <Megaphone className="text-brand-500" size={32} />
                        {editId ? 'Edit Announcement Draft' : 'Create New Announcement'}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {editId ? 'Refine your existing message and targeting rules.' : 'Compose your message and define target recipients.'}
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-10 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${step >= s ? 'bg-brand-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                            {step > s ? <CheckCircle size={20} /> : s}
                        </div>
                        <span className={`ml-3 font-semibold hidden md:block ${step >= s ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
                            {s === 1 ? 'Content' : s === 2 ? 'Targeting' : 'Review & Schedule'}
                        </span>
                        {s < 3 && <div className={`flex-1 h-[2px] mx-4 ${step > s ? 'bg-brand-600' : 'bg-zinc-100 dark:bg-zinc-800'}`} />}
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden text-left relative z-10">
                <div className="p-8">
                    {/* STEP 1: CONTENT */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Announcement Title (Admin Ref) <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Q1 Registration Blast"
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Email Subject Line <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Important: New Vocational Courses for 2026"
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Announcement Content (Rich Text) <span className="text-red-500">*</span></label>
                                <div className="quill-container bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content}
                                        onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                                        className="h-64 mb-12 dark:text-white"
                                    />
                                </div>
                            </div>

                            {!isStep1Valid && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center gap-3">
                                    <AlertTriangle className="text-amber-500" size={18} />
                                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Please fill in the title, subject, and content to proceed.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">CTA Button Link (Optional)</label>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                        <input
                                            type="url"
                                            name="ctaLink"
                                            value={formData.ctaLink}
                                            onChange={handleInputChange}
                                            placeholder="https://equipdigos.com/dashboard"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-8">
                                    <label className="flex items-center cursor-pointer group">
                                        <input type="checkbox" name="priority" checked={formData.priority} onChange={handleInputChange} className="hidden" />
                                        <div className={`w-6 h-6 rounded border-2 mr-3 flex items-center justify-center transition-colors ${formData.priority ? 'bg-amber-500 border-amber-500' : 'border-zinc-300 group-hover:border-amber-400'}`}>
                                            {formData.priority && <CheckCircle size={16} className="text-white" />}
                                        </div>
                                        <span className="text-sm font-bold">High Priority</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: TARGETING */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-brand-50 dark:bg-brand-900/10 p-6 rounded-2xl flex items-center justify-between border border-brand-100 dark:border-brand-900/30">
                                <div className="flex items-center">
                                    <Users className="text-brand-600 mr-4" size={32} />
                                    <div>
                                        <div className="text-sm font-bold text-brand-900 dark:text-brand-300 uppercase tracking-widest">Active Estimated Reach</div>
                                        <div className="text-3xl font-display font-black text-brand-600">
                                            {loadingCount ? <Loader2 className="animate-spin inline" /> : targetCount} Recipient(s)
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-brand-500 text-right max-w-[150px]">Based on current filters, this is how many users will receive the blast.</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold flex items-center text-zinc-800 dark:text-zinc-200">
                                        <Filter className="mr-2 text-brand-500" size={18} /> Target Roles
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {roles.map(role => (
                                            <button
                                                key={role}
                                                onClick={() => handleCriteriaChange('roles', role)}
                                                className={`p-3 rounded-xl border font-bold text-xs transition-all ${formData.targetCriteria.roles.includes(role) ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold flex items-center text-zinc-800 dark:text-zinc-200">
                                        <Mail className="mr-2 text-blue-500" size={18} /> Delivery Channels
                                    </h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, channels: { ...prev.channels, inApp: !prev.channels.inApp } }))}
                                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${formData.channels.inApp ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                        >
                                            <div className="flex items-center">
                                                <Bell className="mr-3" size={20} />
                                                <span className="font-bold">In-App Notification</span>
                                            </div>
                                            {formData.channels.inApp && <CheckCircle size={20} />}
                                        </button>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, channels: { ...prev.channels, email: !prev.channels.email } }))}
                                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${formData.channels.email ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-900/40 text-brand-700 dark:text-brand-400' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                        >
                                            <div className="flex items-center">
                                                <Mail className="mr-3" size={20} />
                                                <span className="font-bold">Email Blast</span>
                                            </div>
                                            {formData.channels.email && <CheckCircle size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW & SCHEDULE */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg mb-4 text-zinc-800 dark:text-zinc-200">Scheduling</h3>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Send Future Date (Optional)</label>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="relative flex-1 min-w-[200px]">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                                <input
                                                    type="date"
                                                    value={scheduleParts.date}
                                                    onChange={(e) => setScheduleParts(prev => ({ ...prev, date: e.target.value }))}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-brand-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={scheduleParts.hour}
                                                    onChange={(e) => setScheduleParts(prev => ({ ...prev, hour: e.target.value }))}
                                                    className="px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-brand-500 outline-none text-sm font-bold"
                                                >
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                                        <option key={h} value={h}>{h}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={scheduleParts.minute}
                                                    onChange={(e) => setScheduleParts(prev => ({ ...prev, minute: e.target.value }))}
                                                    className="px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-brand-500 outline-none text-sm font-bold"
                                                >
                                                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={scheduleParts.ampm}
                                                    onChange={(e) => setScheduleParts(prev => ({ ...prev, ampm: e.target.value }))}
                                                    className="px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-brand-500 outline-none text-sm font-bold"
                                                >
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-500 italic">Announcement will be sent automatically at the specified local time.</p>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-3">
                                        <button
                                            onClick={() => handlePublish(true)}
                                            className="w-full py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-brand-500 hover:text-brand-500 rounded-xl font-bold transition-all text-zinc-500"
                                        >
                                            Send Test to Myself
                                        </button>
                                        <button
                                            onClick={handleImmediateSend}
                                            disabled={saving}
                                            className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            <Send size={18} /> Send Now
                                        </button>
                                        <button
                                            onClick={() => handlePublish(false)}
                                            disabled={saving || !scheduleParts.date}
                                            className={`w-full py-3 border-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${scheduleParts.date ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-900/10 hover:bg-brand-50 dark:hover:bg-brand-900/20 active:scale-95' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed opacity-50'}`}
                                        >
                                            <Calendar size={18} /> Send Later
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Final Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase">Total Reach</div>
                                        <div className="text-lg font-bold text-brand-600">{targetCount} Users</div>
                                    </div>
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase">Priority</div>
                                        <div className="text-lg font-bold text-zinc-900 dark:text-white uppercase">{formData.priority ? 'High' : 'Normal'}</div>
                                    </div>
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl col-span-2">
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase">Target Roles</div>
                                        <div className="text-sm font-bold text-zinc-900 dark:text-white mt-1">
                                            {formData.targetCriteria.roles.length > 0 ? formData.targetCriteria.roles.join(', ') : 'All Roles'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-900/30 flex items-start gap-4">
                                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                                <p className="text-sm text-amber-800 dark:text-amber-400">
                                    Blast delivery cannot be undone once started. Please ensure you've sent a test message and verified all targeting filters.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate('/admin/announcements')}
                        className="flex items-center px-6 py-3 text-zinc-500 font-bold hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        {step === 1 ? 'Cancel' : <><ChevronLeft size={20} className="mr-1" /> Back</>}
                    </button>

                    <div className="flex gap-4">
                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={step === 1 && !isStep1Valid}
                                className={`flex items-center px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${step === 1 && !isStep1Valid ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'}`}
                            >
                                Next Step <ChevronRight size={20} className="ml-1" />
                            </button>
                        ) : (
                            <button
                                onClick={() => handlePublish(false)}
                                disabled={saving}
                                className="flex items-center px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
                            >
                                {saving ? (
                                    <><Loader2 className="animate-spin mr-2" /> Processing...</>
                                ) : (
                                    <><Save className="mr-2" size={20} /> {(formData.scheduledAt || scheduleParts.date) ? 'Schedule Blast' : 'Save as Draft'}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementCreate;
