import React, { useMemo, useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';

// ==========================================
// CONFIGURATION & COLORS
// ==========================================
const PLATFORM_STYLES = {
    'YouTube': { color: '#ef4444' },
    'Instagram': { color: '#d946ef' },
    'TikTok': { color: '#1e293b' },
    'Facebook': { color: '#2563eb' },
    'LinkedIn': { color: '#0ea5e9' },
    'WhatsApp': { color: '#22c55e' },
    'Default': { color: '#8B5CF6' }
};

const CARD_COLORS = {
    total: '#e879f9',
    high: '#4ade80',
    medium: '#f59e0b',
    trending: '#60a5fa',
    viral: '#d946ef',
};

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ==========================================
// ANIMATED COUNTER
// ==========================================
const AnimatedCounter = React.memo(({ value, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1.5,
            ease: 'easeOut',
            onUpdate: (v) => setCount(Math.round(v)),
        });

        return controls.stop;
    }, [value]);

    return (
        <>
            {count}
            {suffix}
        </>
    );
});

// ==========================================
// STAT CARD
// ==========================================
const StatCard = React.memo(({ title, value, color, delay }) => (
    <motion.div
        key={`card-${value}`}
        initial={{
            opacity: 0,
            scale: 0.95
        }}
        animate={{
            opacity: 1,
            scale: 1
        }}
        transition={{
            delay,
            duration: 0.4,
            ease: 'easeOut'
        }}
        className="
            w-[100px]
            h-[100px]
            flex
            flex-col
            items-center
            justify-center
            rounded-xl
            border
            shrink-0
            relative
            overflow-hidden
            backdrop-blur-md
        "
        style={{
            background: `
                linear-gradient(
                    145deg,
                    ${hexToRgba(color, 0.075)},
                    rgba(8, 10, 30, 0.34)
                )
            `,
            borderColor: hexToRgba(color, 0.13),
            boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.035),
                0 0 12px ${hexToRgba(color, 0.025)},
                0 6px 18px rgba(0,0,0,0.18)
            `
        }}
    >
        {/* Soft Premium Glow */}
        <div
            className="
                absolute
                -top-8
                left-1/2
                -translate-x-1/2
                w-20
                h-16
                rounded-full
                blur-2xl
                pointer-events-none
            "
            style={{
                backgroundColor: hexToRgba(color, 0.08)
            }}
        />

        <div
            className="relative z-10 text-[26px] font-semibold tracking-tight mb-1"
            style={{
                color,
                textShadow: `
                    0 0 8px ${hexToRgba(color, 0.45)},
                    0 0 16px ${hexToRgba(color, 0.15)}
                `
            }}
        >
            <AnimatedCounter value={value} />
        </div>

        <h3
            className="
                relative
                z-10
                text-[10px]
                font-medium
                text-slate-300
                text-center
                px-2
                leading-tight
            "
        >
            {title}
        </h3>
    </motion.div>
));

// ==========================================
// VIRAL POTENTIAL CARD
// ==========================================
const ViralPotentialCard = React.memo(({ score, delay }) => {

    const radius = 22;
    const circumference = 2 * Math.PI * radius;

    const strokeDashoffset =
        circumference -
        (score / 100) * circumference;

    const color = CARD_COLORS.viral;

    return (
        <motion.div
            key={`viral-${score}`}
            initial={{
                opacity: 0,
                scale: 0.95
            }}
            animate={{
                opacity: 1,
                scale: 1
            }}
            transition={{
                delay,
                duration: 0.4,
                ease: 'easeOut'
            }}
            className="
                w-[100px]
                h-[100px]
                flex
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                shrink-0
                relative
                overflow-hidden
                backdrop-blur-md
            "
            style={{
                background: `
                    linear-gradient(
                        145deg,
                        ${hexToRgba(color, 0.075)},
                        rgba(8, 10, 30, 0.34)
                    )
                `,
                borderColor: hexToRgba(color, 0.13),
                boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.035),
                    0 0 16px ${hexToRgba(color, 0.035)},
                    0 6px 18px rgba(0,0,0,0.18)
                `
            }}
        >
            {/* Soft Glow */}
            <div
                className="
                    absolute
                    -top-6
                    left-1/2
                    -translate-x-1/2
                    w-20
                    h-16
                    rounded-full
                    blur-2xl
                    pointer-events-none
                "
                style={{
                    backgroundColor: hexToRgba(color, 0.09)
                }}
            />

            <div className="relative z-10 w-12 h-12 flex items-center justify-center mb-1">

                <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 60 60"
                    style={{
                        filter: `
                            drop-shadow(
                                0 0 5px ${hexToRgba(color, 0.75)}
                            )
                            drop-shadow(
                                0 0 10px ${hexToRgba(color, 0.28)}
                            )
                        `
                    }}
                >
                    {/* Background Track */}
                    <circle
                        cx="30"
                        cy="30"
                        r={radius}
                        className="fill-none"
                        stroke="rgba(255,255,255,0.045)"
                        strokeWidth="3.5"
                    />

                    {/* Animated Progress */}
                    <motion.circle
                        key={`ring-${score}`}
                        cx="30"
                        cy="30"
                        r={radius}
                        className="fill-none"
                        stroke={color}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        initial={{
                            strokeDashoffset: circumference
                        }}
                        animate={{
                            strokeDashoffset
                        }}
                        transition={{
                            duration: 1.5,
                            ease: "easeOut",
                            delay: delay + 0.2
                        }}
                        style={{
                            strokeDasharray: circumference
                        }}
                    />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className="
                            text-xs
                            font-bold
                            text-white
                        "
                        style={{
                            textShadow: `
                                0 0 7px ${hexToRgba(color, 0.65)}
                            `
                        }}
                    >
                        <AnimatedCounter
                            value={score}
                            suffix="%"
                        />
                    </span>
                </div>
            </div>

            <h3
                className="
                    relative
                    z-10
                    text-[10px]
                    font-medium
                    text-slate-300
                    text-center
                    leading-tight
                "
            >
                Avg. Viral Potential
            </h3>
        </motion.div>
    );
});

// ==========================================
// MAIN COMPONENT
// ==========================================
function IdeaAnalyticsOverview({
    ideas = [],
    summary = null
}) {

    // ==========================================
    // AI SUMMARY
    // ==========================================
    console.log("Summary:", summary);
    console.log("Ideas:", ideas);

    const stats = useMemo(() => {

        // Primary Source → AI Summary
        if (summary) {

            console.log(
                "Using AI Summary",
                summary
            );

            return {
                total:
                    summary.totalIdeas || 0,

                high:
                    summary.highPotential || 0,

                medium:
                    summary.mediumPotential || 0,

                trending:
                    summary.trendingIdeas || 0,

                averageScore:
                    Math.round(
                        summary.averageScore || 0
                    ),
            };
        }

        // Fallback → Calculate from ideas
        let total = ideas.length;
        let high = 0;
        let medium = 0;
        let trending = 0;
        let totalScore = 0;

        ideas.forEach((idea) => {

            if (idea.potential === "High") {
                high++;
            }

            if (idea.potential === "Medium") {
                medium++;
            }

            if (idea.isTrending) {
                trending++;
            }

            if (
                typeof idea.analytics?.score ===
                "number"
            ) {
                totalScore +=
                    idea.analytics.score;
            }

        });

        return {
            total,
            high,
            medium,
            trending,

            averageScore:
                ideas.length > 0
                    ? Math.round(
                        totalScore /
                        ideas.length
                    )
                    : 0
        };

    }, [ideas, summary]);

    // ==========================================
    // PLATFORM DISTRIBUTION
    // ==========================================
    const platformStats = useMemo(() => {

        const counts = {};

        ideas.forEach((idea) => {

            const platforms =
                Array.isArray(idea.platforms)
                    ? idea.platforms
                    : (
                        idea.platform
                            ? [idea.platform]
                            : []
                    );

            platforms.forEach((platform) => {

                counts[platform] =
                    (counts[platform] || 0) + 1;

            });

        });

        const totalAssigned =
            Object.values(counts)
                .reduce(
                    (sum, value) =>
                        sum + value,
                    0
                );

        const data =
            Object.entries(counts)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .map(([name, count]) => ({

                    name,
                    count,

                    percentage:
                        totalAssigned > 0
                            ? Math.round(
                                (count /
                                    totalAssigned) *
                                100
                            )
                            : 0,

                    style:
                        PLATFORM_STYLES[name] ||
                        PLATFORM_STYLES.Default
                }));

        let current = 0;

        const gradientStops =
            data
                .map((item) => {

                    const start =
                        current;

                    const end =
                        current +
                        item.percentage;

                    current = end;

                    return `
                        ${item.style.color}
                        ${start}%
                        ${end}%
                    `;
                })
                .join(", ");

        return {
            data,
            totalAssigned,

            gradientString:
                data.length > 0
                    ? `conic-gradient(${gradientStops})`
                    : "transparent"
        };

    }, [ideas]);

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div
            className="
                w-full
                flex
                flex-col
                xl:flex-row
                justify-between
                gap-3
                p-5
                rounded-2xl
                border
                relative
                overflow-hidden
            "
            style={{
            background: `
                linear-gradient(
                    125deg,
                    #07061f 0%,
                    #120a30 35%,
                    #09031e 70%,
                    #050315 100%
                )
            `,
                        borderColor:
                    'rgba(255,255,255,0.08)',
                boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.045),
                    0 12px 28px rgba(0,0,0,0.30)
                `
            }}
        >

            {/* ==========================================
                SOFT BACKGROUND GLOW
            ========================================== */}
            <div
                className="
                    absolute
                    inset-0
                    pointer-events-none
                "
                style={{
                    background: `
                        radial-gradient(
                            circle at 20% 50%,
                            rgba(16,185,129,0.035),
                            transparent 35%
                        ),
                        radial-gradient(
                            circle at 80% 50%,
                            rgba(139,92,246,0.065),
                            transparent 38%
                        )
                    `
                }}
            />

            {/* ==========================================
                LEFT SECTION
            ========================================== */}
            <div className="flex-1 relative z-10">

                <div className="flex items-center gap-2 mb-4">

                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="
                            drop-shadow-[0_0_7px_rgba(168,85,247,0.85)]
                        "
                    >
                        <path d="M3 3v18h18" />
                        <path d="m19 9-5 5-4-4-3 3" />
                    </svg>

                    <h2
                        className="
                            text-[12px]
                            font-medium
                            text-slate-200
                            tracking-wide
                            uppercase
                        "
                        style={{
                            textShadow:
                                '0 0 8px rgba(255,255,255,0.07)'
                        }}
                    >
                        Ideas Overview
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                    <StatCard
                        title="Total Ideas"
                        value={stats.total}
                        color={CARD_COLORS.total}
                        delay={0.1}
                    />

                    <StatCard
                        title="High Potential"
                        value={stats.high}
                        color={CARD_COLORS.high}
                        delay={0.2}
                    />

                    <StatCard
                        title="Medium Potential"
                        value={stats.medium}
                        color={CARD_COLORS.medium}
                        delay={0.3}
                    />

                    <StatCard
                        title="Trending Topics"
                        value={stats.trending}
                        color={CARD_COLORS.trending}
                        delay={0.4}
                    />

                    <ViralPotentialCard
                        score={stats.averageScore}
                        delay={0.5}
                    />

                </div>
            </div>

            {/* ==========================================
                RIGHT SECTION
            ========================================== */}
            <div
                className="
                    w-full
                    xl:w-[340px]
                    shrink-0
                    flex
                    flex-col
                    relative
                    z-10
                "
            >

                <div className="flex items-center gap-2 mb-4">

                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="
                            drop-shadow-[0_0_7px_rgba(168,85,247,0.85)]
                        "
                    >
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                        <path d="M22 12A10 10 0 0 0 12 2v10z" />
                    </svg>

                    <h2
                        className="
                            text-[12px]
                            font-medium
                            text-slate-200
                            tracking-wide
                            uppercase
                        "
                        style={{
                            textShadow:
                                '0 0 8px rgba(255,255,255,0.07)'
                        }}
                    >
                        Platform Distribution
                    </h2>
                </div>

                <div className="flex items-center gap-6">

                    {/* ==========================================
                        DONUT CHART
                    ========================================== */}
                    <div className="relative flex items-center justify-center shrink-0">

                        <motion.div
                            key={`donut-${platformStats.totalAssigned}`}
                            initial={{
                                rotate: -90,
                                opacity: 0,
                                scale: 0.95
                            }}
                            animate={{
                                rotate: 0,
                                opacity: 1,
                                scale: 1
                            }}
                            transition={{
                                duration: 1.3,
                                ease: "easeInOut"
                            }}
                            className="
                                w-[110px]
                                h-[110px]
                                rounded-full
                                relative
                            "
                            style={{
                                background:
                                    platformStats.gradientString,

                                backgroundColor:
                                    platformStats.totalAssigned === 0
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'transparent',

                                boxShadow: `
                                    0 0 15px rgba(139,92,246,0.10),
                                    0 0 25px rgba(217,70,239,0.05)
                                `
                            }}
                        >

                            {/* Subtle Ring Glow */}
                            <div
                                className="
                                    absolute
                                    inset-0
                                    rounded-full
                                    pointer-events-none
                                "
                                style={{
                                    boxShadow:
                                        'inset 0 0 10px rgba(255,255,255,0.05)'
                                }}
                            />

                            {/* Inner Dark Hole */}
                            <div
                                className="
                                    absolute
                                    inset-[18px]
                                    rounded-full
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    border
                                "
                                style={{
                                    background:
                                        'rgba(10,15,35,0.93)',

                                    borderColor:
                                        'rgba(255,255,255,0.055)',

                                    boxShadow: `
                                        inset 0 0 14px rgba(0,0,0,0.45)
                                    `
                                }}
                            >

                                <span
                                    className="
                                        text-[18px]
                                        font-bold
                                        text-white
                                        leading-none
                                        mb-0.5
                                    "
                                    style={{
                                        textShadow:
                                            '0 0 9px rgba(255,255,255,0.15)'
                                    }}
                                >
                                    <AnimatedCounter
                                        value={
                                            platformStats.totalAssigned
                                        }
                                    />
                                </span>

                                <span className="text-[9px] text-slate-400">
                                    Ideas
                                </span>

                            </div>
                        </motion.div>
                    </div>

                    {/* ==========================================
                        DYNAMIC LEGEND
                    ========================================== */}
                    <div className="flex flex-col gap-1.5 flex-1">

                        {platformStats.data.length === 0 ? (

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="
                                    text-[11px]
                                    text-slate-400/70
                                    italic
                                "
                            >
                                Awaiting generation...
                            </motion.div>

                        ) : (

                            platformStats.data.map(
                                (platform, idx) => (

                                    <motion.div
                                        key={`${platform.name}-${platform.count}`}
                                        initial={{
                                            opacity: 0,
                                            x: -10
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0
                                        }}
                                        transition={{
                                            delay:
                                                0.6 +
                                                (idx * 0.1)
                                        }}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            text-[10px]
                                        "
                                    >

                                        <div className="flex items-center gap-2">

                                            <div
                                                className="
                                                    w-2
                                                    h-2
                                                    rounded-sm
                                                "
                                                style={{
                                                    backgroundColor:
                                                        platform.style.color,

                                                    boxShadow: `
                                                        0 0 6px ${platform.style.color}
                                                    `
                                                }}
                                            />

                                            <span className="
                                                text-slate-200
                                                font-medium
                                            ">
                                                {platform.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">

                                            <span className="
                                                text-slate-200
                                                w-2
                                                text-right
                                                font-semibold
                                            ">
                                                {platform.count}
                                            </span>

                                            <span className="
                                                text-slate-400
                                                w-8
                                                text-right
                                            ">
                                                ({platform.percentage}%)
                                            </span>

                                        </div>

                                    </motion.div>
                                )
                            )
                        )}

                    </div>
                </div>
            </div>

        </div>
    );
}

export default React.memo(IdeaAnalyticsOverview);