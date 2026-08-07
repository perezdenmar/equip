import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, UserPlus, Heart, Briefcase, Settings } from 'lucide-react';

const QuickActions = () => {
    return (
        <div className="bg-white/70 backdrop-blur-md dark:bg-zinc-900/70 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-4">
                <Link to="/qualifications" className="flex items-center p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <Plus size={20} />
                    </div>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Courses</div>
                </Link>
                <Link to="/trainers" className="w-full flex items-center p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <BookOpen size={20} />
                    </div>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Trainers</div>
                </Link>
                <Link to="/students" className="w-full flex items-center p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <Users size={20} />
                    </div>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Students</div>
                </Link>
                <Link to="/users" className="w-full flex items-center p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-brand-500/30 group">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg mr-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <UserPlus size={20} />
                    </div>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Users</div>
                </Link>
                <Link to="/partners" className="w-full flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-transparent hover:border-emerald-500/30 group">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg mr-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Heart size={20} />
                    </div>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Partners</div>
                </Link>
                <Link to="/staff" className="w-full flex items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-transparent hover:border-amber-500/30 group">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg mr-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Briefcase size={20} />
                    </div>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Manage Staff</div>
                </Link>
                <Link to="/admin/settings" className="w-full flex items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors border border-transparent hover:border-amber-500/30 group">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg mr-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Settings size={20} />
                    </div>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">Landing Page (CMS)</div>
                </Link>
            </div>
        </div>
    );
};

export default QuickActions;
