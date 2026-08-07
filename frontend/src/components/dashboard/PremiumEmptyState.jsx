import React from 'react';
import { ClipboardCheck } from 'lucide-react';

const PremiumEmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
            <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4">
                <ClipboardCheck size={40} className="text-brand-500 dark:text-brand-400" />
            </div>
            <h4 className="text-xl font-display font-semibold text-zinc-900 dark:text-white mb-2">All Caught Up!</h4>
            <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
                There are currently no pending enrollment requests to review. Enjoy your free time!
            </p>
        </div>
    );
};

export default PremiumEmptyState;
