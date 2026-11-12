import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Lightbulb,
    Edit2,
    Sparkles,
    RotateCw,
    SlidersHorizontal,
    LayoutGrid,
} from "lucide-react";

import { db, auth } from "../firebase";

import {
    collection,
    getDocs,
    query,
    limit,
    orderBy,
    doc,
    setDoc,
    increment,
    serverTimestamp,
} from "firebase/firestore";

import BubbleCanvas from "./Ideagenerator/BubbleCanvas";
import PlatformFilter from "./Ideagenerator/PlatformFilter";
import IdeaAnalyticsOverview from "./Ideagenerator/IdeaAnalytics";
import SelectedIdeaPanel from "./Ideagenerator/SelectedIdeaPanel";

// ============================================================
// SAFE JSON
// ============================================================

const safeParse = (value, fallback = null) => {
    if (!value) return fallback;

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

// ============================================================
// MAIN
// ============================================================

const IdeaGenerator = () => {
    const [userData, setUserData] = useState(null);

    const [platforms, setPlatforms] = useState([]);

    const [selectedPlatform, setSelectedPlatform] =
        useState("All");

    const [selectedIdea, setSelectedIdea] =
        useState(null);

    const [ideas, setIdeas] = useState([]);

    const [summary, setSummary] = useState(null);

    // ========================================================
    // SHARED GENERATION STATE
    // ========================================================

    const [status, setStatus] = useState("idle");

    // "generate" | "regenerate" | null
    const [generationType, setGenerationType] =
        useState(null);

    // Controls the premium warning inside BubbleCanvas
    const [showGenerateFirst, setShowGenerateFirst] =
        useState(false);

    // IMPORTANT:
    // This is the real permission for Regenerate.
    // Old ideas from localStorage / Firestore do NOT count.
    const [hasGenerated, setHasGenerated] =
        useState(false);

    // ========================================================
    // LOAD DATA
    // ========================================================

    useEffect(() => {
        const loadData = async () => {
            try {
                const q = query(
                    collection(db, "test"),
                    orderBy("createdAt", "desc"),
                    limit(1)
                );

                const snap = await getDocs(q);

                let latestDoc = null;

                if (!snap.empty) {
                    latestDoc =
                        snap.docs[0].data();

                    setUserData(latestDoc);

                    setPlatforms(
                        latestDoc.platforms || []
                    );
                }

                // ------------------------------------------------
                // Saved session
                // ------------------------------------------------

                const session = safeParse(
                    localStorage.getItem(
                        "generatorSession"
                    )
                );

                if (session?.saved) {
                    setIdeas(
                        session.ideas || []
                    );

                    setSummary(
                        session.summary || null
                    );

                    setSelectedIdea(
                        session.selectedIdea ||
                            null
                    );

                    // IMPORTANT:
                    // Do NOT set hasGenerated(true)
                    // Old saved ideas do not unlock Regenerate.
                    return;
                }

                // ------------------------------------------------
                // Generated ideas
                // ------------------------------------------------

                const generated = safeParse(
                    localStorage.getItem(
                        "generatedIdeas"
                    )
                );

                if (generated) {
                    setIdeas(
                        generated.ideas || []
                    );

                    setSummary(
                        generated.summary || null
                    );

                    // IMPORTANT:
                    // Still false.
                    // User must Generate in this session.
                    return;
                }

                // ------------------------------------------------
                // Firestore fallback
                // ------------------------------------------------

                if (latestDoc) {
                    setIdeas(
                        latestDoc.ideas || []
                    );

                    setSummary(
                        latestDoc.summary || null
                    );

                    // IMPORTANT:
                    // Still false.
                }
            } catch (error) {
                console.error(
                    "Failed to load Idea Generator data:",
                    error
                );
            }
        };

        loadData();
    }, []);

    // ========================================================
    // SELECT IDEA
    // ========================================================

    const handleSelectIdea = useCallback(
        (idea) => {
            setSelectedIdea(idea);
        },
        []
    );

    // ========================================================
    // CLOSE IDEA
    // ========================================================

    const handleCloseIdea = useCallback(() => {
        setSelectedIdea(null);
    }, []);

    // ========================================================
    // RUN GENERATION
    // ========================================================

    const runGeneration = useCallback(
        async (type = "generate") => {
            // Prevent duplicate requests
            if (
                status === "loading" ||
                status === "generating"
            ) {
                return;
            }

            try {
                // ------------------------------------------------
                // Set current operation
                // ------------------------------------------------

                setGenerationType(type);

                setStatus("loading");

                setSelectedIdea(null);

                // While a new request is running,
                // Regenerate should not be available.
                setHasGenerated(false);

                setIdeas([]);

                setSummary(null);

                // ------------------------------------------------
                // Get latest form
                // ------------------------------------------------

                const formsRef =
                    collection(db, "test");

                const q = query(
                    formsRef,
                    orderBy(
                        "createdAt",
                        "desc"
                    ),
                    limit(1)
                );

                const querySnapshot =
                    await getDocs(q);

                if (querySnapshot.empty) {
                    throw new Error(
                        "No form found in Firestore."
                    );
                }

                const formData =
                    querySnapshot.docs[0].data();

                // ------------------------------------------------
                // Start generation state
                // ------------------------------------------------

                setStatus("generating");

                // ------------------------------------------------
                // Backend request
                // ------------------------------------------------

                const response =
                    await fetch(
                        "http://localhost:5000/api/generate-ideas",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify({
                                channelName:
                                    formData.username,

                                niche:
                                    formData.subNiche,

                                targetAudience:
                                    formData.targetAudience,

                                platforms:
                                    formData.platforms,

                                count: 10,
                            }),
                        }
                    );

                // ------------------------------------------------
                // Parse response
                // ------------------------------------------------

                const text =
                    await response.text();

                let data;

                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error(
                        "Backend returned an invalid JSON response."
                    );
                }

                // ------------------------------------------------
                // Backend error
                // ------------------------------------------------

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                            "Backend Error"
                    );
                }

                // ------------------------------------------------
                // Validate generated ideas
                // ------------------------------------------------

                if (
                    !data?.ideas ||
                    !Array.isArray(
                        data.ideas
                    ) ||
                    data.ideas.length === 0
                ) {
                    throw new Error(
                        "No ideas returned from Backend."
                    );
                }

                // ------------------------------------------------
                // Firebase user statistics
                // ------------------------------------------------

                const user =
                    auth?.currentUser;

                if (user) {
                    try {
                        const statsRef =
                            doc(
                                db,
                                "users",
                                user.uid,
                                "features",
                                "ideaGenerator"
                            );

                        await setDoc(
                            statsRef,
                            {
                                generateCount:
                                    increment(
                                        1
                                    ),

                                lastGeneratedAt:
                                    serverTimestamp(),

                                updatedAt:
                                    serverTimestamp(),
                            },
                            {
                                merge: true,
                            }
                        );
                    } catch (statsError) {
                        console.error(
                            "Failed to update stats:",
                            statsError
                        );
                    }
                }

                // ------------------------------------------------
                // Save generated data
                // ------------------------------------------------

                setIdeas(data.ideas);

                setSummary(
                    data.summary || null
                );

                // ------------------------------------------------
                // Save to localStorage
                // ------------------------------------------------

                localStorage.setItem(
                    "generatedIdeas",
                    JSON.stringify({
                        ideas: data.ideas,
                        summary:
                            data.summary ||
                            null,
                        generatedAt:
                            Date.now(),
                    })
                );

                // ------------------------------------------------
                // Update saved session
                // ------------------------------------------------

                const sessionRaw =
                    localStorage.getItem(
                        "generatorSession"
                    );

                let session = null;

                try {
                    session = sessionRaw
                        ? JSON.parse(
                              sessionRaw
                          )
                        : null;
                } catch {
                    session = null;
                }

                if (session?.saved) {
                    localStorage.setItem(
                        "generatorSession",
                        JSON.stringify({
                            ...session,
                            ideas: data.ideas,
                            summary:
                                data.summary ||
                                null,
                        })
                    );
                }

                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------
                // This is the ONLY moment where
                // Regenerate becomes allowed.

                setHasGenerated(true);

                setStatus("success");

                // Let BubbleCanvas play
                // the success state briefly.
                setTimeout(() => {
                    setStatus("idle");
                    setGenerationType(null);
                }, 900);
            } catch (error) {
                console.error(
                    "Generation failed:",
                    error
                );

                // Failed generation must
                // NOT unlock Regenerate.
                setHasGenerated(false);

                setStatus("idle");

                setGenerationType(null);
            }
        },
        [status]
    );

    // ========================================================
    // NORMAL GENERATE
    // ========================================================

    const handleGenerate = useCallback(() => {
        runGeneration("generate");
    }, [runGeneration]);

    // ========================================================
    // REGENERATE
    // ========================================================

    const handleRegenerate = useCallback(() => {
        // Prevent duplicate request
        if (
            status === "loading" ||
            status === "generating"
        ) {
            return;
        }

        // ----------------------------------------------------
        // IMPORTANT:
        // Ideas existing in state/localStorage
        // do NOT unlock Regenerate.
        // Only successful current-session Generate does.
        // ----------------------------------------------------

        if (!hasGenerated) {
            setShowGenerateFirst(true);

            setTimeout(() => {
                setShowGenerateFirst(
                    false
                );
            }, 2800);

            return;
        }

        // ----------------------------------------------------
        // Valid regeneration
        // ----------------------------------------------------

        runGeneration("regenerate");
    }, [
        hasGenerated,
        runGeneration,
        status,
    ]);

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="min-h-screen  bg-[#05010d] text-white p-4 md:p-6 font-sans flex flex-col xl:flex-row gap-6  overflow-x-hidden">

            {/* ==================================================
                LEFT COLUMN
            ================================================== */}

            <div className="flex flex-col py-20 flex-1 min-w-0 gap-6">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl">

                            {/* Premium lightbulb */}

                            <div className="relative flex items-center justify-center shrink-0">
                                <div className="absolute w-12 h-12 rounded-full bg-purple-500/10 blur-xl md:w-14 md:h-14" />

                                <Lightbulb className="relative w-8 h-8 md:w-10 md:h-10 text-rose-300 drop-shadow-[0_0_8px_rgba(251,113,133,0.55)]" />
                            </div>

                            {/* Premium title */}

                            <span className="relative leading-none">
                                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-white bg-clip-text text-transparent">
                                    Idea
                                </span>

                                <span className="ml-2 bg-gradient-to-r from-white via-white/90 to-purple-200 bg-clip-text text-transparent">
                                    Generator
                                </span>

                                <span className="absolute -bottom-2 left-0 h-px w-24 bg-gradient-to-r from-purple-500/70 to-transparent" />
                            </span>
                        </h1>

                        <p className="flex items-center gap-2 mt-2 text-xs text-slate-400 md:text-sm">
                            AI-powered ideas tailored for your niche:{" "}
                            {userData?.subNiche ||
                                "Tech & Productivity"}

                            <Edit2 className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
                        </p>
                    </div>
                </div>

                {/* ==================================================
                    PLATFORM FILTER
                ================================================== */}

                <PlatformFilter
                    platforms={platforms}
                    selectedPlatform={
                        selectedPlatform
                    }
                    setSelectedPlatform={
                        setSelectedPlatform
                    }
                />

                {/* ==================================================
                    CANVAS
                ================================================== */}

                <div className="relative w-full h-[620px] md:h-[760px] lg:h-[850px] bg-[#0c061c] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">

                    <BubbleCanvas
                        selectedIdea={
                            selectedIdea
                        }
                        setSelectedIdea={
                            handleSelectIdea
                        }
                        selectedPlatform={
                            selectedPlatform
                        }
                        ideas={ideas}
                        setIdeas={setIdeas}
                        summary={summary}
                        setSummary={setSummary}
                        onGenerate={
                            handleGenerate
                        }
                        onRegenerate={
                            handleRegenerate
                        }
                        status={status}
                        generationType={
                            generationType
                        }
                        showGenerateFirst={
                            showGenerateFirst
                        }
                        hasGenerated={
                            hasGenerated
                        }
                    />

                    {/* ==================================================
                        AUTO ANALYZE
                    ================================================== */}

                    <div className="absolute z-30 flex flex-col items-start gap-3 bottom-4 left-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-300">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            Auto analyze ideas
                        </div>

                        <div className="flex items-center w-10 h-5 px-1 bg-purple-600 rounded-full cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.35)]">
                            <div className="w-3.5 h-3.5 bg-white rounded-full translate-x-4 shadow-[0_0_8px_rgba(255,255,255,0.55)]" />
                        </div>
                    </div>

                    {/* ==================================================
                        REGENERATE IDEAS
                    ================================================== */}

                    <button
                        type="button"
                        onClick={
                            handleRegenerate
                        }
                        disabled={
                            status ===
                                "loading" ||
                            status ===
                                "generating"
                        }
                        className="absolute z-30 items-center hidden gap-2 px-4 py-2 text-sm transition-all -translate-x-1/2 border rounded-xl md:flex bottom-4 left-1/2 text-slate-300 bg-white/5 hover:bg-white/10 border-white/5 hover:border-purple-400/30 hover:text-white hover:shadow-[0_0_24px_rgba(139,92,246,0.12)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCw
                            className={`w-4 h-4 ${
                                status ===
                                    "loading" ||
                                status ===
                                    "generating"
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        {status ===
                            "loading" ||
                        status ===
                            "generating"
                            ? generationType ===
                              "regenerate"
                                ? "Regenerating..."
                                : "Generating..."
                            : "Regenerate Ideas"}
                    </button>

                    {/* ==================================================
                        VIEW
                    ================================================== */}

                    <div className="absolute z-30 flex items-center gap-2 bottom-4 right-4">
                        <span className="hidden text-sm md:inline text-slate-400">
                            View as
                        </span>

                        <div className="flex p-1 border rounded-lg bg-white/5 border-white/5">
                            <button
                                type="button"
                                className="p-1.5 bg-purple-600/30 text-purple-400 rounded-md"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    ANALYTICS
                ================================================== */}

                <IdeaAnalyticsOverview
                    ideas={ideas}
                    summary={summary}
                    selectedPlatform={
                        selectedPlatform
                    }
                />

                {/* ==================================================
                    TIP
                ================================================== */}

                <div className="flex items-start gap-3 p-3 text-xs text-purple-200 border bg-purple-900/20 border-purple-500/20 rounded-xl md:items-center md:text-sm">
                    <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 md:mt-0" />

                    Tip: Click on any idea bubble to see detailed execution guide, strengths, and weaknesses.
                </div>
            </div>

            {/* ==================================================
                RIGHT COLUMN
            ================================================== */}

            <SelectedIdeaPanel
                selectedIdea={
                    selectedIdea
                }
                ideas={ideas}
                summary={summary}
                onGenerate={
                    handleGenerate
                }
                status={status}
                onClose={
                    handleCloseIdea
                }
            />
        </div>
    );
};

export default IdeaGenerator;