import React, {
    useState,
    useEffect,
    useMemo,
    useCallback
} from "react";

import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    animate
} from "framer-motion";

import {
    BookmarkIcon,
    XIcon,
    LightningBoltIcon,
    CalendarIcon,
    ArrowUpIcon
} from "@heroicons/react/outline";

// ============================================================
// CONTENT PLANNER STORAGE
// ============================================================

const CONTENT_PLANNER_IDEAS_KEY =
    "techook-content-planner-ideas-v1";

const CONTENT_PLANNER_EVENT =
    "content-planner-ideas-changed";

// ============================================================
// PLATFORM ICONS
// ============================================================

const YouTubeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-pink-500">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-500">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const GlobeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-purple-400">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);

const PLATFORM_ICONS = {
    youtube: YouTubeIcon,
    instagram: InstagramIcon,
    ig: InstagramIcon,
    facebook: FacebookIcon,
    fb: FacebookIcon,
    tiktok: TikTokIcon,
    linkedin: LinkedInIcon,
    whatsapp: WhatsAppIcon,
    default: GlobeIcon
};

// ============================================================
// STEP ICONS
// ============================================================

const PlayOutlineIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
);

const ListOutlineIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12m-12 5.25h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const ChatOutlineIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6.8 3.1 2.2 4.1l-.8 2.5 2.8-.9c1.1.4 2.3.6 3.6.6 4.9 0 8.9-3.4 8.9-7.6S14.9 3.8 10 3.8 1.1 7.2 1.1 11.4c0 .5.1.9.2 1.36z" />
    </svg>
);

const ChartOutlineIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-.75A1.125 1.125 0 013 19.875v-6.75zm6.75 0c0-.621.504-1.125 1.125-1.125h.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-.75a1.125 1.125 0 01-1.125-1.125v-6.75zM17.625 9c0-.621.504-1.125 1.125-1.125h.75c.621 0 1.125.504 1.125 1.125v10.875c0 .621-.504 1.125-1.125 1.125h-.75c-.621 0-1.125-.504-1.125-1.125V9z" />
    </svg>
);

const stepIcons = [
    PlayOutlineIcon,
    ListOutlineIcon,
    ChatOutlineIcon,
    ChartOutlineIcon
];

const premiumEase = [
    0.22,
    1,
    0.36,
    1
];

// ============================================================
// ANIMATED NUMBER
// ============================================================

const AnimatedNumber = ({
    value
}) => {
    const count = useMotionValue(0);

    const rounded = useTransform(
        count,
        Math.round
    );

    useEffect(() => {
        const controls = animate(
            count,
            Number(value) || 0,
            {
                duration: 1.5,
                ease: premiumEase
            }
        );

        return controls.stop;
    }, [
        value,
        count
    ]);

    return (
        <motion.span>
            {rounded}
        </motion.span>
    );
};

// ============================================================
// SPARKLE SPINNER
// ============================================================

function SparkleSpinner() {
    return (
        <span className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <span className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]" />
        </span>
    );
}

// ============================================================
// SELECTED IDEA PANEL
// ============================================================

const SelectedIdeaPanel = React.memo(({
    selectedIdea,
    ideas = [],
    summary = {},
    onGenerate,
    status,
    onClose
}) => {
    const [
        activeTab,
        setActiveTab
    ] = useState(
        "Execution Guide"
    );

    const [
        isSaved,
        setIsSaved
    ] = useState(false);

    const [
        isAddedToPlanner,
        setIsAddedToPlanner
    ] = useState(false);

    const [
        isAddingToPlanner,
        setIsAddingToPlanner
    ] = useState(false);

    const [
        showAddedFeedback,
        setShowAddedFeedback
    ] = useState(false);

    const isVisible =
        !!selectedIdea;

    // ========================================================
    // RESET TAB
    // ========================================================

    useEffect(() => {
        if (selectedIdea) {
            setActiveTab(
                "Execution Guide"
            );
        }
    }, [
        selectedIdea?.id
    ]);

    // ========================================================
    // SAVED STATE
    // ========================================================

    useEffect(() => {
        if (!selectedIdea?.id) {
            setIsSaved(false);
            return;
        }

        let savedIdeas = [];

        try {
            const parsed =
                JSON.parse(
                    localStorage.getItem(
                        "savedIdeas"
                    )
                );

            savedIdeas =
                Array.isArray(parsed)
                    ? parsed
                    : [];
        } catch {
            savedIdeas = [];
        }

        setIsSaved(
            savedIdeas.some(
                (idea) =>
                    idea.id ===
                    selectedIdea.id
            )
        );
    }, [
        selectedIdea
    ]);

    // ========================================================
    // CONTENT PLANNER STATE
    // ========================================================

    useEffect(() => {
        if (!selectedIdea?.id) {
            setIsAddedToPlanner(false);
            setShowAddedFeedback(false);
            return;
        }

        const checkPlannerState =
            () => {
                try {
                    const parsed =
                        JSON.parse(
                            localStorage.getItem(
                                CONTENT_PLANNER_IDEAS_KEY
                            )
                        );

                    const importedIdeas =
                        Array.isArray(
                            parsed
                        )
                            ? parsed
                            : [];

                    setIsAddedToPlanner(
                        importedIdeas.some(
                            (idea) =>
                                idea.id ===
                                selectedIdea.id
                        )
                    );
                } catch {
                    setIsAddedToPlanner(
                        false
                    );
                }
            };

        checkPlannerState();

        const handlePlannerChange =
            () =>
                checkPlannerState();

        window.addEventListener(
            CONTENT_PLANNER_EVENT,
            handlePlannerChange
        );

        window.addEventListener(
            "storage",
            handlePlannerChange
        );

        return () => {
            window.removeEventListener(
                CONTENT_PLANNER_EVENT,
                handlePlannerChange
            );

            window.removeEventListener(
                "storage",
                handlePlannerChange
            );
        };
    }, [
        selectedIdea?.id
    ]);

    // ========================================================
    // SAVE
    // ========================================================

    const handleToggleSave =
        useCallback(() => {
            if (!selectedIdea) {
                return;
            }

            let session = null;

            try {
                session =
                    JSON.parse(
                        localStorage.getItem(
                            "generatorSession"
                        )
                    );
            } catch {
                session = null;
            }

            if (session?.saved) {
                localStorage.removeItem(
                    "generatorSession"
                );

                setIsSaved(false);
            } else {
                localStorage.setItem(
                    "generatorSession",
                    JSON.stringify({
                        saved: true,
                        ideas,
                        summary,
                        selectedIdea
                    })
                );

                setIsSaved(true);
            }
        }, [
            selectedIdea,
            ideas,
            summary
        ]);

    // ========================================================
    // ADD TO PLANNER
    // ========================================================

    const handleAddToPlanner =
        useCallback(
            async () => {
                if (
                    !selectedIdea ||
                    isAddingToPlanner
                ) {
                    return;
                }

                setIsAddingToPlanner(
                    true
                );

                try {
                    let importedIdeas =
                        [];

                    try {
                        const parsed =
                            JSON.parse(
                                localStorage.getItem(
                                    CONTENT_PLANNER_IDEAS_KEY
                                )
                            );

                        importedIdeas =
                            Array.isArray(
                                parsed
                            )
                                ? parsed
                                : [];
                    } catch {
                        importedIdeas =
                            [];
                    }

                    const alreadyExists =
                        importedIdeas.some(
                            (idea) =>
                                idea.id ===
                                selectedIdea.id
                        );

                    if (
                        !alreadyExists
                    ) {
                        const plannerIdea =
                            {
                                ...selectedIdea,
                                source:
                                    "idea-generator",
                                importedAt:
                                    new Date().toISOString(),
                                plannerStatus:
                                    "Draft"
                            };

                        importedIdeas =
                            [
                                ...importedIdeas,
                                plannerIdea
                            ];

                        localStorage.setItem(
                            CONTENT_PLANNER_IDEAS_KEY,
                            JSON.stringify(
                                importedIdeas
                            )
                        );

                        window.dispatchEvent(
                            new Event(
                                CONTENT_PLANNER_EVENT
                            )
                        );
                    }

                    await new Promise(
                        (resolve) =>
                            setTimeout(
                                resolve,
                                500
                            )
                    );

                    setIsAddedToPlanner(
                        true
                    );

                    setShowAddedFeedback(
                        true
                    );

                    setTimeout(
                        () => {
                            setShowAddedFeedback(
                                false
                            );

                            setIsAddedToPlanner(
                                false
                            );
                        },
                        2000
                    );
                } catch (
                    error
                ) {
                    console.error(
                        "Failed to add idea to Content Planner:",
                        error
                    );
                } finally {
                    setIsAddingToPlanner(
                        false
                    );
                }
            },
            [
                selectedIdea,
                isAddingToPlanner
            ]
        );

    // ========================================================
    // PLATFORM ICON
    // ========================================================

    const PlatformIcon =
        useMemo(() => {
            if (
                !ideas ||
                ideas.length === 0
            ) {
                return PLATFORM_ICONS.default;
            }

            const counts =
                ideas.reduce(
                    (
                        acc,
                        idea
                    ) => {
                        if (
                            !idea?.platform
                        ) {
                            return acc;
                        }

                        const plat =
                            idea.platform.toLowerCase();

                        acc[plat] =
                            (acc[
                                plat
                            ] || 0) + 1;

                        return acc;
                    },
                    {}
                );

            if (
                Object.keys(
                    counts
                ).length ===
                0
            ) {
                return PLATFORM_ICONS.default;
            }

            const topPlatform =
                Object.keys(
                    counts
                ).reduce(
                    (
                        a,
                        b
                    ) =>
                        counts[a] >
                        counts[b]
                            ? a
                            : b
                );

            return (
                PLATFORM_ICONS[
                    topPlatform
                ] ||
                PLATFORM_ICONS.default
            );
        }, [
            ideas
        ]);

    // ========================================================
    // ANALYTICS
    // ========================================================

    const analytics =
        useMemo(() => ({
            viral:
                selectedIdea
                    ?.analytics
                    ?.viral || 0,

            ease:
                selectedIdea
                    ?.analytics
                    ?.ease || 0,

            interest:
                selectedIdea
                    ?.analytics
                    ?.interest || 0,

            competition:
                selectedIdea
                    ?.analytics
                    ?.competition ||
                0,

            score:
                selectedIdea
                    ?.analytics
                    ?.score || 0,

            betterThan:
                selectedIdea
                    ?.analytics
                    ?.betterThan ||
                0
        }), [
            selectedIdea?.analytics
        ]);

    // ========================================================
    // COMPETITION
    // ========================================================

    const competitionLevelUI =
        useMemo(() => {
            const comp =
                analytics.competition;

            if (comp <= 35) {
                return {
                    label: "Low",
                    color:
                        "text-emerald-400"
                };
            }

            if (comp <= 70) {
                return {
                    label: "Medium",
                    color:
                        "text-yellow-400"
                };
            }

            return {
                label: "High",
                color:
                    "text-red-400"
            };
        }, [
            analytics.competition
        ]);

    const executionSteps =
        selectedIdea?.guide ||
        [];

    const strengths =
        selectedIdea?.strengths ||
        [];

    const weaknesses =
        selectedIdea?.weaknesses ||
        [];

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="w-full max-w-[420px] mx-auto flex flex-col gap-4 font-sans selection:bg-purple-500/30">

            {/* =================================================
                PREMIUM GENERATE BUTTON
            ================================================= */}

            <motion.button
                type="button"
                disabled={
                    status ===
                    "loading" ||
                    status ===
                    "generating"
                }
                onClick={() => {
                    if (
                        status ===
                            "loading" ||
                        status ===
                            "generating"
                    ) {
                        return;
                    }

                    onGenerate?.();
                }}
                whileHover={
                    status ===
                        "loading" ||
                    status ===
                        "generating"
                        ? {}
                        : {
                              y: -2,
                              scale: 1.012
                          }
                }
                whileTap={
                    status ===
                        "loading" ||
                    status ===
                        "generating"
                        ? {}
                        : {
                              scale: 0.985
                          }
                }
                className="group relative w-full rounded-[24px] p-[1px] overflow-hidden shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
            >
                {/* Moving border */}

                <motion.div
                    className="absolute inset-[-80%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(168,85,247,0.1)_80deg,rgba(168,85,247,0.9)_140deg,rgba(56,189,248,0.85)_195deg,transparent_260deg,transparent_360deg)]"
                    animate={{
                        rotate: 360
                    }}
                    transition={{
                        duration: 4.5,
                        repeat:
                            Infinity,
                        ease: "linear"
                    }}
                />

                {/* Outer glow */}

                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-purple-600/60 via-fuchsia-500/50 to-cyan-500/50 blur-[14px] opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Button body */}

                <div className="relative rounded-[23px] bg-[#090a15]/95 backdrop-blur-2xl px-5 py-4 overflow-hidden">
                    {/* Top glass highlight */}

                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    {/* Hover glow */}

                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.18),transparent_60%)]" />

                    {/* Moving shine */}

                    <span className="pointer-events-none absolute inset-y-0 w-24 -translate-x-32 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[430px] transition-transform duration-[1100ms] ease-out" />

                    <span className="relative z-10 flex flex-col items-center justify-center">
                        <span className="flex items-center gap-2 text-white font-bold text-base sm:text-lg tracking-wide">
                            {status ===
                                "loading" ||
                            status ===
                                "generating" ? (
                                <>
                                    <SparkleSpinner />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/15 border border-purple-400/20 shadow-[0_0_18px_rgba(168,85,247,0.22)]">
                                        <LightningBoltIcon className="w-4 h-4 text-purple-300" />
                                    </span>

                                    Generate Masterpiece
                                </>
                            )}
                        </span>

                        <span className="text-white/40 text-[10px] sm:text-xs mt-1.5">
                            Get 10 AI-powered ideas in seconds
                        </span>
                    </span>
                </div>
            </motion.button>

            {/* =================================================
                MAIN CARD
            ================================================= */}

            <motion.div
                className={`relative bg-[#080a13]/94 backdrop-blur-2xl border border-white/[0.07] rounded-[32px] p-5 flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] h-[840px] overflow-hidden ${
                    !isVisible
                        ? "pointer-events-none"
                        : "pointer-events-auto"
                }`}
                initial={{
                    opacity: 0,
                    y: 20
                }}
                animate={{
                    opacity:
                        isVisible
                            ? 1
                            : 0,
                    y:
                        isVisible
                            ? 0
                            : 20
                }}
                transition={{
                    duration: 0.5,
                    ease: premiumEase
                }}
            >
                {/* Premium Background */}

                <div className="pointer-events-none absolute -top-24 left-1/4 w-3/4 h-40 bg-purple-700/10 blur-[70px] rounded-full" />

                <div className="pointer-events-none absolute -bottom-28 right-[-10%] w-2/3 h-44 bg-cyan-500/[0.035] blur-[80px] rounded-full" />

                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.055),transparent_38%)]" />

                {/* Header */}

                <div className="relative z-10 flex items-center justify-between mb-5 shrink-0">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.22em] text-purple-300/55">
                            Insight
                        </span>

                        <div className="text-sm font-semibold text-white/70 mt-0.5">
                            Selected Idea
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="group flex items-center justify-center w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/35 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40"
                    >
                        <XIcon className="w-4.5 h-4.5 transition-transform duration-300 group-hover:rotate-90" />
                    </button>
                </div>

                {/* Title */}

                <div className="relative z-10 flex flex-col gap-4 mb-5 shrink-0">
                    <div className="flex items-start gap-3">
                        <div className="relative flex items-center justify-center gap-2 bg-purple-500/[0.09] px-2.5 py-1.5 rounded-xl border border-purple-400/[0.16] shrink-0 mt-1 shadow-[0_0_20px_rgba(168,85,247,0.10)]">
                            <div className="absolute inset-0 rounded-xl bg-purple-500/10 blur-md" />

                            <span className="relative">
                                <PlatformIcon />
                            </span>

                            <span className="relative font-bold text-sm text-purple-200">
                                {selectedIdea?.index ||
                                    "01"}
                            </span>
                        </div>

                        <h2 className="text-xl font-bold text-white leading-snug tracking-tight">
                            {selectedIdea?.title ||
                                "—"}
                        </h2>
                    </div>

                    <div className="flex items-center justify-between shrink-0">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-medium px-3 py-1.5 rounded-full border bg-white/[0.035] border-white/[0.07] text-white/65 flex items-center gap-1.5">
                                <PlatformIcon />
                                {selectedIdea?.contentStyle ||
                                    "Content"}
                            </span>
                        </div>

                        <motion.button
                            type="button"
                            onClick={
                                handleToggleSave
                            }
                            whileTap={{
                                scale: 0.82
                            }}
                            whileHover={{
                                y: -1
                            }}
                            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300 ${
                                isSaved
                                    ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/15"
                            }`}
                        >
                            <BookmarkIcon
                                className={`w-5 h-5 transition-all duration-300 ${
                                    isSaved
                                        ? "text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                                        : "text-white/40"
                                }`}
                            />
                        </motion.button>
                    </div>
                </div>

                {/* Analytics */}

                <div className="relative z-10 bg-[#0d0f19]/90 rounded-[22px] p-4 border border-white/[0.055] mb-5 relative shrink-0 overflow-hidden">
                    <div className="pointer-events-none absolute top-0 left-1/3 w-1/2 h-24 bg-purple-600/[0.045] blur-3xl rounded-full" />

                    <div className="relative z-10 flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-white/90">
                            Idea Analytics
                        </span>

                        <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                            Score
                        </span>
                    </div>

                    <div className="relative z-10 flex gap-4 items-center">
                        <div className="grid grid-cols-4 gap-2 flex-grow">
                            {[
                                {
                                    label: "Viral\nPotential",
                                    value:
                                        analytics.viral
                                },
                                {
                                    label: "Ease of\nCreation",
                                    value:
                                        analytics.ease
                                },
                                {
                                    label: "Audience\nInterest",
                                    value:
                                        analytics.interest
                                },
                                {
                                    label: "Competition\nLevel",
                                    value:
                                        analytics.competition,
                                    level:
                                        competitionLevelUI.label,
                                    color:
                                        competitionLevelUI.color
                                }
                            ].map(
                                (
                                    stat,
                                    idx
                                ) => (
                                    <motion.div
                                        key={
                                            idx
                                        }
                                        className="flex flex-col items-center text-center"
                                        initial={{
                                            opacity: 0,
                                            y: 10
                                        }}
                                        animate={{
                                            opacity:
                                                isVisible
                                                    ? 1
                                                    : 0,
                                            y:
                                                isVisible
                                                    ? 0
                                                    : 10
                                        }}
                                        transition={{
                                            duration:
                                                0.4,
                                            delay:
                                                isVisible
                                                    ? idx *
                                                      0.1
                                                    : 0,
                                            ease: premiumEase
                                        }}
                                    >
                                        <span className="text-[9px] text-white/40 leading-tight mb-2 whitespace-pre-line h-6">
                                            {
                                                stat.label
                                            }
                                        </span>

                                        <div className="flex items-center gap-0.5">
                                            <span className="text-base font-bold text-emerald-400">
                                                <AnimatedNumber
                                                    value={
                                                        stat.value
                                                    }
                                                />
                                            </span>

                                            {!stat.level && (
                                                <ArrowUpIcon className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                                            )}
                                        </div>

                                        {stat.level && (
                                            <span className={`text-[9px] font-medium mt-0.5 ${stat.color}`}>
                                                {
                                                    stat.level
                                                }
                                            </span>
                                        )}
                                    </motion.div>
                                )
                            )}
                        </div>

                        {/* Score */}

                        <div className="relative w-[74px] h-[74px] shrink-0 rounded-full flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-md" />

                            <svg
                                className="absolute inset-0 w-full h-full rotate-[-90deg]"
                                viewBox="0 0 100 100"
                            >
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="rgba(16,185,129,0.10)"
                                    strokeWidth="8"
                                    fill="none"
                                />

                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="#10B981"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    initial={{
                                        pathLength: 0
                                    }}
                                    animate={{
                                        pathLength:
                                            analytics.score /
                                            100
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        ease: premiumEase
                                    }}
                                />
                            </svg>

                            <div className="relative flex flex-col items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    <AnimatedNumber
                                        value={
                                            analytics.score
                                        }
                                    />
                                </span>

                                <span className="text-[8px] text-white/30 -mt-0.5">
                                    /100
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Better than */}

                    <div className="relative z-10 mt-5">
                        <span className="text-[10px] text-white/45 mb-2 block">
                            Better than{" "}
                            <strong className="text-white/80">
                                {
                                    analytics.betterThan
                                }
                                %
                            </strong>{" "}
                            of other ideas
                        </span>

                        <div className="relative w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-emerald-400 rounded-full"
                                initial={{
                                    width: "0%"
                                }}
                                animate={{
                                    width: `${analytics.betterThan}%`
                                }}
                                transition={{
                                    duration: 1.5,
                                    ease: premiumEase
                                }}
                                key={`progress-${selectedIdea?.id || "empty"}`}
                            />

                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                initial={{
                                    left: "0%"
                                }}
                                animate={{
                                    left: `calc(${analytics.betterThan}% - 4px)`
                                }}
                                transition={{
                                    duration: 1.5,
                                    ease: premiumEase
                                }}
                                key={`dot-${selectedIdea?.id || "empty"}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}

                <div className="relative z-10 flex border-b border-white/[0.07] mb-4 shrink-0">
                    {[
                        "Execution Guide",
                        "Strengths",
                        "Weaknesses"
                    ].map(
                        (tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() =>
                                    setActiveTab(
                                        tab
                                    )
                                }
                                className={`relative flex-1 pb-3 text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
                                    activeTab ===
                                    tab
                                        ? "text-purple-300"
                                        : "text-white/35 hover:text-white/65"
                                }`}
                            >
                                {tab}

                                {activeTab ===
                                    tab && (
                                    <motion.div
                                        className="absolute left-0 bottom-[-1px] w-full h-[2px] rounded-full bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                                        layoutId="activeTab"
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                    />
                                )}
                            </button>
                        )
                    )}
                </div>

                {/* Scrollable content */}

                <div className="relative z-10 flex-grow overflow-y-auto no-scrollbar min-h-0">
                    <AnimatePresence
                        mode="wait"
                    >
                        <motion.div
                            key={
                                activeTab
                            }
                            initial={{
                                opacity: 0,
                                x: -10
                            }}
                            animate={{
                                opacity: 1,
                                x: 0
                            }}
                            exit={{
                                opacity: 0,
                                x: 10
                            }}
                            transition={{
                                duration: 0.25,
                                ease: "easeOut"
                            }}
                        >
                            {activeTab ===
                                "Execution Guide" && (
                                <div className="flex flex-col relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-[1px] before:bg-white/[0.08] gap-5 pb-4">
                                    {executionSteps.map(
                                        (
                                            step,
                                            index
                                        ) => {
                                            const StepIcon =
                                                stepIcons[
                                                    index %
                                                        stepIcons.length
                                                ];

                                            return (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="flex gap-4 items-start relative z-10"
                                                >
                                                    <div className="w-7 h-7 rounded-full border border-purple-500/35 bg-[#120b20] flex items-center justify-center shrink-0 text-xs font-bold text-purple-300 mt-0.5 shadow-[0_0_14px_rgba(168,85,247,0.10)]">
                                                        {step.num ||
                                                            index +
                                                                1}
                                                    </div>

                                                    <div className="flex-grow pr-8">
                                                        <h4 className="text-sm font-semibold text-white/90 mb-1">
                                                            {
                                                                step.title
                                                            }
                                                        </h4>

                                                        <p className="text-[13px] text-white/45 leading-relaxed">
                                                            {
                                                                step.desc
                                                            }
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="w-8 h-8 rounded-lg bg-white/[0.025] hover:bg-white/[0.07] border border-white/[0.06] hover:border-purple-400/20 flex items-center justify-center shrink-0 text-white/35 hover:text-white transition-all absolute right-0 top-1"
                                                    >
                                                        <StepIcon />
                                                    </button>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}

                            {activeTab ===
                                "Strengths" && (
                                <ul className="space-y-3 pb-4">
                                    {strengths.map(
                                        (
                                            str,
                                            idx
                                        ) => (
                                            <li
                                                key={
                                                    idx
                                                }
                                                className="flex items-center gap-3 text-sm text-white/70 bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.05] p-3 rounded-xl transition-colors"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />

                                                {
                                                    str
                                                }
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}

                            {activeTab ===
                                "Weaknesses" && (
                                <ul className="space-y-3 pb-4">
                                    {weaknesses.map(
                                        (
                                            weak,
                                            idx
                                        ) => (
                                            <li
                                                key={
                                                    idx
                                                }
                                                className="flex items-center gap-3 text-sm text-white/70 bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.05] p-3 rounded-xl transition-colors"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />

                                                {
                                                    weak
                                                }
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom buttons */}

                <div className="relative z-10 flex gap-3 mt-auto pt-4 border-t border-white/[0.06] shrink-0">
                    <div className="flex flex-grow items-center gap-2">
                        <motion.button
                            type="button"
                            onClick={
                                handleAddToPlanner
                            }
                            disabled={
                                !selectedIdea ||
                                isAddingToPlanner
                            }
                            whileHover={
                                !isAddingToPlanner
                                    ? {
                                          y: -1,
                                          scale: 1.01
                                      }
                                    : {}
                            }
                            whileTap={
                                !isAddingToPlanner
                                    ? {
                                          scale: 0.985
                                      }
                                    : {}
                            }
                            className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-3.5 text-sm font-semibold text-white shadow-xl transition-all duration-300 ${
                                isAddingToPlanner
                                    ? "bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-600"
                                    : "bg-gradient-to-r from-purple-700 via-fuchsia-600 to-cyan-600 hover:brightness-110 hover:shadow-[0_12px_40px_rgba(124,58,237,0.30)]"
                            } ${
                                !selectedIdea ||
                                isAddingToPlanner
                                    ? "cursor-default opacity-70"
                                    : "cursor-pointer"
                            }`}
                        >
                            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                            <span className="pointer-events-none absolute -inset-10 bg-purple-400/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                            <span className="relative z-10 flex items-center gap-2">
                                {isAddingToPlanner ? (
                                    <>
                                        <SparkleSpinner />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <CalendarIcon className="w-5 h-5" />
                                        Add to Content Planner
                                    </>
                                )}
                            </span>
                        </motion.button>

                        <AnimatePresence>
                            {showAddedFeedback && (
                                <motion.span
                                    initial={{
                                        opacity: 0,
                                        x: -8,
                                        scale: 0.92
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: 1
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x: -6,
                                        scale: 0.94
                                    }}
                                    className="shrink-0 whitespace-nowrap rounded-lg bg-emerald-500/[0.10] px-2.5 py-2 text-[9px] font-semibold text-emerald-300"
                                >
                                    Added ✓
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        type="button"
                        onClick={
                            handleToggleSave
                        }
                        whileTap={{
                            scale: 0.88
                        }}
                        whileHover={{
                            y: -1
                        }}
                        className={`w-[52px] shrink-0 flex items-center justify-center rounded-2xl border transition-all ${
                            isSaved
                                ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                                : "bg-white/[0.015] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/15"
                        }`}
                    >
                        <BookmarkIcon
                            className={`w-5 h-5 ${
                                isSaved
                                    ? "text-white fill-white"
                                    : "text-white/55"
                            }`}
                        />
                    </motion.button>
                </div>

                {/* Empty state overlay */}

                {!isVisible && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#080a13]/75 backdrop-blur-[3px]">
                        <div className="flex flex-col items-center text-center px-8">
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/[0.08] border border-purple-400/[0.12] mb-4 shadow-[0_0_30px_rgba(168,85,247,0.10)]">
                                <LightningBoltIcon className="w-7 h-7 text-purple-300" />
                            </div>

                            <span className="text-sm font-semibold text-white/75">
                                Select an idea
                            </span>

                            <span className="text-[10px] text-white/30 mt-1.5 max-w-[220px]">
                                Click any bubble to view its analytics and execution guide.
                            </span>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* =================================================
                CUSTOM STYLES
            ================================================= */}

            <style jsx>{`
                @keyframes gradient {
                    0% {
                        background-position: 0% 50%;
                    }

                    50% {
                        background-position: 100% 50%;
                    }

                    100% {
                        background-position: 0% 50%;
                    }
                }

                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }

                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
});

export default SelectedIdeaPanel;