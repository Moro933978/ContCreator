import React, { useState, useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  TrendingUp,
  ThumbsUp,
  Share2,
  Eye,
  ThumbsDown,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wand2,
  Smile,
  ChevronDown,
  Info,
} from "lucide-react";

import { doc, increment, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

import ViralMeterForm from "./viralmeter/ViralMeterForm";
import PredictionOverview from "./viralmeter/PredictionOverview";
import EngagementPredictionChart from "./viralmeter/EngagementPrediction";
import PlatformBreakdown from "./viralmeter/PlatformBreakdown";
import AudienceSentiment from "./viralmeter/AudienceSentiment";
import ContentInsights from "./viralmeter/ContentInsights";

// =====================================================
// ANIMATION UTILS
// =====================================================

const Counter = ({
  from = 0,
  to,
  duration = 1.5,
  format = (v) => v,
}) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;

    if (!node) return;

    const controls = animate(from, to, {
      duration,
      ease: "easeOut",

      onUpdate(value) {
        node.textContent = format(value);
      },
    });

    return () => controls.stop();
  }, [from, to, duration, format]);

  return <span ref={nodeRef} />;
};

// =====================================================
// DATA
// =====================================================

const chartData = [
  { time: "0h", value: 2000 },
  { time: "6h", value: 6500 },
  { time: "12h", value: 9000 },
  { time: "18h", value: 10500 },
  { time: "24h", value: 12500 },
  { time: "48h", value: 13500 },
  { time: "72h", value: 14500 },
  { time: "1 Week", value: 19000 },
];

const platformData = [
  {
    name: "YouTube",
    value: 65,
    color: "#A825FF",
    actual: "81.2K",
  },
  {
    name: "Instagram",
    value: 15,
    color: "#7C3AED",
    actual: "18.7K",
  },
  {
    name: "TikTok",
    value: 10,
    color: "#2563EB",
    actual: "12.5K",
  },
  {
    name: "Facebook",
    value: 7,
    color: "#0EA5E9",
    actual: "8.7K",
  },
  {
    name: "LinkedIn",
    value: 3,
    color: "#06B6D4",
    actual: "3.7K",
  },
];

// =====================================================
// CARD
// =====================================================

const Card = ({
  children,
  className = "",
  delay = 0,
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 20,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    transition={{
      duration: 0.5,
      delay,
      type: "spring",
      stiffness: 100,
    }}
    className={`
      bg-gradient-to-br
      from-[#1B143F]
      via-[#120D2B]
      to-[#0D091F]
      border
      border-purple-500/20
      rounded-[22px]
      shadow-[0_10px_35px_rgba(139,92,246,0.12)]
      relative
      overflow-hidden
      ${className}
    `}
  >
    {children}
  </motion.div>
);

// =====================================================
// SMALL PROGRESS RING
// =====================================================

const ProgressRingSmall = ({
  progress,
  color,
  icon: Icon,
}) => {
  const size = 52;
  const strokeWidth = 4;

  const radius = (size - strokeWidth) / 2;

  const circumference =
    radius * 2 * Math.PI;

  const offset =
    circumference -
    (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-md"
        style={{
          backgroundColor: color,
        }}
      />

      <svg
        className="transform -rotate-90 w-full h-full absolute inset-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDashoffset: offset,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: 0.2,
          }}
          strokeLinecap="round"
        />
      </svg>

      <Icon
        size={20}
        style={{ color }}
        className="relative z-10"
      />
    </div>
  );
};

// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  title,
  value,
  prefix = "",
  suffix = "",
  status,
  icon,
  color,
  progress,
  delay,
}) => {
  const isHigh = status === "High";
  const isMed = status === "Medium";

  const statusColor = isHigh
    ? "text-green-400"
    : isMed
    ? "text-yellow-400"
    : "text-pink-500";

  const numericValue = parseFloat(
    value.replace(/,/g, "")
  );

  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.4,
        delay,
      }}
      className="
        bg-[#1A153B]/60
        border
        border-purple-500/15
        rounded-2xl
        p-4
        flex
        flex-row
        items-center
        gap-4
        hover:bg-[#231B4E]/70
        hover:border-purple-500/30
        transition-all
        group
        cursor-pointer
        shadow-[0_4px_20px_rgba(139,92,246,0.06)]
      "
    >
      <ProgressRingSmall
        progress={progress}
        color={color}
        icon={icon}
      />

      <div className="flex flex-col min-w-0">
        <span className="text-xs text-gray-400 font-medium mb-1 truncate">
          {title}
        </span>

        <div className="flex items-baseline gap-2">
          <span className="text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
            {prefix}

            <Counter
              to={numericValue}
              format={(v) => {
                if (value.includes("K")) {
                  return (
                    (v / 1000).toFixed(0) +
                    "K"
                  );
                }

                if (value.includes(".")) {
                  return v.toFixed(1);
                }

                return Math.floor(v).toLocaleString();
              }}
            />

            {suffix}
          </span>
        </div>

        <span
          className={`
            text-[10px]
            sm:text-xs
            font-medium
            mt-1
            ${statusColor}
          `}
        >
          {status}
        </span>
      </div>
    </motion.div>
  );
};

// =====================================================
// SOCIAL ICONS
// =====================================================

const SocialIcons = {
  YouTube: () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 text-red-500"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),

  Instagram: () => (
    <svg
      viewBox="0 0 24 24"
      fill="url(#ig-grad)"
      className="w-4 h-4"
    >
      <defs>
        <linearGradient
          id="ig-grad"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor="#F58529"
          />
          <stop
            offset="50%"
            stopColor="#DD2A7B"
          />
          <stop
            offset="100%"
            stopColor="#8134AF"
          />
        </linearGradient>
      </defs>

      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),

  TikTok: () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 text-white"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),

  Facebook: () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 text-blue-500"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),

  LinkedIn: () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 text-blue-400"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

// =====================================================
// PLATFORM BUTTON
// =====================================================

const PlatformButton = ({
  platform,
  selected,
  onClick,
}) => {
  const Icon = SocialIcons[platform];

  return (
    <button
      onClick={onClick}
      className={`
        flex
        items-center
        gap-2
        px-4
        py-2.5
        rounded-lg
        text-sm
        font-medium
        transition-all
        duration-300
        border
        cursor-pointer

        ${
          selected
            ? "bg-white/[0.05] border-white/[0.1] text-white"
            : "bg-transparent border-white/[0.04] text-gray-400 hover:bg-white/[0.02] hover:text-white"
        }
      `}
    >
      <span>
        <Icon />
      </span>

      {platform}
    </button>
  );
};

// =====================================================
// VIRAL METER DASHBOARD
// =====================================================

export default function ViralMeterDashboard() {
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  // ===================================================
  // Ring
  // ===================================================

  const ringSize = 150;

  const strokeW = 16;

  const rad = (ringSize - strokeW) / 2;

  const circ = rad * 2 * Math.PI;

  const progOffset =
    circ - (87 / 100) * circ;

  // ===================================================
  // Save Viral Meter Stats
  // ===================================================

const updateViralMeterStats = async (viralScore) => {
  const user = auth.currentUser;

  if (!user) {
    console.warn(
      "No authenticated user found. Viral Meter stats were not saved."
    );

    return;
  }

  if (
    typeof viralScore !== "number" ||
    !Number.isFinite(viralScore)
  ) {
    console.warn(
      "Invalid viral score. Stats were not saved:",
      viralScore
    );

    return;
  }

  try {
    const statsRef = doc(
      db,
      "users",
      user.uid,
      "features",
      "viralMeter"
    );

    const now = new Date();

    // Local calendar date: YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const dateKey = `${year}-${month}-${day}`;

    await setDoc(
      statsRef,
      {
        // Total number of successful analyses
        generationCount: increment(1),

        // Total score used for average calculation
        viralScoreTotal: increment(viralScore),

        // Last score
        lastViralScore: viralScore,

        // Real daily activity for the Profile chart
        [`dailyActivity.${dateKey}`]: increment(1),

        lastAnalyzedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    console.log(
      `✅ Viral Meter stats updated successfully for ${dateKey}:`,
      viralScore
    );
  } catch (error) {
    console.error(
      "Failed to update Viral Meter stats:",
      error
    );
  }
};

  // ===================================================
  // Analyze
  // ===================================================

  const handleAnalyze = async (formData) => {
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/viral-meter",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        // =============================================
        // Save Result To UI
        // =============================================

        setResult(data.data);

        // =============================================
        // Get Viral Score
        // =============================================

        const viralScore = Number(
          data.data?.viralScore
        );

        console.log(
          "🔥 Viral Score:",
          viralScore
        );

        // =============================================
        // Save Real Generation
        // =============================================

        if (Number.isFinite(viralScore)) {
          await updateViralMeterStats(
            viralScore
          );
        } else {
          console.warn(
            "viralScore was not found in API response."
          );

          console.log(
            "API Result:",
            data.data
          );
        }
      } else {
        console.error(
          "API Error:",
          data
        );
      }
    } catch (error) {
      console.error(
        "Viral Meter Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // Debug
  // ===================================================

  console.log(
    "🔥 Prediction Result:",
    result
  );

  // ===================================================
  // UI
  // ===================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#00020f]
        text-white
        p-3
        sm:p-4
        md:p-6
        lg:p-8
        font-sans
        flex
        justify-center
        selection:bg-purple-500/30
        overflow-x-hidden
      "
    >
      <div
        className="
          w-full
          max-w-[1500px]
          flex
          flex-col
          gap-4
          sm:gap-6
        "
      >

        {/* =========================================
            TOP SECTION
        ========================================= */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[560px_1fr]
            xl:grid-cols-[600px_1fr]
            gap-4
            sm:gap-6
            items-stretch
          "
        >

          {/* =======================================
              LEFT COLUMN
          ======================================= */}

          <div
            className="
              flex
              flex-col
              gap-4
              sm:gap-6
              h-full
            "
          >

            {/* HEADER */}

            <motion.header
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                flex
                items-center
                gap-3.5
                sm:gap-4
                shrink-0
              "
            >
              <div
                className="
                  w-9
                  h-9
                  sm:w-11
                  sm:h-11
                  shrink-0
                  flex
                  items-center
                  justify-center
                  text-[#A855F7]
                  drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-full h-full"
                >
                  <path d="M3 20h14" />
                  <path d="M6 20v-4" />
                  <path d="M10 20v-7" />
                  <path d="M14 20v-5" />
                  <path d="M3 11l5-4 4 3 9-8" />
                  <path d="M15 2h6v6" />
                </svg>
              </div>

              <div
                className="
                  flex
                  flex-col
                  justify-center
                  min-w-0
                "
              >
                <h1
                  className="
                    text-2xl
                    sm:text-4xl
                    font-bold
                    tracking-tight
                    text-transparent
                    bg-clip-text
                    bg-gradient-to-r
                    from-[#E84DF9]
                    via-[#0077b6]
                    truncate
                    leading-tight
                  "
                >
                  Viral Meter
                </h1>

                <p
                  className="
                    text-gray-400
                    text-xs
                    sm:text-sm
                    mt-0.5
                    truncate
                    font-normal
                  "
                >
                  Predict your content's performance before you post
                </p>
              </div>
            </motion.header>

            {/* INPUT FORM */}

            <ViralMeterForm
              loading={loading}
              onAnalyze={handleAnalyze}
            />
          </div>

          {/* =======================================
              RIGHT COLUMN
          ======================================= */}

          <div
            className="
              flex
              flex-col
              gap-4
              sm:gap-6
              h-full
              min-w-0
            "
          >

            <PredictionOverview
              loading={loading}
              result={result}
            />

            <EngagementPredictionChart
              loading={loading}
              result={result}
            />

          </div>
        </div>

        {/* =========================================
            BOTTOM ANALYTICS SECTION
        ========================================= */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-12
            gap-4
            sm:gap-6
            w-full
            items-stretch
          "
        >

          {/* PLATFORM */}

          <div
            className="
              md:col-span-2
              lg:col-span-5
              w-full
              min-w-0
              h-full
            "
          >
            <PlatformBreakdown
              loading={loading}
              result={result}
            />
          </div>

          {/* AUDIENCE */}

          <div
            className="
              md:col-span-1
              lg:col-span-4
              w-full
              min-w-0
              h-full
            "
          >
            <AudienceSentiment
              loading={loading}
              result={result}
            />
          </div>

          {/* CONTENT INSIGHTS */}

          <div
            className="
              md:col-span-1
              lg:col-span-3
              w-full
              min-w-0
              h-full
            "
          >
            <ContentInsights
              loading={loading}
              result={result}
            />
          </div>

        </div>
      </div>
    </div>
  );
}