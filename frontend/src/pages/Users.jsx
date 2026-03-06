import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Loader2, Edit2, Trash2, Shield, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

const Users = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', role: 'STUDENT' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to load users:', err);
            setError('Failed to load users. You may not have Admin permissions.');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role || 'STUDENT'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.put(`/users/${editingUser.id}`, formData);
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...res.data } : u));
            setIsEditModalOpen(false);
        } catch (err) {
            console.error('Failed to update user', err);
            alert('Failed to update user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure you want to delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error('Failed to delete user', err);
            alert('Failed to delete user. They might be tied to existing active records.');
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
            case 'TRAINER': return 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300';
            case 'STAFF': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <UsersIcon className="mr-4 text-brand-600 dark:text-brand-400" size={40} />
                        User Management
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        Manage system access, promote Trainers, or revoke privileges.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand-600 dark:text-brand-400">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p className="font-medium">Loading user directory...</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold">
                                                    {u.firstName ? u.firstName[0] : <User size={18} />}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {u.firstName} {u.lastName}
                                                    </div>
                                                    {!u.firstName && !u.lastName && (
                                                        <div className="text-sm text-zinc-500 italic">No Name Set</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-zinc-900 dark:text-zinc-300">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getRoleBadge(u.role)}`}>
                                                {u.role === 'ADMIN' && <Shield size={12} className="mr-1" />}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(u)}
                                                className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300 mr-4 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Edit User & Access
                            </h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Account Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="TRAINER">Trainer</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 rounded-lg font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors flex items-center"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
