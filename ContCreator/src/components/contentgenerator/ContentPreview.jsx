import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    RefreshCcw,
    Rocket,
    PenTool,
    Target,
    Hash,
    Copy,
    Check,
    Bookmark,
    Calendar
} from 'lucide-react';

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const targetValue = Math.min(100, Math.max(0, Number(value) || 0));
        const duration = 1000;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setDisplayValue(Math.floor(easeOutQuart * targetValue));

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setDisplayValue(targetValue);
            }
        };

        requestAnimationFrame(step);
    }, [value]);

    return <span>{displayValue}</span>;
};

const styleIcons = {
    Friendly: "😀",
    Professional: "💼",
    Motivational: "🚀",
    Storytelling: "📖",
    Viral_Hook: "🔥",
};

const GeneratedContent = ({
    selectedPlatform,
    styles,
    selectedStyle,
    options,
    onRegenerate,
    onCopyAll,
    onCopyPost,
    onSchedule,
    generatedContent,
    onSaveIdea
}) => {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [copiedTag, setCopiedTag] = useState(null);
    const [copiedType, setCopiedType] = useState(null);
    const [saved, setSaved] = useState(false);

    const handleRegenerate = async () => {
        if (isRegenerating) return;
        setIsRegenerating(true);
        try {
            if (onRegenerate) {
                await onRegenerate({ hook: true, cta: true, hashtags: true });
            }
        } catch (error) {
            console.error('Regeneration failed:', error);
        } finally {
            setIsRegenerating(false);
        }
    };


    const platformIcons = {
        Instagram: "📸",
        Facebook: "📘",
        TikTok: "🎵",
        LinkedIn: "💼",
        Twitter: "🐦",
        YouTube: "▶️",
    };

    const rawViralScore = generatedContent?.viralScore;
    const viralScore = !generatedContent || rawViralScore === undefined || rawViralScore === null
        ? 0
        : Math.max(0, Math.min(100, Number(rawViralScore) || 0));

    const circumference = 2 * Math.PI * 17;
    const strokeOffset = circumference * (1 - viralScore / 100);

    const scoreColor =
        viralScore >= 80
            ? "#22c55e"
            : viralScore >= 60
                ? "#facc15"
                : viralScore >= 40
                    ? "#fb923c"
                    : "#ef4444";

    const ctaText = generatedContent?.callToAction || generatedContent?.cta;

    const handleCopyHashtag = async (tag, e) => {
        e?.stopPropagation();
        if (!tag) return;
        const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
        try {
            await navigator.clipboard.writeText(normalizedTag);
            setCopiedTag(tag);
            setTimeout(() => setCopiedTag(null), 2000);
        } catch (err) {
            console.error('Failed to copy hashtag:', err);
        }
    };

    const handleCopyEntirePost = async () => {
        const parts = [];
        if (generatedContent?.hook) parts.push(generatedContent.hook);
        if (generatedContent?.post) parts.push(generatedContent.post);
        if (ctaText) parts.push(ctaText);

        if (generatedContent?.hashtags) {
            if (Array.isArray(generatedContent.hashtags)) {
                const formatted = generatedContent.hashtags
                    .filter(Boolean)
                    .map(t => (t.startsWith('#') ? t : `#${t}`))
                    .join(' ');
                if (formatted) parts.push(formatted);
            } else if (typeof generatedContent.hashtags === 'string') {
                parts.push(generatedContent.hashtags);
            }
        }

        const fullText = parts.join('\n\n');
        try {
            await navigator.clipboard.writeText(fullText);
            setCopiedType('all');
            setTimeout(() => setCopiedType(null), 2000);
        } catch (err) {
            console.error('Failed to copy entire post:', err);
        }

        if (onCopyAll) onCopyAll(fullText);
    };

    const handleCopyPostBody = async () => {
        const postText = generatedContent?.post || '';
        try {
            await navigator.clipboard.writeText(postText);
            setCopiedType('post');
            setTimeout(() => setCopiedType(null), 2000);
        } catch (err) {
            console.error('Failed to copy post:', err);
        }

        if (onCopyPost) onCopyPost(postText);
    };

    const parsedHashtags = Array.isArray(generatedContent?.hashtags)
        ? generatedContent.hashtags
        : typeof generatedContent?.hashtags === 'string'
            ? generatedContent.hashtags.split(/\s+/).filter(Boolean)
            : [];

    console.log("Platform:", selectedPlatform);
    console.log("Style:", selectedStyle);

    return (
        <div className="relative bg-[#0D0816]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Inner Blobs for Right Card */}
            <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-purple-500/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Header & Meta */}
                <div className="flex items-start justify-between mb-6 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-3 text-white">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Generated Content
                        </h2>

                        <div className="flex flex-col gap-2 text-sm text-gray-300">

                            {/* Platform */}
                            <div className="flex items-center gap-2">
                                <span className="text-base">
                                    {platformIcons[selectedPlatform]}
                                </span>

                                <span className="text-gray-400">
                                    Platform:
                                </span>

                                <span className="font-medium text-white">
                                    {selectedPlatform}
                                </span>
                            </div>

                            {/* Style */}
                            <div className="flex items-center gap-2">
                                <span className="text-base">
                                    {styleIcons[selectedStyle]}
                                </span>

                                <span className="text-gray-400">
                                    Style:
                                </span>

                                <span className="font-medium text-white">
                                    {selectedStyle}
                                </span>
                            </div>

                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        {/* Premium Regenerate Button */}
                        <motion.button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            whileHover={{
                                scale: 1.03,
                                y: -1,
                                boxShadow: "0 10px 35px rgba(124,58,237,.35)",
                            }}
                            whileTap={{
                                scale: 0.97,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 18,
                            }}
                            className={`relative overflow-hidden
        w-[128px] h-[42px]
        rounded-xl
        cursor-pointer
        ${isRegenerating ? "opacity-80" : ""}
    `}
                        >
                            {/* Background */}
                            <div
                                className="absolute inset-0 rounded-xl
        bg-gradient-to-r
        from-[#b13cff]
        via-[#7c5cff]
        to-[#4f8cff]"
                            />

                            {/* Glass Layer */}
                            <div
                                className="absolute inset-[2px]
        rounded-[10px]
        bg-gradient-to-b
        from-white/12
        to-black/10
        backdrop-blur-xl"
                            />

                            {/* Shine */}
                            <motion.div
                                initial={{ x: -120 }}
                                whileHover={{
                                    x: 170,
                                    transition: {
                                        duration: 0.7,
                                        ease: "easeInOut",
                                    },
                                }}
                                className="absolute top-0 h-full w-8
        rotate-[20deg]
        bg-white/25 blur-md"
                            />

                            {/* Content */}
                            <span className="relative z-10 flex items-center justify-center gap-2 text-white font-semibold text-sm">
                                <motion.div
                                    animate={{
                                        rotate: isRegenerating ? 360 : 0,
                                    }}
                                    transition={
                                        isRegenerating
                                            ? {
                                                repeat: Infinity,
                                                duration: 1,
                                                ease: "linear",
                                            }
                                            : {}
                                    }
                                >
                                    <RefreshCcw className="w-3.5 h-3.5" />
                                </motion.div>

                                {isRegenerating ? "Generating" : "Regenerate"}
                            </span>
                        </motion.button>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                                    Viral Score
                                </span>

                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
                                    whileHover={{ scale: 1.08 }}
                                    className="relative w-14 h-14 flex items-center justify-center cursor-pointer"
                                >
                                    {/* Glow */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.18, 1],
                                            opacity: [0.35, 0.6, 0.35]
                                        }}
                                        transition={{ duration: 2.5, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full blur-xl pointer-events-none"
                                        style={{ background: scoreColor }}
                                    />

                                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 44 44">
                                        <circle
                                            cx="22"
                                            cy="22"
                                            r="17"
                                            stroke="#21192f"
                                            strokeWidth="3"
                                            fill="none"
                                        />
                                        <motion.circle
                                            cx="22"
                                            cy="22"
                                            r="17"
                                            fill="none"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            stroke={scoreColor}
                                            strokeDasharray={circumference}
                                            initial={{ strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset: strokeOffset }}
                                            transition={{ duration: 1.3, ease: "easeOut" }}
                                        />
                                    </svg>

                                    <motion.div
                                        key={viralScore}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="relative z-10 flex flex-col items-center"
                                    >
                                        <span className="text-sm font-extrabold" style={{ color: scoreColor }}>
                                            <AnimatedNumber value={viralScore} />
                                        </span>
                                        <span className="text-[8px] text-gray-400 -mt-1">%</span>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generated Content Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {!generatedContent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center justify-center h-full min-h-[220px] bg-[#150F21]/40 border border-white/5 backdrop-blur-md rounded-2xl p-8 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="relative flex items-center justify-center w-16 h-16"
                            >

                                {/* Outer Glow */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.25, 1],
                                        opacity: [0.15, 0.45, 0.15],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute w-16 h-16 rounded-full blur-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400"
                                />

                                {/* Ring 1 */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 3,
                                        ease: "linear",
                                    }}
                                    className="absolute w-14 h-14 rounded-full border border-purple-400/40 border-t-purple-300 border-r-cyan-300"
                                />

                                {/* Ring 2 */}
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "linear",
                                    }}
                                    className="absolute w-10 h-10 rounded-full border border-cyan-400/30 border-b-cyan-300 border-l-purple-400"
                                />

                                {/* Ring 3 */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.2,
                                        ease: "linear",
                                    }}
                                    className="absolute w-6 h-6 rounded-full border border-fuchsia-400/30 border-t-white"
                                />

                                {/* Glass Core */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.15, 1],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.2,
                                    }}
                                    className="relative w-3 h-3 rounded-full bg-white/90 backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,.8)]"
                                />

                            </motion.div>
                            <p className="text-gray-400 text-sm font-medium">
                                Generate content to preview it here.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="space-y-3"
                        >

                            {/* Hook Card */}
                            {(options?.hook ?? true) && generatedContent?.hook && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.35 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-[#150F21]/80 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-colors cursor-pointer"
                                >
                                    <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                                        <Rocket className="w-4 h-4 text-purple-400" /> Hook
                                    </h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {generatedContent.hook}
                                    </p>
                                </motion.div>
                            )}



                            {/* Generated Post Card */}
                            {generatedContent?.post && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.35, delay: 0.05 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-[#150F21]/80 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-colors cursor-pointer"
                                >
                                    <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                                        <PenTool className="w-4 h-4 text-purple-400" /> Generated Post
                                    </h3>
                                    <div className="text-gray-300 text-sm leading-relaxed space-y-2 whitespace-pre-wrap">
                                        {generatedContent.post}
                                    </div>
                                </motion.div>
                            )}

                            {/* CTA Card */}
                            {(options?.cta ?? true) && ctaText && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.35, delay: 0.1 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-[#150F21]/80 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-colors cursor-pointer"
                                >
                                    <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-red-400" /> Call To Action
                                    </h3>
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {ctaText}
                                    </p>
                                </motion.div>
                            )}

                            {/* Hashtags Card */}
                            {(options?.hashtags ?? true) && generatedContent?.hashtags && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.35, delay: 0.15 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-[#150F21]/80 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-colors cursor-pointer"
                                >
                                    <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-blue-400" /> Hashtags
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {parsedHashtags.length > 0 ? (
                                            parsedHashtags.map((tag, idx) => {
                                                const tagLabel = tag.startsWith('#') ? tag : `#${tag}`;
                                                const isCopied = copiedTag === tag;
                                                return (
                                                    <motion.div
                                                        key={`${tag}-${idx}`}
                                                        whileHover={{ scale: 1.05, translateY: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => handleCopyHashtag(tag, e)}
                                                        className="flex flex-col items-center justify-center bg-[#1D162D]/60 border border-white/5 hover:border-purple-500/30 rounded-lg p-2 transition-all cursor-pointer group min-w-[90px] max-w-[130px]"
                                                    >
                                                        <span className="text-[10px] text-gray-300 mb-1.5 truncate w-full text-center px-1 font-medium">
                                                            {tagLabel}
                                                        </span>
                                                        {isCopied ? (
                                                            <span className="text-[9px] text-green-400 font-semibold flex items-center gap-0.5">
                                                                <Check className="w-2.5 h-2.5" /> Copied
                                                            </span>
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors" />
                                                        )}
                                                    </motion.div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-gray-300 text-sm">
                                                {String(generatedContent.hashtags)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-yellow-500/80 flex items-center gap-1.5">
                                        ✨ Click on any hashtag to explore related videos
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap gap-3 mt-auto pt-6 ">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyEntirePost}
                        className="group relative flex-1 min-w-[140px] overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-3 flex flex-col items-center justify-center cursor-pointer shadow-lg transition-all hover:shadow-purple-500/30"
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                        <div className="relative z-10 flex items-center gap-1.5 font-bold text-[12px] text-white">
                            {copiedType === 'all' ? (
                                <>
                                    <Check className="w-4 h-4 text-green-300 transition-transform duration-300 group-hover:rotate-12" />
                                    <span>Copied Entire Post!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                                    <span>Copy Entire Post</span>
                                </>
                            )}
                        </div>

                        <span className="relative z-10 text-[10px] text-white/70 mt-0.5">
                            Copy post + hashtags
                        </span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyPostBody}
                        className="group relative flex-1 min-w-[100px] overflow-hidden rounded-xl border border-white/10 bg-[#150F21]/60 backdrop-blur-sm p-3 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-all duration-300"
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                        {copiedType === 'post' ? (
                            <>
                                <Check className="relative z-10 w-3.5 h-3.5 text-green-400 transition-transform duration-300 group-hover:rotate-12" />
                                <span className="relative z-10">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="relative z-10 w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12" />
                                <span className="relative z-10">Copy Post</span>
                            </>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSaveIdea}
                        className={`
                                group relative flex-1 min-w-[100px] overflow-hidden
                                flex items-center justify-center gap-1.5
                                rounded-xl border p-3
                                transition-all duration-300 cursor-pointer
                             ${saved
                                ? "border-yellow-400/40 bg-gradient-to-r from-yellow-500/15 via-amber-400/10 to-yellow-500/15 shadow-[0_0_18px_rgba(250,204,21,0.18)]"
                                : "border-white/10 bg-[#150F21]/60 backdrop-blur-sm hover:border-purple-500/40 hover:bg-white/10 hover:shadow-[0_0_18px_rgba(139,92,246,0.18)]"
                            }
                        `}
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                        <Bookmark
                            className={`relative z-10 w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12 ${saved
                                ? "fill-yellow-300 text-yellow-300"
                                : "text-gray-300 group-hover:text-white"
                                }`}
                        />

                        <span
                            className={`relative z-10 text-xs font-medium transition-colors ${saved ? "text-yellow-200" : "text-gray-300 group-hover:text-white"
                                }`}
                        >
                            {saved ? "Saved" : "Save Idea"}
                        </span>
                    </motion.button>

                </div>
            </div>
        </div>
    );
};

export default GeneratedContent;