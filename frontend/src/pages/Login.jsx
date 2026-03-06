import React, { useState } from 'react';
import { Mail, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('email');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Check if user was redirected due to an expired session
    const isSessionExpired = new URLSearchParams(window.location.search).get('expired') === '1';

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/send-otp', { email });
            setStep('otp');
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            const { token, user } = response.data;

            // Store auth data via AuthContext
            login(token, user);

            // Redirect all authenticated users to profile initially
            // The routing/gate logic will then decide if they can move on
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md glass-effect rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-display font-bold text-center text-zinc-900 dark:text-white mb-2">
                    {step === 'email' ? 'Welcome Back' : 'Verify Identity'}
                </h2>
                <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">
                    {step === 'email'
                        ? 'Sign in via Gmail OTP to continue'
                        : `Enter the code sent to ${email}`
                    }
                </p>

                {isSessionExpired && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-sm text-center">
                        Your session has expired. Please log in again.
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {step === 'email' ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="you@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/20 flex justify-center items-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">6-Digit Code</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // numbers only
                                    className="w-full pl-10 pr-4 py-3 text-center tracking-[0.5em] font-mono text-xl rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/20 flex justify-center items-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Verify & Login <ArrowRight className="ml-2" size={18} /></>
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="text-sm text-zinc-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                            >
                                Use a different email
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
