import React, { useState, useEffect } from 'react';
import { Gift, Trophy, History, ArrowRight, Loader2, Star, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/client.js';
import { API_BASE_URL } from '../config.js';

const Rewards = () => {
    const { user } = useAuth();
    const [rewards, setRewards] = useState([]);
    const [pointsData, setPointsData] = useState({ balance: 0, transactions: [] });
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pointsRes, partnersRes] = await Promise.all([
                api.get('/points/balance'),
                api.get('/partners')
            ]);
            setPointsData(pointsRes.data);

            // Flatten rewards from all partners
            const allRewards = partnersRes.data.reduce((acc, partner) => {
                const partnerRewards = (partner.rewards || []).map(r => ({
                    ...r,
                    partnerName: partner.name
                }));
                return [...acc, ...partnerRewards];
            }, []);
            setRewards(allRewards);
        } catch (err) {
            console.error('Failed to load rewards data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward) => {
        if (pointsData.balance < reward.points) {
            setMessage({ type: 'error', text: 'Insufficient points for this reward.' });
            return;
        }

        if (!window.confirm(`Redeem ${reward.points} points for ${reward.title}?`)) return;

        setRedeeming(reward.id);
        try {
            await api.post('/points/redeem', {
                amount: reward.points,
                rewardTitle: `${reward.partnerName} ${reward.title}`
            });
            setMessage({ type: 'success', text: `Successfully redeemed! Your certificate code will be sent to your email.` });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Redemption failed.' });
        } finally {
            setRedeeming(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-brand-500" size={40} /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white flex items-center mb-2">
                        <Gift className="mr-4 text-brand-600 dark:text-brand-400" size={40} />
                        Rewards Center
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">Redeem your hard-earned points for exclusive partner rewards.</p>
                </div>

                {user?.role === 'STUDENT' && (
                    <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 rounded-2xl shadow-xl text-white flex items-center gap-6 min-w-[240px]">
                        <div className="bg-white/20 p-3 rounded-full">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Current Balance</span>
                            <div className="text-4xl font-black">{pointsData.balance} <span className="text-lg font-medium opacity-80 ml-1">pts</span></div>
                        </div>
                    </div>
                )}
            </div>

            {user?.role !== 'STUDENT' && (
                <div className="mb-10 p-8 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center max-w-2xl mx-auto">
                    <ShieldAlert className="mx-auto mb-4 text-amber-500" size={48} />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Student Exclusive Feature</h2>
                    <p className="text-zinc-600 dark:text-zinc-400">The rewards program and point redemption are exclusively available to student accounts. Staff, trainers, and administrators are restricted from these actions.</p>
                </div>
            )}

            {message.text && (
                <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 border shadow-sm ${message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                    : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
                        <Star className="mr-3 text-amber-500" size={24} fill="currentColor" />
                        Available Rewards
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rewards.map(reward => (
                            <div key={reward.id} className="glass-effect rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                <div className="h-48 overflow-hidden relative">
                                    {reward.image ? (
                                        <img src={reward.image.startsWith('http') ? reward.image : `${API_BASE_URL}${reward.image}`} alt={reward.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300"><Gift size={48} /></div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-brand-600 rounded-md shadow-sm">
                                            {reward.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{reward.title}</h3>
                                        <span className="font-black text-brand-600 dark:text-brand-400">{reward.points} pts</span>
                                    </div>
                                    <p className="text-zinc-500 text-sm mb-6 flex items-center gap-2">
                                        By <span className="font-bold text-zinc-700 dark:text-zinc-300">{reward.partnerName}</span>
                                    </p>
                                    {user?.role === 'STUDENT' ? (
                                        <button
                                            onClick={() => handleRedeem(reward)}
                                            disabled={redeeming === reward.id || pointsData.balance < reward.points}
                                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${pointsData.balance >= reward.points
                                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] shadow-lg'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {redeeming === reward.id ? <Loader2 size={18} className="animate-spin" /> : <Gift size={18} />}
                                            {pointsData.balance >= reward.points ? 'Redeem Now' : 'Not Enough Points'}
                                        </button>
                                    ) : (
                                        <div className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-xl font-bold text-center text-xs opacity-50">
                                            Only for students
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {rewards.length === 0 && (
                            <div className="col-span-full py-16 text-center text-zinc-500">
                                <Gift size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No reward offers available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center">
                        <History className="mr-3 text-zinc-400" size={24} />
                        Recent Activity
                    </h2>

                    <div className="glass-effect rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                        {pointsData.transactions.length > 0 ? (
                            pointsData.transactions.map(tx => (
                                <div key={tx.id} className="p-4 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            <Trophy size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white">{tx.reason}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase font-black">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className={`font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-zinc-500 text-sm">
                                <History size={40} className="mx-auto mb-4 opacity-20" />
                                No recent activity found.
                            </div>
                        )}
                        <div className="p-4 text-center">
                            <button className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1 mx-auto transition-colors">
                                View Full History <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rewards;
