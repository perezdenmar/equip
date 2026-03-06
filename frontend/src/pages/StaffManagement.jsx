import React, { useState, useEffect } from 'react';
import { Briefcase, Loader2, Edit2, Trash2, Shield, User, X, Plus, Check, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

const StaffManagement = () => {
    const { t } = useTranslation();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'STAFF',
        isTrainer: false,
        contact: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/staff');
            setStaff(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to load staff:', err);
            setError('Failed to load staff list. Admin permissions required.');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingStaff(null);
        setFormData({
            email: '',
            firstName: '',
            lastName: '',
            role: 'STAFF',
            isTrainer: false,
            contact: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (member) => {
        setEditingStaff(member);
        setFormData({
            email: member.email,
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            role: member.role || 'STAFF',
            isTrainer: member.isTrainer || false,
            contact: member.contact || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingStaff) {
                const res = await api.put(`/users/${editingStaff.id}`, formData);
                setStaff(staff.map(s => s.id === editingStaff.id ? { ...s, ...res.data } : s));
            } else {
                const res = await api.post('/users/staff', formData);
                setStaff([res.data, ...staff]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save staff member', err);
            alert(err.response?.data?.error || 'Failed to save staff member.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await api.delete(`/users/${id}`);
            setStaff(staff.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete staff member', err);
            alert('Failed to delete. They might be tied to active records.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <Briefcase className="mr-4 text-amber-600 dark:text-amber-400" size={40} />
                        Manage Staff
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        Add and manage teaching and non-teaching personnel. Designate roles and teaching status.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="mt-6 md:mt-0 flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
                >
                    <Plus className="mr-2" size={20} /> Add Staff Member
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand-600 dark:text-brand-400">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p className="font-medium">Loading staff directory...</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Designation</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Teaching</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                {staff.map((member) => (
                                    <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold">
                                                    {member.firstName ? member.firstName[0] : <User size={18} />}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {member.firstName} {member.lastName}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold 
                                                ${member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                                                    member.role === 'TRAINER' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30'}`}>
                                                {member.role === 'ADMIN' && <Shield size={12} className="mr-1" />}
                                                {member.role === 'TRAINER' ? 'Teaching Staff' : member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {member.isTrainer ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    <GraduationCap size={12} className="mr-1" /> Teaching
                                                </span>
                                            ) : (
                                                <span className="text-xs text-zinc-400 italic">Non-Teaching</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(member)} className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-200 mr-4">Edit</button>
                                            <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal for Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {!editingStaff && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                        placeholder="staff@gmail.com"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Account Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    >
                                        <option value="STAFF">Staff</option>
                                        <option value="TRAINER">Trainer</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.isTrainer}
                                                onChange={(e) => setFormData({ ...formData, isTrainer: e.target.checked })}
                                            />
                                            <div className={`w-12 h-6 rounded-full transition-colors ${formData.isTrainer ? 'bg-brand-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
                                            <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isTrainer ? 'translate-x-6' : ''}`}></div>
                                        </div>
                                        <span className="ml-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Teaching Staff?</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end space-x-3 border-t border-zinc-100 dark:border-zinc-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all flex items-center shadow-lg shadow-brand-500/20">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : <Check className="mr-2" size={20} />}
                                    {editingStaff ? 'Update Member' : 'Add Staff member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
