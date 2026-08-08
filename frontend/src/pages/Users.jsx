import React, { useState, useEffect, useMemo } from 'react';
import {
    Users as UsersIcon, Loader2, Edit2, Trash2, Shield, User, X,
    AlertTriangle, Search, ChevronUp, ChevronDown, ChevronsUpDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';

// ─── helpers ────────────────────────────────────────────────────────────────
const getAvatarColor = (role) => {
    switch (role) {
        case 'ADMIN':   return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
        case 'TRAINER': return 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300';
        case 'STAFF':   return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        default:        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300';
    }
};

const getRoleBadge = (role) => {
    switch (role) {
        case 'ADMIN':   return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
        case 'TRAINER': return 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300';
        case 'STAFF':   return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        default:        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
};

const ROLES = ['ALL', 'ADMIN', 'TRAINER', 'STAFF', 'STUDENT'];

// ─── sort icon component ─────────────────────────────────────────────────────
const SortIcon = ({ column, sortKey, sortDir }) => {
    if (sortKey !== column) return <ChevronsUpDown size={13} className="ml-1 text-zinc-400 inline" />;
    return sortDir === 'asc'
        ? <ChevronUp size={13} className="ml-1 text-brand-500 inline" />
        : <ChevronDown size={13} className="ml-1 text-brand-500 inline" />;
};

// ─── component ───────────────────────────────────────────────────────────────
const Users = () => {
    const { t } = useTranslation();
    const [users, setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState('');

    // Search + filter + sort
    const [search, setSearch]       = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [sortKey, setSortKey]     = useState('createdAt');
    const [sortDir, setSortDir]     = useState('desc');

    // Edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser]         = useState(null);
    const [formData, setFormData]               = useState({ firstName: '', lastName: '', role: 'STUDENT' });
    const [isSubmitting, setIsSubmitting]       = useState(false);

    // Delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete]           = useState(null);
    const [isDeleting, setIsDeleting]               = useState(false);

    useEffect(() => { fetchUsers(); }, []);

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

    // ── derived list: search → filter → sort ─────────────────────────────
    const displayedUsers = useMemo(() => {
        const q = search.trim().toLowerCase();

        let list = users.filter((u) => {
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
            const matchesSearch = !q || fullName.includes(q) || (u.email || '').toLowerCase().includes(q);
            const matchesRole   = roleFilter === 'ALL' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });

        list = [...list].sort((a, b) => {
            let aVal, bVal;
            if (sortKey === 'name') {
                aVal = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
                bVal = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
            } else if (sortKey === 'email') {
                aVal = (a.email || '').toLowerCase();
                bVal = (b.email || '').toLowerCase();
            } else if (sortKey === 'role') {
                aVal = a.role || '';
                bVal = b.role || '';
            } else {
                // createdAt
                aVal = new Date(a.createdAt).getTime();
                bVal = new Date(b.createdAt).getTime();
            }
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ?  1 : -1;
            return 0;
        });

        return list;
    }, [users, search, roleFilter, sortKey, sortDir]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    // ── edit ─────────────────────────────────────────────────────────────
    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({ firstName: user.firstName || '', lastName: user.lastName || '', role: user.role || 'STUDENT' });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.put(`/users/${editingUser.id}`, formData);
            setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...res.data } : u)));
            setIsEditModalOpen(false);
        } catch (err) {
            console.error('Failed to update user', err);
            alert('Failed to update user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── delete ────────────────────────────────────────────────────────────
    const openDeleteModal  = (user) => { setUserToDelete(user); setIsDeleteModalOpen(true); };
    const handleDeleteCancel = () => { setIsDeleteModalOpen(false); setUserToDelete(null); };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/users/${userToDelete.id}`);
            setUsers(users.filter((u) => u.id !== userToDelete.id));
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (err) {
            console.error('Failed to delete user', err);
            alert('Failed to delete user. They might be tied to existing active records.');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── sortable th helper ────────────────────────────────────────────────
    const Th = ({ colKey, children, right = false }) => (
        <th
            className={`px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors ${right ? 'text-right' : 'text-left'}`}
            onClick={() => handleSort(colKey)}
        >
            {children}
            <SortIcon column={colKey} sortKey={sortKey} sortDir={sortDir} />
        </th>
    );

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in relative">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <UsersIcon className="mr-4 text-brand-600 dark:text-brand-400" size={40} />
                        User Management
                        {/* live count badge */}
                        {!loading && (
                            <span className="ml-4 text-base font-semibold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                {displayedUsers.length} / {users.length}
                            </span>
                        )}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                        Manage system access, promote Trainers, or revoke privileges.
                    </p>
                </div>
            </div>

            {/* ── Search + Role filter bar ── */}
            {!loading && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Role filter pills */}
                    <div className="flex gap-1.5 flex-wrap">
                        {ROLES.map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors ${
                                    roleFilter === r
                                        ? 'bg-brand-600 text-white shadow-sm'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {r === 'ALL' ? 'All Roles' : r}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                                    <Th colKey="name">User</Th>
                                    <Th colKey="email">Contact</Th>
                                    <Th colKey="role">Role</Th>
                                    <Th colKey="createdAt">Joined</Th>
                                    {/* Actions column — not sortable */}
                                    <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                                {displayedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-zinc-400 dark:text-zinc-500">
                                            <Search size={32} className="mx-auto mb-3 opacity-40" />
                                            <p className="text-sm font-medium">No users match your search</p>
                                            <button
                                                onClick={() => { setSearch(''); setRoleFilter('ALL'); }}
                                                className="mt-2 text-xs text-brand-500 hover:text-brand-700 underline transition-colors"
                                            >
                                                Clear filters
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    displayedUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full font-bold text-sm ${getAvatarColor(u.role)}`}>
                                                        {u.firstName ? u.firstName[0].toUpperCase() : <User size={18} />}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {u.firstName || u.lastName
                                                                ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                                                                : null}
                                                        </div>
                                                        {!u.firstName && !u.lastName && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm text-zinc-400 italic">No Name Set</span>
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                    <AlertTriangle size={9} /> Incomplete
                                                                </span>
                                                            </div>
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
                                                    onClick={() => openDeleteModal(u)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit User & Access</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
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
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors flex items-center">
                                    {isSubmitting && <Loader2 className="animate-spin mr-2" size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {isDeleteModalOpen && userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/70 backdrop-blur-sm" onClick={handleDeleteCancel}>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Delete User</h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">This action cannot be undone</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">You are about to permanently delete:</p>
                            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 mb-4">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                    {userToDelete.firstName || userToDelete.lastName
                                        ? `${userToDelete.firstName || ''} ${userToDelete.lastName || ''}`.trim()
                                        : 'Unnamed User'}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{userToDelete.email}</p>
                                <span className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${getRoleBadge(userToDelete.role)}`}>
                                    {userToDelete.role === 'ADMIN' && <Shield size={10} className="mr-1" />}
                                    {userToDelete.role}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                All enrollment records, certificates, and data tied to this account will be affected.
                            </p>
                        </div>
                        <div className="flex gap-3 px-6 pb-6">
                            <button onClick={handleDeleteCancel} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                                {isDeleting && <Loader2 className="animate-spin" size={15} />}
                                {isDeleting ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
