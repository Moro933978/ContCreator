import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    motion,
    AnimatePresence,
} from "framer-motion";

import {
    Sparkles,
    Loader2,
    Zap,
} from "lucide-react";

import BubbleNode from "./BubbleNode";

// ============================================================
// NOISE BACKGROUND
// ============================================================

const NoiseBackground = () => (
    <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] mix-blend-overlay"
        style={{
            backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
    />
);

// ============================================================
// PREMIUM STAR FIELD
// ============================================================

const StarField = () => {
    const stars = useMemo(
        () =>
            Array.from(
                { length: 52 },
                (_, index) => {
                    const isCyan =
                        Math.random() > 0.5;

                    const isLarge =
                        Math.random() > 0.82;

                    return {
                        id: index,
                        left:
                            Math.random() * 100,
                        top:
                            Math.random() * 100,
                        size: isLarge
                            ? Math.random() * 2.2 +
                              2
                            : Math.random() * 1.5 +
                              1,
                        opacity: isLarge
                            ? Math.random() * 0.25 +
                              0.65
                            : Math.random() * 0.25 +
                              0.5,
                        delay:
                            Math.random() * 4,
                        duration:
                            Math.random() * 2.5 +
                            2,
                        isCyan,
                        isLarge,
                    };
                }
            ),
        []
    );

    return (
        <div className="absolute inset-0 z-[1] pointer-events-none">
            {stars.map((star) => {
                const color = star.isCyan
                    ? "#67e8f9"
                    : "#b56cff";

                const glow = star.isCyan
                    ? "rgba(103,232,249,0.95)"
                    : "rgba(181,108,255,1)";

                return (
                    <motion.span
                        key={star.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            backgroundColor:
                                color,
                            boxShadow:
                                star.isLarge
                                    ? `0 0 8px ${glow}, 0 0 18px ${glow}, 0 0 30px ${glow}`
                                    : `0 0 5px ${glow}, 0 0 12px ${glow}`,
                        }}
                        initial={{
                            opacity:
                                star.opacity *
                                0.45,
                            scale: 0.8,
                        }}
                        animate={{
                            opacity: [
                                star.opacity *
                                    0.45,
                                star.opacity,
                                star.opacity *
                                    0.5,
                                star.opacity,
                            ],
                            scale: star.isLarge
                                ? [
                                      0.8,
                                      1.35,
                                      0.85,
                                      1,
                                  ]
                                : [
                                      0.8,
                                      1.15,
                                      0.85,
                                      1,
                                  ],
                        }}
                        transition={{
                            duration:
                                star.duration,
                            delay: star.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                );
            })}

            {/* Purple sparkle */}

            <motion.span
                className="absolute left-[14%] top-[19%] w-[5px] h-[5px] rounded-full bg-purple-200"
                style={{
                    boxShadow:
                        "0 0 10px rgba(233,213,255,1), 0 0 24px rgba(168,85,247,1), 0 0 38px rgba(168,85,247,0.65)",
                }}
                animate={{
                    opacity: [
                        0.35,
                        1,
                        0.35,
                    ],
                    scale: [
                        0.75,
                        1.5,
                        0.75,
                    ],
                }}
                transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Cyan sparkle */}

            <motion.span
                className="absolute right-[18%] top-[24%] w-[4px] h-[4px] rounded-full bg-cyan-200"
                style={{
                    boxShadow:
                        "0 0 9px rgba(165,243,252,1), 0 0 22px rgba(34,211,238,1), 0 0 34px rgba(34,211,238,0.7)",
                }}
                animate={{
                    opacity: [
                        0.3,
                        1,
                        0.3,
                    ],
                    scale: [
                        0.75,
                        1.55,
                        0.75,
                    ],
                }}
                transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Purple sparkle */}

            <motion.span
                className="absolute left-[78%] bottom-[21%] w-[4px] h-[4px] rounded-full bg-purple-200"
                style={{
                    boxShadow:
                        "0 0 9px rgba(233,213,255,1), 0 0 22px rgba(168,85,247,1), 0 0 34px rgba(168,85,247,0.7)",
                }}
                animate={{
                    opacity: [
                        0.25,
                        1,
                        0.25,
                    ],
                    scale: [
                        0.75,
                        1.45,
                        0.75,
                    ],
                }}
                transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function BubbleCanvas({
    selectedIdea,
    setSelectedIdea,
    selectedPlatform,
    ideas,
    setIdeas,
    summary,
    setSummary,
    onGenerate,
    onRegenerate,
    status,
    generationType,
    showGenerateFirst,
}) {
    const containerRef =
        useRef(null);

    const [
        dimensions,
        setDimensions,
    ] = useState({
        width: 0,
        height: 0,
    });

    // ========================================================
    // RESIZE
    // ========================================================

    useEffect(() => {
        if (!containerRef.current)
            return;

        const observer =
            new ResizeObserver(
                (entries) => {
                    const entry =
                        entries[0];

                    if (!entry)
                        return;

                    setDimensions({
                        width:
                            entry
                                .contentRect
                                .width,
                        height:
                            entry
                                .contentRect
                                .height,
                    });
                }
            );

        observer.observe(
            containerRef.current
        );

        return () =>
            observer.disconnect();
    }, []);

    // ========================================================
    // FILTER
    // ========================================================

    const filteredIdeas = useMemo(() => {
        if (
            !ideas ||
            ideas.length === 0
        ) {
            return [];
        }

        if (
            !selectedPlatform ||
            selectedPlatform === "All"
        ) {
            return ideas;
        }

        return ideas.filter(
            (idea) =>
                idea.platform
                    ?.toLowerCase() ===
                selectedPlatform.toLowerCase()
        );
    }, [
        ideas,
        selectedPlatform,
    ]);

    // ========================================================
    // SELECTED IDEA SAFETY
    // ========================================================

    useEffect(() => {
        if (!selectedIdea)
            return;

        const stillExists =
            filteredIdeas.some(
                (idea) =>
                    idea.id ===
                    selectedIdea.id
            );

        if (!stillExists) {
            setSelectedIdea(null);
        }
    }, [
        filteredIdeas,
        selectedIdea,
        setSelectedIdea,
    ]);

    // ========================================================
    // POSITIONS
    // ========================================================

    const {
        positions,
        center,
    } = useMemo(() => {
        const width =
            dimensions.width;

        const height =
            dimensions.height;

        if (
            width <= 0 ||
            height <= 0 ||
            filteredIdeas.length ===
                0
        ) {
            return {
                positions: [],
                center: {
                    x: width / 2,
                    y: height / 2,
                },
            };
        }

        const cx = width / 2;
        const cy = height / 2;

        const isMobile =
            width < 640;

        const isTablet =
            width >= 640 &&
            width < 1024;

        let rx;
        let ry;

        if (isMobile) {
            rx = Math.max(
                width * 0.34,
                125
            );

            ry = Math.max(
                height * 0.36,
                190
            );
        } else if (isTablet) {
            rx = Math.min(
                width * 0.39,
                355
            );

            ry = Math.min(
                height * 0.41,
                290
            );
        } else {
            rx = Math.min(
                width * 0.41,
                455
            );

            ry = Math.min(
                height * 0.43,
                335
            );
        }

        const total =
            filteredIdeas.length;

        const positions =
            filteredIdeas.map(
                (_, index) => {
                    const angle =
                        -Math.PI / 2 +
                        (index / total) *
                            Math.PI *
                            2;

                    return {
                        x:
                            cx +
                            rx *
                                Math.cos(
                                    angle
                                ),
                        y:
                            cy +
                            ry *
                                Math.sin(
                                    angle
                                ),
                    };
                }
            );

        return {
            positions,
            center: {
                x: cx,
                y: cy,
            },
        };
    }, [
        dimensions,
        filteredIdeas,
    ]);

    // ========================================================
    // BUTTON STATES
    // ========================================================

    const isGenerating =
        status === "loading" ||
        status === "generating";

    const isRegenerating =
        isGenerating &&
        generationType ===
            "regenerate";

    const isGeneratingNew =
        isGenerating &&
        generationType ===
            "generate";

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="flex w-full h-full flex-col items-center justify-center">
            <div
                ref={containerRef}
                className="relative w-full h-full overflow-hidden bg-[#02040b] border-0 outline-none ring-0"
                style={{
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                }}
            >
                {/* =====================================================
                    BACKGROUND
                ====================================================== */}

                <div className="absolute inset-0 bg-[#02040b]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(104,58,190,0.14)_0%,rgba(20,24,56,0.09)_24%,rgba(2,4,11,0.96)_74%)]" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(37,99,235,0.09),transparent_40%)]" />

                <NoiseBackground />

                <StarField />

                {/* =====================================================
                    ATMOSPHERE
                ====================================================== */}

                <motion.div
                    className="pointer-events-none absolute w-[460px] h-[460px] rounded-full blur-[110px] bg-purple-600/[0.04]"
                    style={{
                        left: "4%",
                        top: "5%",
                    }}
                    animate={{
                        x: [0, 28, 0],
                        y: [0, 18, 0],
                    }}
                    transition={{
                        duration: 16,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                <motion.div
                    className="pointer-events-none absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-cyan-500/[0.025]"
                    style={{
                        right: "3%",
                        bottom: "3%",
                    }}
                    animate={{
                        x: [0, -30, 0],
                        y: [0, -18, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* =====================================================
                    CONNECTION LINES
                ====================================================== */}

                {status === "success" &&
                    positions.length ===
                        filteredIdeas.length && (
                        <svg
                            className="absolute inset-0 z-10 pointer-events-none"
                            width={
                                dimensions.width
                            }
                            height={
                                dimensions.height
                            }
                            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <filter
                                    id="lineGlow"
                                    x="-100%"
                                    y="-100%"
                                    width="300%"
                                    height="300%"
                                >
                                    <feGaussianBlur
                                        stdDeviation="1.5"
                                        result="blur"
                                    />

                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {positions.map(
                                (
                                    pos,
                                    index
                                ) => {
                                    const idea =
                                        filteredIdeas[
                                            index
                                        ];

                                    const isSelected =
                                        selectedIdea?.id ===
                                        idea?.id;

                                    return (
                                        <motion.line
                                            key={
                                                idea?.id ||
                                                index
                                            }
                                            x1={
                                                center.x
                                            }
                                            y1={
                                                center.y
                                            }
                                            x2={
                                                pos.x
                                            }
                                            y2={
                                                pos.y
                                            }
                                            stroke={
                                                isSelected
                                                    ? "#d8b4fe"
                                                    : "#8b5cf6"
                                            }
                                            strokeWidth={
                                                isSelected
                                                    ? 1.2
                                                    : 0.5
                                            }
                                            strokeDasharray={
                                                isSelected
                                                    ? "none"
                                                    : "2 7"
                                            }
                                            filter={
                                                isSelected
                                                    ? "url(#lineGlow)"
                                                    : undefined
                                            }
                                            initial={{
                                                pathLength: 0,
                                                opacity: 0,
                                            }}
                                            animate={{
                                                pathLength: 1,
                                                opacity:
                                                    isSelected
                                                        ? 0.7
                                                        : 0.11,
                                            }}
                                            transition={{
                                                duration: 1.1,
                                                delay:
                                                    0.15 +
                                                    index *
                                                        0.04,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    );
                                }
                            )}
                        </svg>
                    )}

                {/* =====================================================
                    BUBBLES
                ====================================================== */}

                <AnimatePresence>
                    {filteredIdeas.length >
                        0 &&
                        positions.length ===
                            filteredIdeas.length &&
                        filteredIdeas.map(
                            (
                                idea,
                                index
                            ) => (
                                <BubbleNode
                                    key={
                                        idea.id ||
                                        `idea-${index}`
                                    }
                                    idea={idea}
                                    index={index}
                                    position={
                                        positions[
                                            index
                                        ]
                                    }
                                    center={
                                        center
                                    }
                                    selectedIdea={
                                        selectedIdea
                                    }
                                    setSelectedIdea={
                                        setSelectedIdea
                                    }
                                />
                            )
                        )}
                </AnimatePresence>

                {/* =====================================================
                    PREMIUM CENTER AI CORE
                ====================================================== */}

                <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
                    animate={{
                        scale:
                            isGenerating
                                ? [
                                      1,
                                      1.025,
                                      1,
                                  ]
                                : 1,
                    }}
                    transition={{
                        duration: 1.5,
                        repeat:
                            isGenerating
                                ? Infinity
                                : 0,
                        ease: "easeInOut",
                    }}
                >
                    {/* Ambient glow */}

                    <motion.div
                        className="absolute w-[215px] h-[215px] sm:w-[230px] sm:h-[230px] lg:w-[245px] lg:h-[245px] rounded-full blur-[42px]"
                        style={{
                            background:
                                "radial-gradient(circle,rgba(139,92,246,0.34),rgba(76,29,149,0.16) 42%,rgba(59,130,246,0.07) 55%,transparent 74%)",
                        }}
                        animate={{
                            scale: [
                                0.93,
                                1.06,
                                0.93,
                            ],
                            opacity: [
                                0.52,
                                0.86,
                                0.52,
                            ],
                        }}
                        transition={{
                            duration: 3.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* Soft glass aura */}

                    <div
                        className="absolute w-[182px] h-[182px] sm:w-[196px] sm:h-[196px] lg:w-[210px] lg:h-[210px] rounded-full"
                        style={{
                            background:
                                "radial-gradient(circle,rgba(168,85,247,0.09),rgba(59,130,246,0.025) 52%,transparent 72%)",
                            boxShadow:
                                "0 0 50px rgba(139,92,246,0.16)",
                        }}
                    />

                    {/* Main core */}

                    <div
                        className="relative flex flex-col items-center justify-center w-[140px] h-[140px] sm:w-[152px] sm:h-[152px] lg:w-[164px] lg:h-[164px] rounded-full bg-[#080a14]/96 backdrop-blur-2xl overflow-hidden border border-white/[0.11]"
                        style={{
                            boxShadow:
                                "0 0 55px rgba(124,58,237,0.22), 0 0 100px rgba(124,58,237,0.08), inset 0 0 35px rgba(168,85,247,0.075)",
                            border: "1px solid rgba(255,255,255,0.10)",
                        }}
                    >
                        {/* Inner radial light */}

                        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_22%,rgba(168,85,247,0.18),transparent_52%)]" />

                        {/* Animated light sweep */}

                        <motion.div
                            className="pointer-events-none absolute inset-[-30%] rounded-full"
                            style={{
                                background:
                                    "conic-gradient(from 0deg,transparent 0deg,transparent 235deg,rgba(255,255,255,0.02) 258deg,rgba(255,255,255,0.38) 286deg,rgba(168,85,247,0.5) 312deg,transparent 346deg,transparent 360deg)",
                            }}
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                duration: 7,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />

                        {/* Dark inner face */}

                        <div className="absolute inset-[1px] rounded-full bg-[#080a14]" />

                        {/* Tiny center highlight */}

                        <div className="pointer-events-none absolute top-[16%] left-[28%] w-[44%] h-[20%] rounded-full bg-white/[0.035] blur-md" />

                        {/* =================================================
                            CORE CONTENT
                        ================================================== */}

                        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">

                            {/* =================================================
                                IDLE
                            ================================================== */}

                            {status ===
                                "idle" && (
                                <>
                                    <div
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/[0.10] border border-purple-300/[0.14] mb-2.5"
                                        style={{
                                            boxShadow:
                                                "0 0 18px rgba(168,85,247,0.18)",
                                        }}
                                    >
                                        <Zap className="w-5 h-5 text-purple-300" />
                                    </div>

                                    <span className="text-[9px] uppercase tracking-[0.27em] font-medium text-white/50">
                                        AI Engine
                                    </span>

                                    <span className="text-[8px] text-white/30 mt-1 mb-3">
                                        Ready to create
                                    </span>

                                    <button
                                        type="button"
                                        onClick={
                                            onGenerate
                                        }
                                        disabled={
                                            isGenerating
                                        }
                                        className="group relative flex items-center justify-center h-7.5 px-4 rounded-full bg-white/[0.045] border border-white/[0.11] text-[8px] font-medium text-white/90 transition-all duration-300 hover:bg-white/[0.08] hover:border-purple-400/[0.35] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle,rgba(168,85,247,0.24),transparent_70%)]" />

                                        <span className="relative flex items-center gap-1.5">
                                            <Sparkles className="w-2.5 h-2.5 text-purple-300" />

                                            Generate
                                        </span>
                                    </button>
                                </>
                            )}

                            {/* =================================================
                                LOADING / GENERATING
                            ================================================== */}

                            {isGenerating && (
                                <>
                                    <Loader2 className="w-7 h-7 text-cyan-300 animate-spin mb-2" />

                                    <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
                                        {isRegenerating
                                            ? "Regenerating..."
                                            : "Generating..."}
                                    </span>

                                    <span className="text-[8px] text-white/30 mt-1">
                                        {isRegenerating
                                            ? "Refreshing ideas"
                                            : "Creating ideas"}
                                    </span>
                                </>
                            )}

                            {/* =================================================
                                SUCCESS
                            ================================================== */}

                            {status ===
                                "success" && (
                                <>
                                    <Sparkles className="w-6 h-6 text-purple-300 mb-1.5 drop-shadow-[0_0_14px_rgba(168,85,247,0.9)]" />

                                    <span className="text-[8px] uppercase tracking-[0.25em] text-white/35">
                                        AI Ideas
                                    </span>

                                    <div className="text-[32px] leading-none font-bold text-white mt-0.5">
                                        {
                                            filteredIdeas.length
                                        }
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            onRegenerate
                                        }
                                        disabled={
                                            isGenerating
                                        }
                                        className="mt-2 flex items-center gap-1 text-[8px] text-white/35 hover:text-white/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Zap className="w-2.5 h-2.5" />

                                        Regenerate
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* =====================================================
                    PREMIUM REGENERATE MESSAGE
                ====================================================== */}

                <AnimatePresence>
                    {showGenerateFirst && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 14,
                                scale: 0.94,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: 8,
                                scale: 0.97,
                            }}
                            transition={{
                                duration: 0.28,
                                ease: [
                                    0.22,
                                    1,
                                    0.36,
                                    1,
                                ],
                            }}
                            className="absolute z-[100] bottom-20 left-1/2 -translate-x-1/2"
                        >
                            <div className="relative">
                                {/* Glow */}

                                <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-2xl" />

                                {/* Card */}

                                <div className="relative flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0b0815]/92 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_30px_rgba(139,92,246,0.12)]">

                                    {/* Icon */}

                                    <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20">
                                        <Sparkles className="relative z-10 w-4 h-4 text-purple-300" />

                                        <div className="absolute inset-0 rounded-xl bg-purple-400/10 blur-md" />
                                    </div>

                                    {/* Text */}

                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white whitespace-nowrap">
                                            Please Generate First
                                        </span>

                                        <span className="text-[11px] text-slate-400 whitespace-nowrap mt-0.5">
                                            Generate ideas before using Regenerate.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* =====================================================
                    VIGNETTE
                ====================================================== */}

                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#02040b] to-transparent opacity-70 z-40" />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#02040b] to-transparent opacity-90 z-40" />
            </div>
        </div>
    );
}