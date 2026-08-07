import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const MetricCard = ({ title, value, icon, color, data }) => {
    // Determine the color classes based on the passed color string
    const colorMap = {
        blue: { border: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', stroke: '#3b82f6' },
        emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', stroke: '#10b981' },
        indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', stroke: '#6366f1' },
        accent: { border: 'border-l-accent-500', bg: 'bg-accent-50 dark:bg-accent-900/20', text: 'text-accent-600 dark:text-accent-400', stroke: '#f43f5e' }, // using a red/pink for accent
    };

    const style = colorMap[color] || colorMap.blue;

    // Fake sparkline data for visual flair (in a real app, this would come from the backend)
    const sparklineData = data || [
        { value: Math.max(0, value - Math.floor(Math.random() * 20)) },
        { value: Math.max(0, value - Math.floor(Math.random() * 10)) },
        { value: Math.max(0, value - Math.floor(Math.random() * 5)) },
        { value: value },
    ];

    return (
        <div className={`bg-white/70 backdrop-blur-md dark:bg-zinc-900/70 p-6 rounded-2xl flex flex-col border-l-4 ${style.border} shadow-sm border border-zinc-200/50 dark:border-zinc-800/50`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-display font-bold text-zinc-900 dark:text-white">{value}</h3>
                </div>
                <div className={`p-4 ${style.bg} rounded-xl ${style.text}`}>
                    {icon}
                </div>
            </div>
            
            {/* Recharts Sparkline */}
            <div className="h-10 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                        <Line type="monotone" dataKey="value" stroke={style.stroke} strokeWidth={2} dot={false} isAnimationActive={true} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetricCard;
