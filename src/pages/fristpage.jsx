import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentCreatorBot from '../components/chatbot';
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    Bot,
    BrainCircuit,
    Stars,
    WandSparkles,
    Cpu,
    X,
    Menu,
    Home as HomeIcon,
    MessageSquare,
    Layers,
    User,
    ArrowUpRight
} from "lucide-react";

export default function TechookPremiumWorkspace({ bgImageUrl = "/FristPageBg.png" }) {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isChatOpen, setIsChatOpen] = useState(() => {
        return localStorage.getItem('techook_bot_open') === 'true';
    });

    const imageSrc = "/HLogo.png";

    const handleOpenChat = () => {
        localStorage.setItem('techook_bot_open', 'true');
        setIsChatOpen(true);
        setIsMobileMenuOpen(false);
    };

    const handleCloseChat = () => {
        localStorage.setItem('techook_bot_open', 'false');
        setIsChatOpen(false);
    };

    useEffect(() => {
        if (isChatOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isChatOpen]);

    const fullChatPanelVariants = {
        hidden: { y: '100%', opacity: 0.9 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', damping: 28, stiffness: 180 }
        },
        exit: {
            y: '100%',
            opacity: 0,
            transition: { ease: 'easeInOut', duration: 0.35 }
        }
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { ease: 'easeInOut', duration: 0.2 }
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col text-white font-sans antialiased bg-[#030307] overflow-x-hidden">

            {/* 1. Fixed Background Image */}
            {bgImageUrl && (
                <div
                    className="fixed inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `url(${bgImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            )}

            {/* 2. Professional Black Overlay */}
            {bgImageUrl && (
                <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/95 backdrop-blur-[3px] z-0 pointer-events-none" />
            )}

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col w-full min-h-screen">

                {/* TOP NAVIGATION BAR */}
                <header className="fixed md:absolute top-4 inset-x-4 md:inset-x-8 h-16 border border-white/[0.06] bg-[#05060f]/80 backdrop-blur-xl rounded-2xl px-4 md:px-6 flex items-center justify-between z-40 shadow-2xl">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-lg p-[1.5px] flex items-center justify-center overflow-hidden">
                            <img src={imageSrc} alt="Techook Studio" className="w-full h-full object-cover rounded-[6px]" />
                        </div>
                        <span className="text-sm font-bold tracking-wide text-white">
                            Techook Studio
                        </span>
                    </div>

                    {/* Center: Nav Links (Desktop) */}
                    <nav className="items-center hidden gap-8 md:flex">
                        <button className="flex items-center gap-2 text-sm font-medium text-purple-400 cursor-pointer">
                            <HomeIcon size={14} />
                            Home
                        </button>
                        <button onClick={handleOpenChat} className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer text-slate-300 hover:text-white">
                            <MessageSquare size={14} />
                            AI Chatbots
                        </button>
                        <button className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer text-slate-300 hover:text-white">
                            <Layers size={14} />
                            Next-Gen AI Studio
                        </button>
                    </nav>

                    {/* Right: Actions (Desktop) */}
                    <div className="items-center hidden gap-4 md:flex">
                        <button className="hidden sm:flex cursor-pointer relative overflow-hidden items-center gap-2 px-4 py-1.5 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/10 text-xs font-medium text-slate-200 transition-all duration-500 hover:bg-white/[0.05] hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] cursor-pointer group">
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="relative w-5 h-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300 ml-[1px]">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            </div>
                            <span className="relative z-10">How it works ?</span>
                        </button>
                        <div className="h-4 w-[1px] bg-white/[0.1]" />

                        {/* Dynamic Ultra-Premium Get Started Button (Desktop) */}
                        <button
                            onClick={() => navigate("/SignUpLogin")}
                            className="group relative flex cursor-pointer h-10 items-center gap-2.5 overflow-hidden rounded-xl
    bg-gradient-to-r
    from-[#6D28D9]
    via-[#8B5CF6]
    to-[#38BDF8]
    px-4 text-[13px] font-semibold text-white
    shadow-[0_10px_28px_rgba(124,58,237,.28)]
    transition-all duration-300
    hover:-translate-y-0.5
    hover:shadow-[0_14px_35px_rgba(56,189,248,.30)]
    active:scale-[0.97]
    cursor-pointer"
                        >

                            {/* Shine */}
                            <div className="absolute -left-20 top-0 h-full w-8 rotate-12 bg-white/25 blur-md transition-all duration-700 group-hover:left-[120%]" />

                            <User size={15} className="relative z-10" />

                            <span className="relative z-10">
                                Get Started
                            </span>

                            <ArrowUpRight
                                size={15}
                                className="relative z-10 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                            />

                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-1 cursor-pointer md:hidden text-slate-300 hover:text-white"
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </header>

                {/* MOBILE MENU DROPDOWN */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-x-4 top-24 z-40 p-6 rounded-2xl border border-white/[0.06] bg-[#05060f]/95 backdrop-blur-2xl md:hidden flex flex-col gap-6 shadow-2xl"
                        >
                            <div className="flex flex-col gap-4 border-b border-white/[0.05] pb-4">
                                <button className="flex items-center w-full gap-3 py-2 text-sm font-semibold text-left text-purple-400 cursor-pointer">
                                    <HomeIcon size={16} /> Home
                                </button>
                                <button onClick={handleOpenChat} className="flex items-center w-full gap-3 py-2 text-sm font-semibold text-left cursor-pointer text-slate-300 hover:text-white">
                                    <MessageSquare size={16} /> AI Chatbots
                                </button>
                                <button className="flex items-center w-full gap-3 py-2 text-sm font-semibold text-left cursor-pointer text-slate-300 hover:text-white">
                                    <Layers size={16} /> Next-Gen AI Studio
                                </button>
                            </div>

                            <div className="flex flex-col w-full gap-4">
                                <button className="flex cursor-pointer items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]">
                                    <div className="relative w-5 h-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300 ml-[1px]">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                    </div>
                                    How it works ?
                                </button>

                                {/* Stretched Full-Width Premium Get Started Button on Mobile */}
                                <div className="w-full pt-1">
                                    <button
                                        onClick={() => navigate("/SignUpLogin")}
                                        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden text-xs rounded-xl
    bg-gradient-to-r
    from-[#6D28D9]
    via-[#8B5CF6]
    to-[#38BDF8]
    px-5 py-3 text-sm font-semibold text-white
    shadow-[0_10px_30px_rgba(124,58,237,.30)]
    transition-all duration-300
    hover:-translate-y-0.5 cursor-pointer
    hover:shadow-[0_16px_40px_rgba(56,189,248,.35)]
    active:scale-[0.98]
    cursor-pointer"
                                    >

                                        {/* Shine */}
                                        <div className="absolute -left-24 top-0 h-full w-10 rotate-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[130%]" />

                                        {/* Left Icon */}
                                        <User size={17} className="relative z-10" />

                                        {/* Text */}
                                        <span className="relative z-10 flex-1 text-center">
                                            Get Started
                                        </span>

                                        {/* Right Arrow */}
                                        <ArrowUpRight
                                            size={17}
                                            className="relative z-10 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                                        />

                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MAIN CONTENT AREA */}
                <main className="flex flex-col items-center justify-center flex-1 w-full max-w-6xl px-4 pt-32 pb-16 mx-auto text-center md:pt-40">

                    {/* Premium Badge */}
                    <div className="group mb-5 relative inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] overflow-hidden">
                        <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-purple-500/5 via-white/5 to-cyan-500/5 group-hover:opacity-100" />
                        <div className="absolute inset-0 transition-transform duration-1000 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full" />
                        <div className="relative flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-md">
                            <WandSparkles size={13} className="text-white/80" />
                            <div className="absolute inset-0 rounded-full bg-purple-400/15 blur-md" />
                        </div>
                        <span className="relative text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90">
                            Next-Gen AI Content Studio
                        </span>
                        <div className="relative flex w-2 h-2">
                            <span className="absolute inline-flex w-full h-full rounded-full animate-ping bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                    </div>

                    {/* Hero Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.2] md:leading-[1.15] text-white mb-6 drop-shadow-xl max-w-4xl">
                        Create Content That <br className="hidden sm:inline" />
                        Forces People To <span className="bg-gradient-to-r from-[#7c7efb] to-[#d75cf6] bg-clip-text text-transparent">Stop<br className="sm:hidden" /> Scrolling</span>
                    </h1>

                    {/* Subtext */}
                    <p className="max-w-2xl px-2 mx-auto mb-8 text-xs font-medium leading-relaxed text-slate-300 sm:text-sm md:text-base md:mb-10 drop-shadow-md">
                        All the premium tools designed for ultimate creators in one dark workspace. Generate hooks, design engaging stories, and organize plans in clicks.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col items-center w-full gap-4 px-4 mb-6 sm:flex-row sm:w-auto sm:px-0">
                        <button
                            onClick={handleOpenChat}
                            className="group relative cursor-pointer flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-xl px-6 py-3.5 text-[14px] font-semibold text-white transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 bg-gradient-to-br from-[#5b5df0] via-[#7C7EFB] to-[#B846EB] shadow-[0_8px_28px_rgba(91,93,240,.35)] hover:shadow-[0_16px_45px_rgba(91,93,240,.55)]"
                        >
                            <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent opacity-70" />
                            <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10 group-hover:opacity-100" />
                            <div className="absolute -left-24 top-0 h-full w-10 rotate-[25deg] bg-white/40 blur-lg transition-all duration-700 group-hover:left-[140%]" />
                            <span className="relative z-10">Get Started Free</span>
                            <svg className="relative z-10 transition-all duration-500 group-hover:translate-x-1" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>

                        <button className="group relative w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-white/[0.05] px-6 py-3.5 text-[14px] font-semibold text-white backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-purple-400/40 hover:bg-white/[0.08]">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#7C7EFB]/0 via-[#A855F7]/10 to-[#38BDF8]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 24V4.5A2.5 2.5 0 0 1 6.5 2Z" />
                                </svg>
                                Documentation
                            </span>
                        </button>
                    </div>

                    {/* Small Note */}
                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                        No credit card required
                    </div>

                    {/* STATS BAR - ضبط التجاوبية والمسافات هنا */}
                    <div className="w-full max-w-6xl mx-auto mt-16 mb-12 bg-[#0a0a12]/80 backdrop-blur-xl border border-white/[0.04] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)] text-left">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">

                            {/* Stat 1: Active Creators */}
                            <div className="flex items-start gap-4 p-2 sm:p-0">
                                <div className="w-12 h-12 rounded-full shrink-0 bg-indigo-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <defs>
                                            <linearGradient id="gradient-creators" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#818cf8" />
                                                <stop offset="100%" stopColor="#c084fc" />
                                            </linearGradient>
                                        </defs>
                                        <path stroke="url(#gradient-creators)" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle stroke="url(#gradient-creators)" cx="9" cy="7" r="4"></circle>
                                        <path stroke="url(#gradient-creators)" d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path stroke="url(#gradient-creators)" d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="mb-2 text-2xl font-bold leading-none text-white">12.4K+</h3>
                                    <p className="text-[13px] font-semibold text-slate-200 mb-1.5">Active Creators</p>
                                    <p className="text-xs leading-relaxed text-slate-400/80">Growing community of content creators</p>
                                </div>
                            </div>

                            {/* Stat 2: Content Generated */}
                            <div className="flex items-start gap-4 p-2 sm:p-0">
                                <div className="w-12 h-12 rounded-full shrink-0 bg-pink-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <defs>
                                            <linearGradient id="gradient-content" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#f472b6" />
                                                <stop offset="100%" stopColor="#db2777" />
                                            </linearGradient>
                                        </defs>
                                        <path stroke="url(#gradient-content)" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline stroke="url(#gradient-content)" points="14 2 14 8 20 8"></polyline>
                                        <line stroke="url(#gradient-content)" x1="16" y1="13" x2="8" y2="13"></line>
                                        <line stroke="url(#gradient-content)" x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline stroke="url(#gradient-content)" points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="mb-2 text-2xl font-bold leading-none text-white">3.2M+</h3>
                                    <p className="text-[13px] font-semibold text-slate-200 mb-1.5">Content Generated</p>
                                    <p className="text-xs leading-relaxed text-slate-400/80">AI-powered content pieces created</p>
                                </div>
                            </div>

                            {/* Stat 3: Success Rate */}
                            <div className="flex items-start gap-4 p-2 sm:p-0">
                                <div className="w-12 h-12 rounded-full shrink-0 bg-purple-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                    <svg width="18" height="18" viewBox="0 0 24 24" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                                        <defs>
                                            <linearGradient id="gradient-success" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#c084fc" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient> 
                                        </defs>
                                        <polygon fill="url(#gradient-success)" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="mb-2 text-2xl font-bold leading-none text-white">98.7%</h3>
                                    <p className="text-[13px] font-semibold text-slate-200 mb-1.5">Success Rate</p>
                                    <p className="text-xs leading-relaxed text-slate-400/80">Creators achieve their content goals</p>
                                </div>
                            </div>

                            {/* Stat 4: AI Assistance */}
                            <div className="flex items-start gap-4 p-2 sm:p-0">
                                <div className="w-12 h-12 rounded-full shrink-0 bg-rose-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <defs>
                                            <linearGradient id="gradient-ai" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#fb7185" />
                                                <stop offset="100%" stopColor="#f43f5e" />
                                            </linearGradient>
                                        </defs>
                                        <circle stroke="url(#gradient-ai)" cx="12" cy="12" r="10"></circle>
                                        <polyline stroke="url(#gradient-ai)" points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="mb-2 text-2xl font-bold leading-none text-white">24/7</h3>
                                    <p className="text-[13px] font-semibold text-slate-200 mb-1.5">AI Assistance</p>
                                    <p className="text-xs leading-relaxed text-slate-400/80">Always-on AI support for your creativity</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer Trust Section */}
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[11px] sm:text-xs text-slate-400 font-medium bg-black/40 px-4 sm:px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-xl max-w-full">
                        <span className="flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            Trusted by creators worldwide
                        </span>
                        <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-slate-600" />
                        <span>SOC 2 Compliant</span>
                        <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-slate-600" />
                        <span>Enterprise Grade Security</span>
                    </div>
                </main>
            </div>

            {/* CHATBOT FULL SCREEN OVERLAY */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        variants={fullChatPanelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 w-full h-screen bg-[#030307] z-50 flex flex-col"
                    >
                        <div className="h-14 border-b border-white/[0.05] bg-[#05060f]/60 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shrink-0" />
                                <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-slate-400 uppercase truncate">Techook Studio Intelligence Workspace</span>
                            </div>

                            <button
                                onClick={handleCloseChat}
                                className="px-3 md:px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-white/5 shrink-0"
                            >
                                <span className="hidden sm:inline">Close Studio</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 w-full overflow-hidden">
                            <ContentCreatorBot onClose={handleCloseChat} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FLOATING CHAT BUTTON*/}
            <AnimatePresence>
                {!isChatOpen && (
                    <motion.button
                        onClick={handleOpenChat}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                        whileHover={{
                            scale: 1.08,
                            rotate: -3,
                            y: -4,
                        }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 320, damping: 18 }}
                        className="fixed z-40 overflow-visible rounded-full cursor-pointer group bottom-5 right-5 md:bottom-7 md:right-7 h-14 w-14 md:h-16 md:w-16"
                    >
                        {/* Outer Glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7c7efb]/40 via-[#b846eb]/40 to-cyan-400/40 blur-2xl opacity-70 group-hover:opacity-100 group-hover:scale-[1.35] transition-all duration-700" />

                        {/* Premium Border */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#A855F7] via-[#7C7EFB] to-[#22D3EE] p-[2px] shadow-[0_0_25px_rgba(124,126,251,.55)]">
                            {/* Glass */}
                            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#090914]/90 backdrop-blur-3xl">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" />
                                <div className="absolute top-0 w-6 h-full transition-all duration-700 opacity-0 -left-12 rotate-12 bg-white/30 blur-md group-hover:left-20 group-hover:opacity-100" />
                                <svg
                                    className="relative z-20 w-5 h-5 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 md:w-6 md:h-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="url(#chatGradient)"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <defs>
                                        <linearGradient id="chatGradient" x1="0" y1="0" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#C084FC" />
                                            <stop offset="45%" stopColor="#8B5CF6" />
                                            <stop offset="100%" stopColor="#38BDF8" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                                </svg>
                            </div>
                        </div>

                        {/* Online Indicator */}
                        <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 z-40 flex items-center justify-center">
                            <span className="absolute w-4 h-4 rounded-full md:h-5 md:w-5 bg-emerald-400/40 animate-ping" />
                            <span className="absolute h-3.5 w-3.5 md:h-4 md:w-4 rounded-full bg-emerald-400/30 blur-[5px]" />
                            <span className="relative h-3 w-3 md:h-3.5 md:w-3.5 rounded-full border-2 border-[#090914] bg-emerald-400 shadow-[0_0_15px_#4ade80]" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}