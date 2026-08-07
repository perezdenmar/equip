import React, { useState } from 'react';
import { Award, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client.js';
import PremiumEmptyState from './PremiumEmptyState';

const RecentEnrollmentRequests = () => {
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const fetchEnrollments = async (pageParam) => {
        const res = await api.get(`/enrollments?page=${pageParam}&limit=10`);
        return res.data;
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['enrollments', page],
        queryFn: () => fetchEnrollments(page),
        keepPreviousData: true,
        refetchInterval: 30000 // Real-time polling every 30s
    });

    const handleEnrollmentAction = async (id, status) => {
        try {
            await api.patch(`/enrollments/${id}/status`, { status });
            // Invalidate to trigger a fresh refetch
            queryClient.invalidateQueries(['enrollments']);
            queryClient.invalidateQueries(['recentActivity']);
            queryClient.invalidateQueries(['dashboardMetrics']);
        } catch (error) {
            console.error('Failed to update enrollment', error);
            alert('Failed to update enrollment status');
        }
    };

    return (
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md dark:bg-zinc-900/70 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center">
                <Award className="mr-2 text-brand-500" />
                Recent Enrollment Requests
            </h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm uppercase tracking-wider">
                            <th className="pb-3 px-2 font-medium">Student</th>
                            <th className="pb-3 px-2 font-medium">Course</th>
                            <th className="pb-3 px-2 font-medium">Date</th>
                            <th className="pb-3 px-2 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {isLoading ? (
                            <tr><td colSpan="4" className="py-8 text-center text-zinc-500 italic flex justify-center"><Loader2 className="animate-spin" /></td></tr>
                        ) : isError ? (
                            <tr><td colSpan="4" className="py-8 text-center text-red-500 italic">Error loading requests.</td></tr>
                        ) : !Array.isArray(data?.data) || data.data.length === 0 ? (
                            <tr><td colSpan="4" className="py-8"><PremiumEmptyState /></td></tr>
                        ) : data.data.map(req => (
                            <tr key={req.id} className="text-zinc-700 dark:text-zinc-300">
                                <td className="py-4 px-2 font-medium">
                                    <div className="flex flex-col">
                                        <span>{req.user.firstName} {req.user.lastName}</span>
                                        <span className="text-xs text-zinc-500">{req.user.email}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-2">{req.qualification.title}</td>
                                <td className="py-4 px-2 text-sm text-zinc-500">{new Date(req.requestedAt).toLocaleDateString()}</td>
                                <td className="py-4 px-2">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEnrollmentAction(req.id, 'APPROVED')}
                                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleEnrollmentAction(req.id, 'REJECTED')}
                                            className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                        >
                                            Deny
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <span className="text-sm text-zinc-500">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <div className="flex space-x-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 disabled:opacity-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button 
                            disabled={page === data.pagination.totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 disabled:opacity-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentEnrollmentRequests;
