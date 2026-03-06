import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, FileText, UploadCloud, Trash2, File, Loader2, Save, Camera, Link as LinkIcon, Facebook, AlertCircle, RefreshCw } from 'lucide-react';
import { regions, provinces, citiesMunicipalities } from '../utils/phLocations';
import ImageCropperModal from '../components/ImageCropperModal';
import api from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const defaultProfileState = {
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    birthplaceRegion: '',
    birthplaceProvince: '',
    birthplaceCity: '',
    birthplaceDistrict: '',
    dateOfBirth: '',
    sex: '',
    nationality: 'Filipino',
    contact: '', // Mobile
    telephoneNumber: '',
    socials: { linkedin: '', facebook: '' },
    street: '',
    barangay: '',
    district: '',
    city: '',
    province: '',
    region: '',
    parentName: '',
    parentAddress: '',
    rsbsaNumber: '',
    farmerName: '',
    farmerRelationship: '',
    privacyConsent: false,
    bio: '',
    profilePhoto: ''
};

const Profile = () => {
    const { t } = useTranslation();
    const { user, logout, refreshUser } = useAuth();
    const storedUser = user || { role: 'STUDENT', email: 'user@example.com' };

    // Document state
    const [documents, setDocuments] = useState([]);
    const [docLoading, setDocLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('Resume');

    // Profile state
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(defaultProfileState);

    // Photo Cropper States
    const [cropperSrc, setCropperSrc] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchProfile();
        fetchDocuments();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            const data = res.data;
            if (data) {
                // Ensure dateOfBirth is formatted correctly for date input YYYY-MM-DD
                let formattedDob = '';
                if (data.dateOfBirth) {
                    formattedDob = new Date(data.dateOfBirth).toISOString().split('T')[0];
                }

                // Strip null values to prevent React controlled-input warnings
                const safeData = Object.keys(data).reduce((acc, key) => {
                    if (data[key] !== null) acc[key] = data[key];
                    return acc;
                }, {});

                setFormData({
                    ...defaultProfileState,
                    ...safeData,
                    dateOfBirth: formattedDob,
                    socials: safeData.socials || { linkedin: '', facebook: '' },
                    privacyConsent: safeData.privacyConsent || false
                });
            }
        } catch (err) {
            console.error('Failed to load profile', err);
            // If the user no longer exists in DB (stale JWT), auto-logout
            if (err.response && err.response.status === 404) {
                logout();
                window.location.href = '/login?expired=1';
                return;
            }
        } finally {
            setIsProfileLoaded(true);
        }
    };

    const fetchDocuments = async () => {
        setDocLoading(true);
        try {
            const response = await api.get('/documents');
            setDocuments(response.data.filter(doc => doc.documentType !== 'ProfilePhoto'));
        } catch (err) {
            console.error('Failed to load documents', err);
        } finally {
            setDocLoading(false);
        }
    };

    // --- Profile Handlers ---
    const handleProfileChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'linkedin' || name === 'facebook') {
            setFormData(prev => ({ ...prev, socials: { ...prev.socials, [name]: value } }));
        } else if (type === 'checkbox' || type === 'radio') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => {
                const updated = { ...prev, [name]: value };

                // Cascading Reset Logic for Birthplace
                if (name === 'birthplaceRegion') {
                    updated.birthplaceProvince = '';
                    updated.birthplaceCity = '';
                }
                if (name === 'birthplaceProvince') {
                    updated.birthplaceCity = '';
                }

                // Cascading Reset Logic for Permanent Address
                if (name === 'region') {
                    updated.province = '';
                    updated.city = '';
                }
                if (name === 'province') {
                    updated.city = '';
                }

                return updated;
            });
        }
    };

    // Handle string parsing for radio inputs
    const handleRadioChange = (e) => {
        setFormData(prev => ({ ...prev, privacyConsent: e.target.value === 'true' }));
    }

    // Helper Functions for Ph-Locations
    const getProvinces = (regionName) => {
        if (!regionName) return [];
        const region = regions.find(r => r.name === regionName);
        return region ? provinces.filter(p => p.region === region.code) : [];
    };

    const getCities = (provinceName) => {
        if (!provinceName) return [];
        const province = provinces.find(p => p.name === provinceName);
        return province ? citiesMunicipalities.filter(c => c.province === province.code) : [];
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all fields? Unsaved changes will be lost.')) {
            fetchProfile(); // Reverts to last saved DB state
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (storedUser?.role === 'STUDENT' && !formData.privacyConsent) {
            setError('You must agree to the TESDA Privacy Notice before submitting your profile.');
            return;
        }

        setSaving(true);
        try {
            await api.put('/auth/profile', formData);
            // Refresh local auth state so Gate logic knows profile is now complete
            await refreshUser();
            setSuccessMessage('Learner Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 4000);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            if (err.response && err.response.status === 404) {
                logout();
                window.location.href = '/login?expired=1';
                return;
            }
            const serverMsg = err.response?.data?.error || 'Failed to update profile. Please try again.';
            setError(serverMsg);
        } finally {
            setSaving(false);
        }
    };

    // --- Avatar & Cropper Handlers ---
    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset target immediately so selecting the same file again triggers onChange
        e.target.value = '';

        if (file.size > 5 * 1024 * 1024) {
            setError('Photo source must be less than 5MB to process.');
            return;
        }

        // Create local object URL for the cropper modal
        const imageUrl = URL.createObjectURL(file);
        setCropperSrc(imageUrl);
        setShowCropper(true);
    };

    const processCroppedImage = async (croppedFile) => {
        setShowCropper(false);
        setCropperSrc(null); // release memory context early

        const avatarData = new FormData();
        avatarData.append('document', croppedFile);
        avatarData.append('documentType', 'Photo');

        try {
            const res = await api.post('/documents', avatarData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const photoUrl = res.data.url;
            setFormData(prev => ({ ...prev, profilePhoto: photoUrl }));
            await api.put('/auth/profile', { ...formData, profilePhoto: photoUrl });
            setSuccessMessage('Profile photo updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to upload cropped avatar.');
        }
    };

    const cancelCropper = () => {
        setShowCropper(false);
        setCropperSrc(null);
    };

    // --- Document Handlers ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        const form = new FormData();
        form.append('document', selectedFile);
        form.append('documentType', documentType);

        try {
            const res = await api.post('/documents', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDocuments([res.data, ...documents]);
            setSelectedFile(null);
            document.getElementById('file-upload').value = '';
        } catch (err) {
            setError('Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (err) {
            setError('Failed to delete document.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (!isProfileLoaded) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-brand-500" size={40} /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white flex items-center">
                    <User className="mr-4 text-brand-600 dark:text-brand-400" size={40} />
                    {storedUser?.role === 'ADMIN' ? "Administrator's Profile" :
                        storedUser?.role === 'STAFF' ? "Staff's Profile" :
                            storedUser?.role === 'TRAINER' ? "Trainer's Profile" :
                                "Learner's Profile"}
                </h1>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 flex items-center"><AlertCircle className="mr-2 shrink-0" size={20} /> {error}</div>}
            {successMessage && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 font-medium">{successMessage}</div>}

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Left Sidebar: Photo & Documents */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Profile Photo Card */}
                    <div className="glass-effect rounded-2xl p-6 border-t-4 border-t-brand-500 border border-zinc-200 dark:border-zinc-800 text-center relative group">
                        <div className="flex flex-col items-center">
                            {formData.profilePhoto ? (
                                <img src={formData.profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg object-top" />
                            ) : (
                                <div className="w-32 h-32 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center text-4xl font-display font-bold border-4 border-white dark:border-zinc-800 shadow-lg">
                                    {storedUser.email.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <label className="absolute top-32 right-1/2 translate-x-12 bg-brand-600 p-2.5 rounded-full text-white cursor-pointer hover:bg-brand-700 transition shadow-md">
                                <Camera size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </label>

                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-6 w-full truncate text-center">
                                {formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : (storedUser.email.split('@')[0] || 'Unregistered User')}
                            </h2>
                            <p className="text-sm text-zinc-500 w-full truncate">{storedUser.email}</p>

                            <p className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-3 tracking-wider uppercase bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                                {storedUser.role}
                            </p>
                        </div>
                    </div>

                    {/* Quick Documents Upload inline */}
                    <div className="glass-effect rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-bold mb-4 text-zinc-900 dark:text-white flex items-center text-sm">
                            <UploadCloud className="mr-2 text-brand-500 shrink-0" size={16} /> Default Requirements
                        </h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 outline-none">
                                    <option value="ID">Government ID</option>
                                    <option value="Certificate">Qualification Certificate</option>
                                    <option value="Resume">Resume / CV</option>
                                    <option value="Transcript">Transcript of Records</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <input id="file-upload" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileChange} className="w-full text-xs text-zinc-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-colors" />
                            </div>
                            <button type="submit" disabled={!selectedFile || uploading} className="w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                {uploading ? 'Uploading...' : 'Upload Document'}
                            </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-2 rounded relative group">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium truncate text-zinc-700 dark:text-zinc-300 hover:text-brand-600 block w-full">{doc.filename}</a>
                                    <button onClick={() => handleDelete(doc.id)} className="text-red-500 opacity-0 group-hover:opacity-100 p-1"><Trash2 size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="xl:col-span-3">
                    <form onSubmit={handleProfileSubmit} className="glass-effect rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">

                        {/* Header Warning */}
                        <div className="bg-sky-50 dark:bg-sky-900/20 px-6 py-4 border-b border-sky-100 dark:border-sky-800/50">
                            <p className="text-sky-800 dark:text-sky-300 font-medium flex items-center">
                                <FileText className="mr-2" size={18} /> Please fill up the mandatory fields (<span className="text-red-500 mx-1">*</span>)
                            </p>
                        </div>

                        <div className="p-6 md:p-8 space-y-10">

                            {/* SECTION 1: Personal Information */}
                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b-2 border-brand-500 pb-2 mb-6 inline-block">* Personal Information</h3>
                                <div className="space-y-5">
                                    {/* Name Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <input type="text" name="lastName" value={formData.lastName} onChange={handleProfileChange} placeholder="Last Name" required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-zinc-900 dark:text-white" />
                                        </div>
                                        <div>
                                            <input type="text" name="firstName" value={formData.firstName} onChange={handleProfileChange} placeholder="First Name" required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-zinc-900 dark:text-white" />
                                        </div>
                                        <div>
                                            <input type="text" name="middleName" value={formData.middleName} onChange={handleProfileChange} placeholder="Middle Name" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-zinc-900 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <input type="text" placeholder="Middle Initial (Optional)" className="w-full p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded text-sm text-zinc-500" disabled />
                                        </div>
                                        <div className="md:col-span-2">
                                            <input type="text" name="extensionName" value={formData.extensionName} onChange={handleProfileChange} placeholder="Extension Name (e.g Jr, Sr)" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-zinc-900 dark:text-white" />
                                        </div>
                                    </div>

                                    {/* Birthplace Row */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2">* Birthplace:</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <select name="birthplaceRegion" value={formData.birthplaceRegion} onChange={handleProfileChange} required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white">
                                                <option value="">Select Region</option>
                                                {regions.map(r => (
                                                    <option key={r.code} value={r.name}>{r.name}</option>
                                                ))}
                                            </select>
                                            <select name="birthplaceProvince" value={formData.birthplaceProvince || formData.birthplaceDistrict} onChange={handleProfileChange} required disabled={!formData.birthplaceRegion} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white disabled:opacity-50">
                                                <option value="">Select Province</option>
                                                {getProvinces(formData.birthplaceRegion).map(p => (
                                                    <option key={p.code} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                            <select name="birthplaceCity" value={formData.birthplaceCity} onChange={handleProfileChange} required disabled={!formData.birthplaceProvince && !formData.birthplaceDistrict} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white disabled:opacity-50">
                                                <option value="">City/Municipality</option>
                                                {getCities(formData.birthplaceProvince || formData.birthplaceDistrict).map(c => (
                                                    <option key={c.code} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleProfileChange} required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" title="Date of Birth" />
                                            <select name="sex" value={formData.sex} onChange={handleProfileChange} required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white">
                                                <option value="">Sex</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            <select name="nationality" value={formData.nationality} onChange={handleProfileChange} required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white">
                                                <option value="Filipino">Filipino</option>
                                                <option value="Foreigner">Foreigner</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* SECTION 2: Contact Information */}
                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b-2 border-brand-500 pb-2 mb-6 inline-block">* Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input type="email" value={storedUser.email} disabled className="w-full p-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-300 dark:border-zinc-700 rounded text-sm cursor-not-allowed" title="Email Address is fixed to your login." />
                                    <input type="tel" name="contact" value={formData.contact} onChange={handleProfileChange} placeholder="Mobile No" required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                    <input type="tel" name="telephoneNumber" value={formData.telephoneNumber} onChange={handleProfileChange} placeholder="Telephone No" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                </div>
                            </section>

                            {/* SECTION 3: Permanent Address */}
                            <section>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b-2 border-brand-500 pb-2 mb-6 inline-block">* Complete Permanent Mailing Address:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <input type="text" name="street" value={formData.street} onChange={handleProfileChange} placeholder="Number, Street" required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                    <input type="text" name="barangay" value={formData.barangay} onChange={handleProfileChange} placeholder="Barangay / Subdivision" required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                    <input type="text" placeholder="Zip Code" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <select name="region" value={formData.region} onChange={handleProfileChange} required className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white">
                                        <option value="">Select Region</option>
                                        {regions.map(r => (
                                            <option key={r.code} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                    <select name="province" value={formData.province || formData.district} onChange={handleProfileChange} required disabled={!formData.region} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white disabled:opacity-50">
                                        <option value="">Select Province</option>
                                        {getProvinces(formData.region).map(p => (
                                            <option key={p.code} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                    <select name="city" value={formData.city} onChange={handleProfileChange} required disabled={!formData.province && !formData.district} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white disabled:opacity-50">
                                        <option value="">City / Municipality</option>
                                        {getCities(formData.province || formData.district).map(c => (
                                            <option key={c.code} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </section>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* STUDENT ONLY SECTIONS */}
                            {storedUser?.role === 'STUDENT' && (
                                <>
                                    {/* SECTION 4: Parents / Guardian */}
                                    <section>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b-2 border-brand-500 pb-2 mb-6 inline-block">Parents / Guardian</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-1">
                                                <input type="text" name="parentName" value={formData.parentName} onChange={handleProfileChange} placeholder="Full Name" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <input type="text" name="parentAddress" value={formData.parentAddress} onChange={handleProfileChange} placeholder="Complete Permanent Mailing Address" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* SECTION 5: Farmer/Beneficiaries */}
                                    <section>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b-2 border-brand-500 pb-2 mb-6 inline-block">Farmer/Beneficiaries <span className="text-zinc-500 text-sm font-normal ml-2">(If applicable)</span></h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input type="text" name="rsbsaNumber" value={formData.rsbsaNumber} onChange={handleProfileChange} placeholder="RSBSA #" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                            <input type="text" name="farmerName" value={formData.farmerName} onChange={handleProfileChange} placeholder="Name of Farmer" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" name="farmerRelationship" value={formData.farmerRelationship} onChange={handleProfileChange} placeholder="Relationship to the Farmer" className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm outline-none focus:border-brand-500 text-zinc-900 dark:text-white" />
                                        </div>
                                    </section>

                                    <hr className="border-zinc-200 dark:border-zinc-800" />

                                    {/* SECTION 6: Consent */}
                                    <section className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
                                            I hereby attest that I have read and understood the Privacy Notice of TESDA through its website (https://www.tesda.gov.ph) and thereby giving my consent in the processing of my personal information indicated in this Learners Profile. The processing includes scholarships, employment, survey, and all other related TESDA programs that may be beneficial to my qualifications.
                                        </p>

                                        <div className="flex items-center space-x-6">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="privacyConsent"
                                                    value="true"
                                                    checked={formData.privacyConsent === true}
                                                    onChange={handleRadioChange}
                                                    required
                                                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                                                />
                                                <span className="text-zinc-900 dark:text-white font-bold">Agree</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="privacyConsent"
                                                    value="false"
                                                    checked={formData.privacyConsent === false}
                                                    onChange={handleRadioChange}
                                                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                                                />
                                                <span className="text-zinc-900 dark:text-white">Disagree</span>
                                            </label>
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* Notice & Buttons */}
                            <div className="pt-6">
                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center mb-6">
                                    <input type="checkbox" required className="mr-3 w-4 h-4 rounded text-brand-600" />
                                    Please "RE-CHECK" all entries and edit as necessary before clicking the "CREATE" button.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 sm:justify-start">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-10 py-3 bg-[#42A5F5] hover:bg-blue-500 text-white font-bold rounded shadow-lg transition-colors flex items-center justify-center disabled:opacity-70"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                                        CREATE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-10 py-3 bg-[#EF5350] hover:bg-red-500 text-white font-bold rounded shadow-lg transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw size={18} className="mr-2" />
                                        RESET
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Render Modal Overlay Safely */}
            {showCropper && cropperSrc && (
                <ImageCropperModal
                    src={cropperSrc}
                    onCropComplete={processCroppedImage}
                    onCancel={cancelCropper}
                />
            )}
        </div>
    );
};

export default Profile;
