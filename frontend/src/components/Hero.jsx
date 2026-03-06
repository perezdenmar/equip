import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Briefcase, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <div className="relative overflow-hidden bg-white dark:bg-zinc-950 pt-20 pb-32">
            {/* Background decoration elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-100 dark:bg-brand-900/40 blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute top-40 left-0 -ml-20 w-72 h-72 rounded-full bg-accent-100 dark:bg-accent-900/30 blur-3xl opacity-50 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
                <div className="inline-flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full py-1 px-4 mb-8">
                    <ShieldCheck size={16} className="text-brand-600 dark:text-brand-400" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {t('hero.subtitle')}
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 text-zinc-900 dark:text-white leading-tight">
                    {t('hero.title').split(' ').map((word, i) => (
                        i === t('hero.title').split(' ').length - 1
                            ? <span key={i} className="text-gradient"> {word}</span>
                            : <span key={i}> {word}</span>
                    ))}
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed">
                    {t('hero.description')}
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <Link
                        to="/qualifications"
                        className="group inline-flex items-center justify-center px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-medium transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50"
                    >
                        <BookOpen className="mr-2" size={20} />
                        {t('hero.cta')}
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <Link
                        to="/jobs"
                        className="group inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-full font-medium transition-all shadow-sm"
                    >
                        <Briefcase className="mr-2" size={20} />
                        {t('nav.jobs')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
