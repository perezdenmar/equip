import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Facebook, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client.js';
import { useSettings } from '../contexts/SettingsContext.jsx';

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const [contactInfo, setContactInfo] = useState({
        companyName: 'Equip Quantum Upskilling Institute of the Philippines, Inc.',
        address: 'National Highway, San Jose\nDigos City, Davao del Sur 8002',
        phone: '0961-701-8568',
        email: 'quantumgroupph@gmail.com',
        facebook: 'https://www.facebook.com/equipdigos'
    });

    const { settings } = useSettings();

    useEffect(() => {
        if (settings && settings.contact_info) {
            setContactInfo(settings.contact_info);
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await api.post('/contact', formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
        } catch (error) {
            console.error('Submission error:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.error || 'Failed to send message. Please try again later.');
        }
    };

    return (
        <div className="pt-24 pb-16 min-h-screen">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-4">
                    Get in <span className="text-brand-600 dark:text-brand-400">Touch</span>
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    Have questions about our programs, partnerships, or enrollment? We'd love to hear from you. Send us a message and our team will respond shortly.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

                    {/* Contact Information (Left Column) */}
                    <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>

                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 relative z-10">Contact Information</h2>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                            <MapPin size={20} />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Our Headquarters</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 mt-1 whitespace-pre-line">
                                            {contactInfo.companyName}<br />
                                            {contactInfo.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                            <Phone size={20} />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Phone Support</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                                            <a href={`tel:${contactInfo.phone.replace(/[^0-9]/g, '')}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{contactInfo.phone}</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                            <Mail size={20} />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Email Us</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                                            <a href={`mailto:${contactInfo.email}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{contactInfo.email}</a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 relative z-10">
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Connect With Us</h3>
                                <div className="flex space-x-4">
                                    {contactInfo.facebook && (
                                        <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-[#1877F2] hover:text-white transition-all duration-300 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:border-[#1877F2]">
                                            <Facebook size={24} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form (Right Column) */}
                    <div className="lg:col-span-3 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/20">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Send Us a Message</h2>

                            {status === 'success' ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Message Sent!</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">
                                        Thank you for reaching out to EQUIP. We have received your message and will get back to you as soon as possible.
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-8 px-6 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {status === 'error' && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start text-red-600 dark:text-red-400 animate-in fade-in">
                                            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                                            <p className="text-sm">{errorMessage}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-zinc-400"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-zinc-400"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-zinc-400"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none placeholder:text-zinc-400"
                                            placeholder="Write your message here..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                                    >
                                        {status === 'loading' ? (
                                            <><Loader2 className="animate-spin mr-2" size={20} /> Sending Message...</>
                                        ) : (
                                            <>Send Message <Send className="ml-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={20} /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
