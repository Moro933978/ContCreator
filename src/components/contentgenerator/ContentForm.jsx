import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion"; import {
    ChevronDown,
    Zap,
    Lightbulb,
    Check,
    Loader2
} from 'lucide-react';

const tones = ['Friendly', 'Professional', 'Casual', 'Urgent', 'Informative'];

const styles = [
    { icon: '😀', label: 'Friendly' },
    { icon: '💼', label: 'Professional' },
    { icon: '🚀', label: 'Motivational' },
    { icon: '📖', label: 'Storytelling' },
    { icon: '🔥', label: 'Viral_Hook' }
];

// --- PLATFORMS WITH INLINE SVG ICONS ---
const platforms = [
    {
        id: 'Instagram',
        label: 'Instagram',
        icon: (
            <svg className="w-5 h-5 text-pink-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
        )
    },

    {
        id: 'TikTok', label: 'TikTok',
        icon: (
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.45 4.41-3.5 5.45-2.12 1.08-4.8 1.02-6.79-.19-1.87-1.15-3.08-3.23-2.98-5.46.08-2.22 1.44-4.32 3.42-5.36 1.15-.6 2.47-.85 3.76-.79V14.6c-.6-.05-1.22.04-1.78.3-.92.42-1.6 1.34-1.63 2.36-.04 1.06.63 2.11 1.6 2.51.98.4 2.15.22 2.96-.45.69-.58 1.09-1.45 1.09-2.37V.02h-1.21z" />
            </svg>
        )
    },
    {
        id: 'WhatsApp', label: 'WhatsApp',
        icon: (
            <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.904 0C5.337 0 .003 5.332.003 11.895c0 2.1.55 4.148 1.597 5.952L.003 24l6.309-1.654a11.884 11.884 0 0 0 5.592 1.396h.004c6.566 0 11.9-5.332 11.9-11.896 0-3.181-1.24-6.173-3.489-8.423A11.87 11.87 0 0 0 11.904 0zm0 19.742h-.003a9.897 9.897 0 0 1-5.044-1.378l-.361-.214-3.746.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.215c0-5.462 4.446-9.904 9.91-9.904 2.646 0 5.135 1.03 7.004 2.9 1.868 1.87 2.898 4.36 2.898 7.005 0 5.46-4.445 9.902-9.905 9.902zm5.437-7.424c-.298-.149-1.762-.87-2.036-.97-.274-.099-.474-.149-.673.15-.199.298-.769.97-.942 1.17-.174.198-.348.223-.646.074-.298-.149-1.258-.464-2.396-1.482-.885-.792-1.482-1.77-1.656-2.069-.174-.299-.019-.461.13-.61.134-.134.298-.348.447-.522.15-.174.199-.298.298-.497.099-.198.05-.373-.025-.522-.075-.149-.673-1.62-.922-2.217-.242-.58-.487-.502-.673-.51-.174-.008-.373-.01-.572-.01-.199 0-.523.075-.797.373-.274.298-1.045 1.02-1.045 2.487 0 1.467 1.07 2.885 1.219 3.084.15.198 2.097 3.2 5.08 4.488.71.307 1.265.49 1.696.627.712.227 1.36.195 1.871.118.572-.086 1.762-.72 2.01-1.417.249-.696.249-1.293.174-1.417-.074-.124-.274-.198-.572-.347z" />
            </svg>
        )
    },
    {
        id: 'LinkedIn',
        label: 'LinkedIn',
        icon: (
            <svg className="w-5 h-5 text-blue-500 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.73a1.48 1.48 0 1 0 0 2.96 1.48 1.48 0 0 0 0-2.96z" />
            </svg>
        )
    },
    {
        id: 'YouTube',
        label: 'YouTube',
        icon: (
            <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        )
    },
];

const lengths = ['Short', 'Medium', 'Long'];
const ContentForm = ({
    ideas = [],
    loading = false,
    onGenerate,
    currentPlatform,
    currentStyle,
    setCurrentPlatform,
    setCurrentStyle,
    userProfile = {}
}) => {


    // --- STATES ---
    const [targetAudience, setTargetAudience] = useState(userProfile?.targetAudience || "");
    const [tone, setTone] = useState("Friendly");
    const [isToneOpen, setIsToneOpen] = useState(false);

    const [ideaTab, setIdeaTab] = useState("generator");
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [isIdeaDropdownOpen, setIsIdeaDropdownOpen] = useState(false);
    const [customIdea, setCustomIdea] = useState("");

    const [platform, setPlatform] = useState("Instagram");
    const [contentStyle, setContentStyle] = useState("Friendly");

    const handlePlatformChange = (newPlatform) => {
        setPlatform(newPlatform);
        setCurrentPlatform(newPlatform);
    };

    const handleStyleChange = (newStyle) => {
        setContentStyle(newStyle);
        setCurrentStyle(newStyle);
    };

    const [contentLength, setContentLength] = useState('Medium');
    const [isLengthOpen, setIsLengthOpen] = useState(false);

    const [validationError, setValidationError] = useState(null);

    const [options, setOptions] = useState({
        hook: true,
        cta: true,
        emojis: true,
        hashtags: true
    });

    // Restore form state
    useEffect(() => {
        const saved = localStorage.getItem("contentFormState");
        if (!saved) return;

        const data = JSON.parse(saved);

        setTargetAudience(data.targetAudience ?? "");
        setTone(data.tone ?? "Friendly");
        setIdeaTab(data.ideaTab ?? "generator");
        setSelectedIdea(data.selectedIdea ?? null);
        setCustomIdea(data.customIdea ?? "");
        setContentStyle(data.contentStyle ?? "Friendly");
        setPlatform(data.platform ?? "Instagram");
        setContentLength(data.contentLength ?? "Medium");
        setOptions(
            data.options ?? {
                hook: true,
                cta: true,
                emojis: true,
                hashtags: true,
            }
        );

        setCurrentPlatform?.(data.platform ?? "Instagram");
        setCurrentStyle?.(data.contentStyle ?? "Friendly");

    }, []);

    // Save form state
    useEffect(() => {
        localStorage.setItem(
            "contentFormState",
            JSON.stringify({
                targetAudience,
                tone,
                ideaTab,
                selectedIdea,
                customIdea,
                contentStyle,
                platform,
                contentLength,
                options,
            })
        );
    }, [
        targetAudience,
        tone,
        ideaTab,
        selectedIdea,
        customIdea,
        contentStyle,
        platform,
        contentLength,
        options,
    ]);

    // Update targetAudience state when userProfile prop changes
    useEffect(() => {
        if (userProfile?.targetAudience) {
            setTargetAudience(userProfile.targetAudience);
        }
    }, [userProfile?.targetAudience]);

    // Auto-select first idea when loaded
    useEffect(() => {
        if (ideas?.length > 0 && !selectedIdea) {
            setSelectedIdea(ideas[0]);
        }
    }, [ideas, selectedIdea]);

    const toggleOption = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // --- GENERATE CONTENT HANDLER ---
    const handleGenerateContent = () => {
        if (loading) return;
        setValidationError(null);

        // Validation Check
        if (ideaTab === 'generator' && !selectedIdea) {
            setValidationError("Please choose an idea from the list.");
            return;
        }

        if (ideaTab === 'custom' && !customIdea.trim()) {
            setValidationError("Please enter your custom idea.");
            return;
        }

        // Prepare Payload
        const payload = {
            targetAudience: targetAudience || userProfile?.targetAudience || "General Audience",
            tone,
            idea: ideaTab === 'generator' ? selectedIdea.title : customIdea,
            contentStyle,
            platform,
            contentLength,
            options
        };

        if (onGenerate) {
            onGenerate(payload);
        }
    };

    return (
        <div className="relative bg-[#0D0816]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl flex flex-col h-full overflow-hidden">

            {/* Background Glow Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] bg-purple-600/40 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-green-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

            <div className="space-y-8 relative z-10 flex-1 flex flex-col">

                {/* Validation Error Alert */}
                {validationError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
                        {validationError}
                    </div>
                )}

                {/* Section 1: Your Information */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-xs font-bold flex items-center justify-center text-white">1</span>
                        <h2 className="text-sm font-semibold text-gray-200">
                            Your Information
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Target Audience Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-400 ml-1">
                                Target Audience
                            </label>

                            {/* Same Glass Container as Dropdown */}
                            <div className="relative flex items-center rounded-[11px] bg-[#130E20]/90 backdrop-blur-2xl border border-white/10 h-12 overflow-hidden focus-within:border-white/20 transition-colors">

                                {/* Reflection */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                                <input
                                    type="text"
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="Enter target audience..."
                                    className="relative z-10 w-full h-full bg-transparent px-4 text-sm font-medium text-white placeholder-gray-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Tone Dropdown */}
                        <div className="flex flex-col gap-2 relative">
                            <label className="text-xs font-medium text-gray-400 ml-1">
                                Tone
                            </label>

                            <motion.button
                                whileHover={{ scale: 1.01, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setIsToneOpen(!isToneOpen)}
                                className="group relative overflow-hidden rounded-xl cursor-pointer"
                            >
                                {/* Glass */}
                                <div className="relative flex items-center justify-between rounded-[11px] bg-[#130E20]/90 backdrop-blur-2xl border border-white/10 px-4 h-12 transition-colors hover:border-white/20">

                                    {/* Reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[11px]" />

                                    <span className="relative z-10 text-sm font-medium text-white">
                                        {tone}
                                    </span>

                                    <motion.div
                                        animate={{ rotate: isToneOpen ? 180 : 0 }}
                                        transition={{ duration: .25 }}
                                        className="relative z-10"
                                    >
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </motion.div>
                                </div>
                            </motion.button>

                            <AnimatePresence>
                                {isToneOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: .98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: .98 }}
                                        transition={{ duration: .2 }}
                                        className="absolute top-full left-0 right-0 mt-2 z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#130E20]/95 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,.45)]"
                                    >
                                        {tones.map((t) => (
                                            <motion.button
                                                key={t}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: .98 }}
                                                onClick={() => {
                                                    setTone(t);
                                                    setIsToneOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-300 cursor-pointer
            ${tone === t
                                                        ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white"
                                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                                    }`}
                                            >
                                                <span>{t}</span>

                                                {tone === t && (
                                                    <Check className="w-4 h-4 text-cyan-300" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>

                {/* Section 2: Your Idea */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-xs font-bold flex items-center justify-center text-white">2</span>
                        <h2 className="text-sm font-semibold text-gray-200">Your Idea</h2>
                    </div>

                    {/* 1) Animated Segmented Control */}
                    <div className="relative mb-5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl">
                        <motion.div
                            layoutId="ideaTabIndicator"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            className={`absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-violet-600/90 to-blue-600/90 shadow-[0_0_25px_rgba(139,92,246,.35)]
            ${ideaTab === "generator"
                                    ? "left-1 right-1/2 mr-1"
                                    : "left-1/2 ml-1 right-1"
                                }`}
                        />

                        <div className="relative grid grid-cols-2 gap-3 p-1">
                            {/* Idea Generator Button */}

                            <motion.button
                                whileHover={{ scale: 1.01, y: -1 }}
                                whileTap={{ scale: 0.99 }}
                                type="button"
                                onClick={() => setIdeaTab("generator")}
                                className={`relative w-full h-11 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 px-4 transition-all duration-300 cursor-pointer overflow-hidden hover:`}
                            >
                                <span className="relative z-10">💡 Idea Generator</span>

                                {ideaTab === "generator" && (
                                    <div className="absolute bottom-0 w-8 h-[3px] rounded-t-full bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                )}
                            </motion.button>

                            {/* Custom Idea Button */}
                            <motion.button
                                whileHover={{ scale: 1.01, y: -1 }}
                                whileTap={{ scale: 0.99 }}
                                type="button"
                                onClick={() => setIdeaTab("custom")}
                                className={`relative w-full h-11 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 px-4 transition-all duration-300 cursor-pointer overflow-hidden `}
                            >
                                <span className="relative z-10">✍️ Custom Idea</span>

                                {/* الخط المضيء بالأسفل */}
                                {ideaTab === "custom" && (
                                    <div className="absolute bottom-0 w-8 h-[3px] rounded-t-full bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                )}
                            </motion.button>
                        </div>
                    </div>

                    {/* 2) AnimatePresence with Fade + Scale Transitions */}
                    <AnimatePresence mode="wait">
                        {ideaTab === 'generator' ? (
                            <motion.div
                                key="generator"
                                initial={{ opacity: 0, y: 12, scale: .98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: .98 }}
                                transition={{ duration: .3 }}
                                className="relative"
                            >
                                <div className="relative w-full">
                                    {/* 3) Premium Dropdown Button (Matched Style) */}
                                    <motion.button
                                        whileHover={{ scale: 1.01, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => setIsIdeaDropdownOpen(!isIdeaDropdownOpen)}
                                        className="group relative w-full overflow-hidden rounded-xl cursor-pointer"
                                    >
                                        {/* Glass */}
                                        <div className="relative flex items-center justify-between rounded-[11px] bg-[#130E20]/90 backdrop-blur-2xl border border-white/10 px-4 h-12 transition-colors hover:border-white/20">

                                            {/* Reflection */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[11px]" />

                                            <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-white overflow-hidden">
                                                <Lightbulb className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                <span className="truncate">
                                                    {selectedIdea ? selectedIdea.title : "Select an idea..."}
                                                </span>
                                            </div>

                                            <motion.div
                                                animate={{ rotate: isIdeaDropdownOpen ? 180 : 0 }}
                                                transition={{ duration: .25 }}
                                                className="relative z-10 flex-shrink-0 ml-2"
                                            >
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </motion.div>
                                        </div>
                                    </motion.button>

                                    {/* 4) Premium Animated Dropdown Menu (Matched Style) */}
                                    <AnimatePresence>
                                        {isIdeaDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: .98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: .98 }}
                                                transition={{ duration: .2 }}
                                                className="absolute top-full left-0 right-0 mt-2 z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#130E20]/95 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,.45)]"
                                            >
                                                {ideas.map((idea, index) => {
                                                    const isSelected = selectedIdea?.title === idea.title; // التحقق من العنصر النشط

                                                    return (
                                                        <motion.button
                                                            key={idea.id || index}
                                                            whileHover={{ x: 4 }}
                                                            whileTap={{ scale: .98 }}
                                                            onClick={() => {
                                                                setSelectedIdea(idea);
                                                                setIsIdeaDropdownOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-300 cursor-pointer
                            ${isSelected
                                                                    ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white"
                                                                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <Lightbulb className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isSelected ? "text-cyan-300" : "text-purple-400"}`} />
                                                                <span className="truncate">{idea.title}</span>
                                                            </div>

                                                            {/* علامة الصح تظهر بس لو العنصر ده هو اللي متحدد */}
                                                            {isSelected && (
                                                                <Check className="w-4 h-4 flex-shrink-0 text-cyan-300 ml-2" />
                                                            )}
                                                        </motion.button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="custom"
                                initial={{ opacity: 0, y: 12, scale: .98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: .98 }}
                                transition={{ duration: .3 }}
                            >
                                {/* 6) Premium Glass Textarea */}
                                <textarea
                                    value={customIdea}
                                    onChange={(e) => setCustomIdea(e.target.value)}
                                    className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-5 text-sm text-white placeholder:text-gray-500 resize-none outline-none transition-all duration-300 focus:border-violet-500/60 focus:shadow-[0_0_35px_rgba(139,92,246,.18)]"
                                    placeholder="Type your content idea here..."
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Section 3: Content Style */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-xs font-bold flex items-center justify-center text-white">3</span>
                        <h2 className="text-sm font-semibold text-gray-200">Content Style</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {styles.map((style) => (
                            <button
                                key={style.label}
                                type="button"
                                onClick={() => handleStyleChange(style.label)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${contentStyle === style.label
                                    ? "bg-[#1E1433] border border-purple-500/50 text-white"
                                    : "bg-[#150F21]/80 backdrop-blur-sm border border-white/5 text-gray-400 hover:border-white/10 hover:text-gray-200"
                                    }`}
                            >
                                <span>{style.icon}</span>
                                {style.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 4: Platform */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-xs font-bold flex items-center justify-center text-white">4</span>
                        <h2 className="text-sm font-semibold text-gray-200">Platform</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {platforms.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handlePlatformChange(p.id)} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${platform === p.id
                                    ? 'bg-[#1E1433] border-purple-500/50 text-white'
                                    : 'bg-[#150F21]/80 backdrop-blur-sm border-white/5 hover:border-white/10 text-gray-400'
                                    }`}
                            >
                                <div className="mb-2">{p.icon}</div>
                                <span className={`text-[11px] font-medium ${platform === p.id ? 'text-white' : 'text-gray-400'}`}>
                                    {p.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 5: Advanced Options */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-xs font-bold flex items-center justify-center text-white">5</span>
                        <h2 className="text-sm font-semibold text-gray-200">Advanced Options</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        {/* Content Length Dropdown */}
                        <div className="w-full sm:w-48 flex flex-col gap-2 relative">
                            <label className="text-xs font-medium text-gray-400 ml-1">
                                Content Length
                            </label>

                            <motion.button
                                whileHover={{ scale: 1.01, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setIsLengthOpen(!isLengthOpen)}
                                className="group relative w-full overflow-hidden rounded-xl cursor-pointer"
                            >
                                {/* Glass */}
                                <div className="relative flex items-center justify-between rounded-[11px] bg-[#130E20]/90 backdrop-blur-2xl border border-white/10 px-4 h-12 transition-colors hover:border-white/20">

                                    {/* Reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[11px]" />

                                    <span className="relative z-10 text-sm font-medium text-white">
                                        {contentLength}
                                    </span>

                                    <motion.div
                                        animate={{ rotate: isLengthOpen ? 180 : 0 }}
                                        transition={{ duration: .25 }}
                                        className="relative z-10 flex-shrink-0 ml-2"
                                    >
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </motion.div>
                                </div>
                            </motion.button>

                            <AnimatePresence>
                                {isLengthOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: .98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: .98 }}
                                        transition={{ duration: .2 }}
                                        className="absolute top-full left-0 right-0 mt-2 z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#130E20]/95 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,.45)]"
                                    >
                                        {lengths.map((len) => (
                                            <motion.button
                                                key={len}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: .98 }}
                                                onClick={() => {
                                                    setContentLength(len);
                                                    setIsLengthOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-300 cursor-pointer
                        ${contentLength === len
                                                        ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white"
                                                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                                                    }`}
                                            >
                                                <span>{len}</span>

                                                {/* Active Checkmark */}
                                                {contentLength === len && (
                                                    <Check className="w-4 h-4 text-cyan-300 flex-shrink-0 ml-2" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Checkboxes Options */}
                        <div className="flex-1 flex flex-col gap-2 w-full">
                            <label className="text-xs text-gray-400 font-medium">Include</label>
                            <div className="flex flex-wrap gap-4 h-[42px] items-center">
                                {Object.entries(options).map(([key, value]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${value ? 'bg-purple-600 border-purple-500' : 'bg-transparent border-white/20 group-hover:border-purple-500/50'
                                            }`}>
                                            {value && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <span className="text-sm text-gray-300 capitalize group-hover:text-white transition-colors">{key}</span>
                                        <input type="checkbox" className="hidden" checked={value} onChange={() => toggleOption(key)} />
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Generate Button */}
                <div className="mt-auto pt-6 border-t border-white/10 relative z-10 w-full">
                    <motion.button
                        whileHover={!loading ? { scale: 1.015, y: -1 } : {}}
                        whileTap={!loading ? { scale: 0.985 } : {}}
                        onClick={handleGenerateContent}
                        disabled={loading}
                        type="button"
                        className={`group relative w-full h-14 overflow-hidden rounded-xl ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                            }`}
                    >
                        {/* Premium Glow */}
                        <div className="absolute -inset-2 rounded-[18px] bg-gradient-to-r from-violet-500/35 via-fuchsia-500/25 to-cyan-400/35 blur-2xl opacity-70 group-hover:opacity-100 transition-all duration-500" />

                        {/* Main Glass */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7C3AED]/90 via-[#8B5CF6]/85 to-[#2563EB]/90 backdrop-blur-3xl shadow-[0_15px_45px_rgba(124,58,237,.45),0_0_30px_rgba(59,130,246,.18)]" />

                        {/* Soft Highlight */}
                        <div className="absolute inset-[1px] rounded-[11px] bg-gradient-to-b from-white/18 via-white/6 to-transparent" />

                        {/* Premium Reflection */}
                        <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.22),transparent_28%),radial-gradient(circle_at_85%_75%,rgba(103,232,249,.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,.18),transparent_30%)]" />

                        {/* Top Shine */}
                        <div className="absolute top-[2px] left-[12%] w-[76%] h-[28%] rounded-full bg-white/20 blur-lg" />

                        {/* Animated Shine */}
                        {!loading && (
                            <div className="absolute inset-0 overflow-hidden rounded-xl">
                                <div className="absolute -left-24 top-0 h-full w-20 rotate-[18deg] bg-white/30 blur-lg group-hover:left-[130%] transition-all duration-1000" />
                            </div>
                        )}

                        {/* Content */}
                        <span className="relative z-20 flex h-full items-center justify-center gap-2 text-sm font-semibold tracking-wide text-white">
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Generate Content</span>

                                    <Zap className="w-5 h-5 fill-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                                </>
                            )}
                        </span>
                    </motion.button>
                </div>

            </div>
        </div>
    );
};

export default ContentForm;