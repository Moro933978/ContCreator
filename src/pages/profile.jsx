import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  FileText,
  ImagePlus,
  Lightbulb,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  PenLine,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { onAuthStateChanged, signOut, multiFactor } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

/* =========================================================
   FEATURE CONFIG
========================================================= */

const FEATURE_CONFIG = {
  chatbot: {
    id: "chatbot",
    title: "AI Chatbot",
    short: "AI Chatbot",
    description:
      "Generate, refine and discuss ideas with your AI assistant.",
    icon: MessageCircle,
    color: "violet",
    countKeys: ["generateCount"],
    dateKeys: ["lastInteractionAt", "updatedAt"],
  },

  contentGenerator: {
    id: "contentGenerator",
    title: "Content Generator",
    short: "Content Generator",
    description:
      "Create complete social posts and polished content faster.",
    icon: FileText,
    color: "violet",
    countKeys: ["postCount"],
    dateKeys: ["lastGeneratedAt", "updatedAt"],
  },

  viralMeter: {
    id: "viralMeter",
    title: "Viral Meter",
    short: "Viral Meter",
    description:
      "Analyze your content and predict its viral potential.",
    icon: BarChart3,
    color: "violet",
    countKeys: ["generationCount"],
    dateKeys: ["lastAnalyzedAt", "updatedAt"],
  },

  ideaGenerator: {
    id: "ideaGenerator",
    title: "Idea Generator",
    short: "Idea Generator",
    description:
      "Generate fresh content directions for your next post.",
    icon: Lightbulb,
    color: "violet",
    countKeys: ["generateCount"],
    dateKeys: ["lastGeneratedAt", "updatedAt"],
  },

  postEditor: {
    id: "postEditor",
    title: "Post Editor",
    short: "Post Editor",
    description:
      "Turn rough posts into sharper, clearer AI-enhanced content.",
    icon: PenLine,
    color: "violet",
    countKeys: ["generateCount"],
    dateKeys: ["lastGeneratedAt", "updatedAt"],
  },
};

const FEATURE_IDS = Object.keys(FEATURE_CONFIG);

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

const safeDate = (value) => {
  if (!value) return null;

  try {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const formatJoinedDate = (value) => {
  const date = safeDate(value);

  if (!date) return "Joined recently";

  return `Joined ${date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })}`;
};

const relativeTime = (value) => {
  const date = safeDate(value);

  if (!date) return "No activity yet";

  const diff = Math.max(0, Date.now() - date.getTime());

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";

  if (diff < hour) {
    const minutes = Math.max(1, Math.floor(diff / minute));
    return `${minutes}m ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  }

  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const fullDate = (value) => {
  const date = safeDate(value);

  if (!date) return "No activity recorded yet";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getLatestTimestamp = (data, keys = []) => {
  for (const key of keys) {
    if (data?.[key]) return data[key];
  }

  return null;
};

const getFeatureCount = (data, keys) =>
  keys.reduce((sum, key) => sum + (Number(data?.[key]) || 0), 0);

const toDateKey = (value) => {
  const date = safeDate(value);
  if (!date) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getHistorySource = (raw = {}) =>
  raw?.dailyActivity ??
  raw?.dailyHistory ??
  raw?.activityHistory ??
  raw?.monthlyActivity ??
  null;

const getHistoryEntries = (raw = {}) => {
  const history = getHistorySource(raw);
  if (!history) return [];

  if (Array.isArray(history)) {
    return history
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const dateValue =
          entry.date ??
          entry.day ??
          entry.timestamp ??
          entry.at ??
          entry.key ??
          entry.month;
        const date = safeDate(dateValue);
        const value =
          Number(
            entry.count ??
              entry.value ??
              entry.generations ??
              entry.generateCount ??
              0
          ) || 0;

        if (!date || !Number.isFinite(value)) return null;
        return { date, value };
      })
      .filter(Boolean);
  }

  if (typeof history === "object") {
    return Object.entries(history)
      .map(([key, value]) => {
        const date = safeDate(
          value && typeof value === "object"
            ? value.date ?? value.day ?? value.timestamp ?? key
            : key
        );
        const count =
          Number(
            value && typeof value === "object"
              ? value.count ??
                  value.value ??
                  value.generations ??
                  value.generateCount ??
                  0
              : value
          ) || 0;

        if (!date) return null;
        return { date, value: count };
      })
      .filter(Boolean);
  }

  return [];
};

const getTrendFromHistory = (raw) => {
  const entries = getHistoryEntries(raw);
  if (!entries.length) return null;

  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setHours(0, 0, 0, 0);
  currentStart.setDate(currentStart.getDate() - 29);

  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - 30);

  const current = entries
    .filter(({ date }) => date >= currentStart && date <= now)
    .reduce((sum, item) => sum + item.value, 0);
  const previous = entries
    .filter(
      ({ date }) =>
        date >= previousStart && date < currentStart
    )
    .reduce((sum, item) => sum + item.value, 0);

  if (current === 0 && previous === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : 0;

  return Math.round(((current - previous) / previous) * 100);
};

const getAggregateTrendFromHistory = (featureStats = {}) => {
  let current = 0;
  let previous = 0;
  let hasHistory = false;

  FEATURE_IDS.forEach((featureId) => {
    const entries = getHistoryEntries(featureStats[featureId] || {});
    if (!entries.length) return;
    hasHistory = true;

    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setHours(0, 0, 0, 0);
    currentStart.setDate(currentStart.getDate() - 29);

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 30);

    entries.forEach(({ date, value }) => {
      if (date >= currentStart && date <= now) current += value;
      else if (date >= previousStart && date < currentStart) previous += value;
    });
  });

  if (!hasHistory) return null;
  if (current === 0 && previous === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/* =========================================================
   PREMIUM COLOR SYSTEM
========================================================= */

const colorMap = {
  violet: {
    icon: "border-violet-400/15 bg-violet-500/[0.08] text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]",
    glow: "bg-violet-500/15",
    line: "from-violet-500 to-purple-500",
    ring: "border-violet-400/20",
  },
  blue: {
    icon: "border-violet-400/15 bg-violet-500/[0.08] text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]",
    glow: "bg-violet-500/15",
    line: "from-violet-500 to-purple-500",
    ring: "border-violet-400/20",
  },
  fuchsia: {
    icon: "border-violet-400/15 bg-violet-500/[0.08] text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]",
    glow: "bg-violet-500/15",
    line: "from-violet-500 to-purple-500",
    ring: "border-violet-400/20",
  },
  amber: {
    icon: "border-violet-400/15 bg-violet-500/[0.08] text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]",
    glow: "bg-violet-500/15",
    line: "from-violet-500 to-purple-500",
    ring: "border-violet-400/20",
  },
  purple: {
    icon: "border-violet-400/15 bg-violet-500/[0.08] text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]",
    glow: "bg-violet-500/15",
    line: "from-violet-500 to-purple-500",
    ring: "border-violet-400/20",
  },
};

/* =========================================================
   GLASS CARD
========================================================= */

function GlassCard({
  children,
  className = "",
  hover = true,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        group relative overflow-hidden
        rounded-[22px]
        border border-white/[0.07]
        bg-[#070c1d]/90
        shadow-[0_20px_70px_rgba(0,0,0,0.24),0_0_45px_rgba(124,58,237,0.10)]
        backdrop-blur-xl
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  trend,
  accent = "violet",
  delay = 0,
}) {
  const styles = colorMap[accent] || colorMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        scale: 1.015,
        borderColor: "rgba(167,139,250,0.24)",
        boxShadow:
          "0 18px 55px rgba(0,0,0,0.25), 0 0 34px rgba(124,58,237,0.16)",
      }}
      whileTap={{ scale: 0.99 }}
      className="
        group relative overflow-hidden
        rounded-2xl
        border border-white/[0.07]
        bg-[#0a1024]/90
        p-4 sm:p-5
        shadow-[0_12px_40px_rgba(0,0,0,0.18),0_0_28px_rgba(124,58,237,0.10)]
        transition-[border-color,box-shadow] duration-300
      "
    >
      <motion.div
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-br from-violet-500/[0.08] via-transparent to-blue-500/[0.02]
          opacity-0 group-hover:opacity-100
        "
        transition={{ duration: 0.3 }}
      />

      <div className="relative flex items-start gap-3">
        <motion.div
          whileHover={{ scale: 1.08, rotate: accent === "amber" ? -4 : 4 }}
          className={`
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-xl border ${styles.icon}
            drop-shadow-[0_0_12px_rgba(139,92,246,0.55)]
          `}
        >
          {icon}
        </motion.div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex min-h-5 items-center text-xs">
        {typeof trend === "number" ? (
          <motion.span
            key={`${label}-${trend}`}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="font-semibold text-emerald-400 drop-shadow-[0_0_9px_rgba(52,211,153,0.42)]"
          >
            {trend > 0 ? "+" : ""}{trend}%
            <span className="ml-1.5 font-medium text-slate-500">
              from last 30 days
            </span>
          </motion.span>
        ) : (
          <span className="font-semibold text-emerald-400 drop-shadow-[0_0_9px_rgba(52,211,153,0.42)]">
            Live
            <span className="ml-1.5 font-medium text-slate-500">
              synced from Firebase
            </span>
          </span>
        )}
      </div>
    </motion.div>
  );
}


/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  icon,
  label,
  value,
  good = true,
}) {
  return (
    <motion.div
      whileHover={{
        x: 5,
        backgroundColor: "rgba(255,255,255,0.035)",
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        flex items-center justify-between gap-4
        rounded-xl
        border border-white/[0.055]
        bg-white/[0.018]
        px-4 py-3.5
        transition-colors
        hover:border-white/[0.11]
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]">
          {icon}
        </span>

        <span className="truncate text-sm text-slate-200">
          {label}
        </span>
      </div>

      <span
        className={`
          shrink-0 rounded-lg border
          px-2.5 py-1
          text-[11px] font-semibold
          ${
            good
              ? "border-emerald-400/15 bg-emerald-500/[0.08] text-emerald-300"
              : "border-slate-400/10 bg-slate-500/[0.06] text-slate-400"
          }
        `}
      >
        {value}
      </span>
    </motion.div>
  );
}

/* =========================================================
   ACTIVITY CHART
========================================================= */

function ActivityChart({
  totalGenerations,
  featureStats,
}) {
  const [range, setRange] = useState("week");
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  const rangeOptions = [
    { value: "week", label: "This Week", sublabel: "Last 7 days" },
    { value: "month", label: "This Month", sublabel: "Last 30 days" },
    { value: "year", label: "This Year", sublabel: "Last 12 months" },
  ];

  const selectedRange =
    rangeOptions.find((option) => option.value === range) ||
    rangeOptions[0];

  const now = new Date();

  const dailyHistoryEntries = useMemo(() => {
    const entries = [];

    FEATURE_IDS.forEach((featureId) => {
      const raw = featureStats[featureId] || {};

      // Prefer the real daily history that is now written by every generator.
      const history =
        raw?.dailyActivity ??
        raw?.dailyHistory ??
        raw?.activityHistory ??
        null;

      if (!history) return;

      if (Array.isArray(history)) {
        history.forEach((entry) => {
          if (!entry || typeof entry !== "object") return;

          const dateValue =
            entry.date ??
            entry.day ??
            entry.timestamp ??
            entry.at ??
            entry.key;

          const date = safeDate(dateValue);

          const value =
            Number(
              entry.count ??
                entry.value ??
                entry.generations ??
                entry.generateCount ??
                0
            ) || 0;

          if (date && value > 0) {
            entries.push({ date, value });
          }
        });

        return;
      }

      if (typeof history === "object") {
        Object.entries(history).forEach(([key, rawValue]) => {
          const date =
            rawValue &&
            typeof rawValue === "object"
              ? safeDate(
                  rawValue.date ??
                    rawValue.day ??
                    rawValue.timestamp ??
                    key
                )
              : safeDate(key);

          const value =
            rawValue &&
            typeof rawValue === "object"
              ? Number(
                  rawValue.count ??
                    rawValue.value ??
                    rawValue.generations ??
                    rawValue.generateCount ??
                    0
                ) || 0
              : Number(rawValue) || 0;

          if (date && value > 0) {
            entries.push({ date, value });
          }
        });
      }
    });

    return entries;
  }, [featureStats]);

  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfToday = new Date(today);

    const addDailyValue = (bucket, date, value) => {
      if (!bucket || !date) return;

      const sameDay =
        bucket.key === toDateKey(date);

      if (sameDay) {
        bucket.value += value;
      }
    };

    if (range === "year") {
      // Last 12 calendar months including the current month.
      const months = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(
          today.getFullYear(),
          today.getMonth() - (11 - index),
          1
        );

        return {
          key: `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`,
          date,
          label: date.toLocaleDateString("en-US", {
            month: "short",
          }),
          fullLabel: date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          value: 0,
        };
      });

      dailyHistoryEntries.forEach(({ date, value }) => {
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const bucket = months.find(
          (item) => item.key === key
        );

        if (bucket) {
          bucket.value += value;
        }
      });

      return {
        points: months,
        hasHistory: months.some(
          (item) => item.value > 0
        ),
        axisMode: "month",
        total: months.reduce(
          (sum, item) => sum + item.value,
          0
        ),
      };
    }

    const numberOfDays =
      range === "week" ? 7 : 30;

    const points = Array.from(
      { length: numberOfDays },
      (_, index) => {
        const date = new Date(startOfToday);

        date.setDate(
          date.getDate() -
            (numberOfDays - 1 - index)
        );

        return {
          key: toDateKey(date),
          date,
          label: date.toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          ),
          fullLabel: date.toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }
          ),
          value: 0,
        };
      }
    );

    dailyHistoryEntries.forEach(
      ({ date, value }) => {
        const bucket = points.find(
          (item) =>
            item.key === toDateKey(date)
        );

        addDailyValue(
          bucket,
          date,
          value
        );
      }
    );

    return {
      points,
      hasHistory: points.some(
        (item) => item.value > 0
      ),
      axisMode: "day",
      total: points.reduce(
        (sum, item) => sum + item.value,
        0
      ),
    };
  }, [dailyHistoryEntries, range]);

  const width = 980;
  const height = 300;
  const padding = {
    top: 28,
    right: 24,
    bottom: 48,
    left: 64,
  };

  const innerWidth =
    width -
    padding.left -
    padding.right;

  const innerHeight =
    height -
    padding.top -
    padding.bottom;

  const maxValue = Math.max(
    ...chartData.points.map(
      (item) => item.value
    ),
    1
  );

  // Always keep a readable Y axis with four useful steps.
  const yStep = Math.max(
    1,
    Math.ceil(maxValue / 4)
  );

  const yMax = Math.max(
    yStep * 4,
    4
  );

  const points = chartData.points.map(
    (item, index) => {
      const x =
        padding.left +
        (index * innerWidth) /
          Math.max(
            chartData.points.length - 1,
            1
          );

      const y =
        padding.top +
        innerHeight -
        (item.value / yMax) *
          innerHeight;

      return {
        ...item,
        x,
        y,
      };
    }
  );

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(
          2
        )} ${point.y.toFixed(2)}`
    )
    .join(" ");

  const areaPath = `
    ${linePath}
    L ${points[points.length - 1]?.x ?? padding.left}
      ${padding.top + innerHeight}
    L ${points[0]?.x ?? padding.left}
      ${padding.top + innerHeight}
    Z
  `;

  const visibleLabels = points.filter(
    (_, index) => {
      if (range === "week") {
        return true;
      }

      if (range === "month") {
        return (
          index % 5 === 0 ||
          index === points.length - 1
        );
      }

      // Year: show each month.
      return true;
    }
  );

  return (
    <GlassCard
      className="mt-5 p-5 sm:p-6"
      hover={false}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]">
            Performance
          </p>

          <h3 className="mt-1 text-xl font-semibold text-white">
            Activity Overview
          </h3>

          <p className="mt-1 max-w-xl text-sm text-slate-400">
            {chartData.hasHistory
              ? `Real AI generation activity — ${selectedRange.sublabel.toLowerCase()}.`
              : "Your daily generation history will appear here as soon as a generator records activity."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Premium range selector */}
          <div className="relative z-40">
            <button
              type="button"
              onClick={() =>
                setIsRangeOpen(
                  (current) => !current
                )
              }
              onBlur={() => {
                window.setTimeout(
                  () =>
                    setIsRangeOpen(false),
                  120
                );
              }}
              className="
                group flex min-w-[178px] items-center justify-between
                gap-4 rounded-2xl border border-violet-400/15
                bg-[#0a1024]/95 px-3.5 py-2.5
                text-left shadow-[0_10px_35px_rgba(0,0,0,0.22),0_0_24px_rgba(124,58,237,0.08)]
                backdrop-blur-xl outline-none transition-all duration-300
                hover:border-violet-300/30 hover:bg-[#0d1430]
                focus:border-violet-300/35 focus:ring-2 focus:ring-violet-400/10
              "
              aria-haspopup="listbox"
              aria-expanded={isRangeOpen}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="
                  flex h-8 w-8 shrink-0 items-center justify-center
                  rounded-xl border border-violet-400/15
                  bg-gradient-to-br from-violet-500/15 to-blue-500/10
                  text-violet-200
                  shadow-[0_0_22px_rgba(124,58,237,0.15)]
                ">
                  <CalendarDays className="h-4 w-4" />
                </span>

                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200/70">
                    Range
                  </span>

                  <span className="block truncate text-xs font-semibold text-white">
                    {selectedRange.label}
                  </span>
                </span>
              </span>

              <motion.span
                animate={{
                  rotate: isRangeOpen ? 180 : 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="shrink-0 text-slate-500 group-hover:text-violet-200"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isRangeOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 6,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -4,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  className="
                    absolute right-0 top-full mt-1 w-[230px]
                    overflow-hidden rounded-2xl border border-white/[0.08]
                    bg-[#080d1f]/98 p-1.5
                    shadow-[0_25px_70px_rgba(0,0,0,0.48),0_0_34px_rgba(124,58,237,0.12)]
                    backdrop-blur-2xl
                  "
                  role="listbox"
                >
                  <div className="px-2.5 pb-1.5 pt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Activity period
                  </div>

                  {rangeOptions.map(
                    (option) => {
                      const active =
                        option.value ===
                        range;

                      return (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          role="option"
                          aria-selected={
                            active
                          }
                          onMouseDown={(
                            event
                          ) =>
                            event.preventDefault()
                          }
                          onClick={() => {
                            setRange(
                              option.value
                            );
                            setIsRangeOpen(
                              false
                            );
                          }}
                          className={`
                            group/item relative flex w-full items-center
                            justify-between gap-3 rounded-xl px-3 py-2.5
                            text-left transition-all duration-200
                            ${
                              active
                                ? "bg-violet-500/[0.11] text-white"
                                : "text-slate-400 hover:bg-white/[0.035] hover:text-white"
                            }
                          `}
                        >
                          <span>
                            <span className="block text-xs font-semibold">
                              {
                                option.label
                              }
                            </span>

                            <span
                              className={`
                                mt-0.5 block text-[10px]
                                ${
                                  active
                                    ? "text-violet-200/65"
                                    : "text-slate-600"
                                }
                              `}
                            >
                              {
                                option.sublabel
                              }
                            </span>
                          </span>

                          {active && (
                            <span className="
                              flex h-6 w-6 items-center justify-center
                              rounded-lg border border-violet-300/15
                              bg-violet-500/15 text-violet-200
                              shadow-[0_0_18px_rgba(124,58,237,0.18)]
                            ">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            key={`${range}-${chartData.total}`}
            initial={{
              opacity: 0,
              y: 5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            whileHover={{
              scale: 1.03,
              borderColor:
                "rgba(139,92,246,0.42)",
            }}
            className="
              flex items-center gap-2 rounded-2xl
              border border-violet-400/15
              bg-gradient-to-br from-violet-500/[0.08]
              to-blue-500/[0.03]
              px-3.5 py-2.5 text-xs text-slate-400
              shadow-[0_0_30px_rgba(124,58,237,0.10)]
            "
          >
            <span>
              {selectedRange.label} total
            </span>

            <span className="font-semibold text-white">
              {formatNumber(
                chartData.total
              )}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[760px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[300px] w-full overflow-visible"
            role="img"
            aria-label={`AI generation activity for ${selectedRange.label}`}
          >
            {[0, 1, 2, 3, 4].map(
              (tickIndex) => {
                const value =
                  yMax -
                  yStep * tickIndex;

                const y =
                  padding.top +
                  (innerHeight / 4) *
                    tickIndex;

                return (
                  <g key={value}>
                    <line
                      x1={padding.left}
                      x2={
                        width -
                        padding.right
                      }
                      y1={y}
                      y2={y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="4 7"
                    />

                    <text
                      x={
                        padding.left - 10
                      }
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="rgba(148,163,184,0.75)"
                    >
                      {formatNumber(
                        value
                      )}
                    </text>
                  </g>
                );
              }
            )}

            <defs>
              <linearGradient
                id="profileArea"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="rgba(168,85,247,0.42)"
                />

                <stop
                  offset="100%"
                  stopColor="rgba(59,130,246,0.02)"
                />
              </linearGradient>

              <linearGradient
                id="profileLine"
                x1="0"
                x2="1"
                y1="0"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#7c3aed"
                />

                <stop
                  offset="50%"
                  stopColor="#d946ef"
                />

                <stop
                  offset="100%"
                  stopColor="#3b82f6"
                />
              </linearGradient>

              <filter id="profileGlow">
                <feGaussianBlur
                  stdDeviation="6"
                  result="blur"
                />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {chartData.hasHistory && (
              <path
                d={areaPath}
                fill="url(#profileArea)"
              />
            )}

            {chartData.hasHistory ? (
              <motion.path
                key={`${range}-${chartData.points
                  .map(
                    (point) =>
                      `${point.key}:${point.value}`
                  )
                  .join("|")}`}
                d={linePath}
                fill="none"
                stroke="url(#profileLine)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#profileGlow)"
                initial={{
                  pathLength: 0,
                  opacity: 0,
                }}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                }}
              />
            ) : (
              <line
                x1={padding.left}
                x2={
                  width -
                  padding.right
                }
                y1={
                  padding.top +
                  innerHeight
                }
                y2={
                  padding.top +
                  innerHeight
                }
                stroke="rgba(168,85,247,0.22)"
                strokeWidth="2"
                strokeDasharray="6 8"
              />
            )}

            {chartData.hasHistory &&
              points.map(
                (point, index) => (
                  <motion.g
                    key={`${point.key}-${point.value}-${index}`}
                    initial={{
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay:
                        0.35 +
                        index * 0.018,
                      duration: 0.2,
                    }}
                    style={{
                      transformOrigin: `${point.x}px ${point.y}px`,
                    }}
                  >
                    <title>
                      {point.fullLabel}:{" "}
                      {formatNumber(
                        point.value
                      )}{" "}
                      generations
                    </title>

                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r={
                        point.value > 0
                          ? 4.8
                          : 3
                      }
                      fill="#090f24"
                      stroke={
                        point.value > 0
                          ? "#d8b4fe"
                          : "#6b7280"
                      }
                      strokeWidth="2.4"
                      whileHover={{
                        r: 8,
                      }}
                    />
                  </motion.g>
                )
              )}
          </svg>

          <div className="mt-2 flex justify-between gap-1 px-1 text-[10px] text-slate-500">
            {visibleLabels.map(
              (point) => (
                <span
                  key={`${point.key}-${point.label}`}
                  className="min-w-0 flex-1 text-center"
                  title={
                    point.fullLabel
                  }
                >
                  {point.label}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* =========================================================
   RECENT ACTIVITY ROW
   Same visual direction as the supplied screenshot.
========================================================= */

function RecentActivityRow({
  feature,
  count,
  lastUsed,
  onViewAll,
  delay = 0,
  index,
}) {
  const Icon = feature.icon;
  const styles =
    colorMap[feature.color] ||
    colorMap.violet;

  const actionLabel =
    count > 0
      ? `${formatNumber(count)} ${count === 1 ? "activity" : "activities"}`
      : "No activity yet";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        x: 5,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }}
      className="
        group relative
        flex min-h-[74px]
        items-center
        gap-4
        overflow-hidden
        border-b border-white/[0.045]
        px-4 py-3.5
        last:border-b-0
        sm:px-5
      "
    >
      {/* Row hover background */}
      <motion.div
        className="
          pointer-events-none absolute
          inset-0
          bg-gradient-to-r
          from-violet-500/[0.045]
          via-purple-500/[0.025]
          to-transparent
          opacity-0
          group-hover:opacity-100
        "
        transition={{
          duration: 0.25,
        }}
      />

      {/* Animated left light */}
      <motion.div
        className={`
          pointer-events-none
          absolute left-0 top-1/2
          h-10 w-1
          -translate-y-1/2
          rounded-r-full
          blur-[3px]
          opacity-0
          group-hover:opacity-100
          ${styles.glow}
        `}
        transition={{
          duration: 0.25,
        }}
      />

      {/* Icon */}
      <motion.div
        whileHover={{
          scale: 1.08,
          rotate: index % 2 === 0 ? -4 : 4,
        }}
        className={`
          relative z-10
          flex h-11 w-11
          shrink-0
          items-center justify-center
          rounded-xl
          border
          ${styles.icon}
          shadow-[0_0_24px_rgba(124,58,237,0.06)]
        `}
      >
        <Icon className="h-[18px] w-[18px]" />

        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-slate-200">
            Used
          </span>

          <span className="text-sm font-semibold text-violet-300 transition-colors duration-300 group-hover:text-purple-200">
            {feature.title}
          </span>

          <span className="hidden text-sm text-slate-500 sm:inline">
            — {feature.description}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11px] text-slate-600">
            {actionLabel}
          </span>

          <span className="h-1 w-1 rounded-full bg-slate-700" />

          <span className="text-[11px] text-slate-600">
            {feature.short}
          </span>
        </div>
      </div>

      {/* Time */}
      <div className="relative z-10 shrink-0 text-right">
        <p className="text-xs font-medium text-slate-400 transition-colors duration-300 group-hover:text-slate-200">
          {relativeTime(lastUsed)}
        </p>

        <p className="mt-1 hidden text-[10px] text-slate-700 lg:block">
          {fullDate(lastUsed)}
        </p>
      </div>

      {/* View all */}
      <motion.button
        type="button"
        onClick={onViewAll}
        whileHover={{
          scale: 1.05,
        }}
        whileTap={{
          scale: 0.96,
        }}
        className="
          relative z-10
          hidden
          h-9 w-9
          items-center justify-center
          rounded-lg
          border border-white/[0.06]
          bg-white/[0.02]
          text-slate-500
          transition-all duration-300
          hover:border-violet-400/25
          hover:bg-violet-500/[0.08]
          hover:text-violet-300
          sm:flex
        "
        title={`View ${feature.title}`}
      >
        <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
      </motion.button>
    </motion.div>
  );
}

/* =========================================================
   LOGIN CARD
========================================================= */

function LoginCard({
  onLogin,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030b] px-5 text-white">
      {/* Background lights */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="
            absolute left-1/2 top-1/2
            h-[680px] w-[680px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-violet-600/[0.12]
            blur-[150px]
          "
          animate={{
            scale: [1, 1.16, 1],
            opacity: [0.55, 0.85, 0.55],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="
            absolute -left-24 top-20
            h-80 w-80
            rounded-full
            bg-blue-600/[0.08]
            blur-[120px]
          "
          animate={{
            x: [0, 45, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="
            absolute -right-24 bottom-10
            h-96 w-96
            rounded-full
            bg-fuchsia-600/[0.08]
            blur-[130px]
          "
          animate={{
            x: [0, -35, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.065]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
        />

        {/* Moving light */}
        <motion.div
          className="
            absolute -left-[20%] top-[35%]
            h-px w-[45%]
            bg-gradient-to-r
            from-transparent
            via-violet-400/50
            to-transparent
            blur-[1px]
          "
          animate={{
            x: ["0vw", "145vw"],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center py-10">
        <motion.div
          initial={{
            opacity: 0,
            y: 28,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            y: -7,
            transition: {
              duration: 0.35,
            },
          }}
          className="
            relative w-full max-w-xl
            overflow-hidden
            rounded-[30px]
            border border-white/[0.10]
            bg-[#080d20]/95
            p-[1px]
            shadow-[0_45px_150px_rgba(0,0,0,0.65)]
            backdrop-blur-2xl
          "
        >
          {/* Animated outer gradient */}
          <motion.div
            className="
              absolute -inset-[2px]
              rounded-[31px]
              bg-[conic-gradient(from_0deg,rgba(139,92,246,0.0),rgba(139,92,246,0.7),rgba(59,130,246,0.65),rgba(217,70,239,0.5),rgba(139,92,246,0.0))]
            "
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <div className="relative rounded-[29px] bg-[#080c1d]/95 p-8 text-center sm:p-10">
            {/* Top shine */}
            <motion.div
              className="
                pointer-events-none
                absolute left-[-35%] top-0
                h-px w-[70%]
                bg-gradient-to-r
                from-transparent
                via-white/50
                to-transparent
              "
              animate={{
                left: ["-35%", "135%"],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
            />

            {/* Avatar */}
            <motion.div
              animate={{
                y: [0, -6, 0],
                rotate: [0, 1.5, 0, -1.5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                relative mx-auto mb-6
                flex h-20 w-20
                items-center justify-center
                rounded-[24px]
                border border-violet-400/25
                bg-gradient-to-br
                from-violet-500/[0.15]
                to-blue-500/[0.06]
                shadow-[0_0_60px_rgba(124,58,237,0.25)]
              "
            >
              <CircleUserRound
                className="h-8 w-8 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.85)] sm:h-9 sm:w-9 md:h-10 md:w-10"
                strokeWidth={1.8}
              />
              <motion.div
                className="absolute inset-0 rounded-[24px] border border-violet-300/20"
                animate={{
                  scale: [1, 1.13, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
              />
            </motion.div>

            <div className="
              mx-auto mb-4
              inline-flex items-center gap-2
              rounded-full
              border border-white/[0.08]
              bg-white/[0.025]
              px-3 py-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.17em]
              text-slate-500
            ">
              <Sparkles className="h-3.5 w-3.5 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              Personal Workspace
            </div>

            <h1 className="
              text-3xl font-semibold
              tracking-tight
              sm:text-4xl
            ">
              <span className="bg-gradient-to-r from-white via-violet-100 to-blue-200 bg-clip-text text-transparent">
                Your profile is waiting
              </span>
            </h1>

            <p className="
              mx-auto mt-3
              max-w-md
              text-sm leading-6
              text-slate-500
              sm:text-base
            ">
              Sign in to access your profile, real
              generation statistics, activity timeline,
              and account controls.
            </p>

            <motion.button
              type="button"
              onClick={onLogin}
              whileHover={{
                scale: 1.015,
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
                group relative mt-8
                inline-flex w-full
                items-center justify-center
                gap-2
                overflow-hidden
                rounded-2xl
                bg-gradient-to-r
                from-violet-600
                via-purple-600
                to-blue-600
                px-5 py-3.5
                text-sm font-semibold
                text-white
                shadow-[0_15px_45px_rgba(99,102,241,0.30)]
                transition-all duration-300
                hover:shadow-[0_20px_60px_rgba(99,102,241,0.42)]
              "
            >
              <motion.span
                className="
                  absolute inset-y-0
                  -left-[35%]
                  w-[30%]
                  skew-x-[-20deg]
                  bg-white/20
                  blur-md
                "
                animate={{
                  left: ["-35%", "135%"],
                }}
                transition={{
                  duration: 2.7,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />

              <span className="relative z-10">
                Go to Login
              </span>

              <LogOut className="relative z-10 h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>

            <div className="
              mt-5 flex items-center
              justify-center gap-2
              text-[11px] text-slate-600
            ">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              Secure Firebase authentication
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================
   VIEW ALL MODAL
========================================================= */

function ViewAllModal({
  feature,
  count,
  lastUsed,
  onClose,
}) {
  if (!feature) return null;

  const Icon = feature.icon;

  const styles =
    colorMap[feature.color] ||
    colorMap.violet;

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        className="
          fixed inset-0 z-[80]
          flex items-center justify-center
          bg-black/70 px-4
          backdrop-blur-xl
        "
        onClick={onClose}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 22,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 12,
            scale: 0.97,
          }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          onClick={(event) =>
            event.stopPropagation()
          }
          className="
            relative w-full max-w-2xl
            overflow-hidden
            rounded-[28px]
            border border-white/[0.09]
            bg-[#080d1f]
            shadow-[0_40px_140px_rgba(0,0,0,0.65)]
          "
        >
          <motion.div
            className="
              absolute inset-x-0 top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-violet-300/60
              to-transparent
            "
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          <div className="
            flex items-center
            justify-between gap-4
            border-b border-white/[0.06]
            px-5 py-4
            sm:px-6
          ">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{
                  rotate: -6,
                  scale: 1.06,
                }}
                className={`
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl
                  border
                  ${styles.icon}
                `}
              >
                <Icon className="h-5 w-5 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              </motion.div>

              <div>
                <p className="text-base font-semibold text-white">
                  {feature.title}
                </p>

                <p className="text-xs text-slate-500">
                  Complete feature overview
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{
                rotate: 90,
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.9,
              }}
              className="
                rounded-xl
                border border-white/[0.06]
                bg-white/[0.02]
                p-2
                text-slate-500
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              <X className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
            </motion.button>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Total Generates",
                  value: formatNumber(count),
                },
                {
                  label: "Last Used",
                  value: relativeTime(lastUsed),
                },
                {
                  label: "Timestamp",
                  value: fullDate(lastUsed),
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.07,
                  }}
                  whileHover={{
                    y: -3,
                    borderColor:
                      "rgba(139,92,246,0.20)",
                  }}
                  className="
                    rounded-2xl
                    border border-white/[0.06]
                    bg-white/[0.018]
                    p-4
                  "
                >
                  <span className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  ">
                    {item.label}
                  </span>

                  <p className="
                    mt-1
                    text-lg font-semibold
                    text-white
                  ">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="
              rounded-2xl
              border border-violet-500/10
              bg-gradient-to-br
              from-violet-500/[0.06]
              to-blue-500/[0.03]
              p-5
            ">
              <p className="text-sm font-semibold text-white">
                About this feature
              </p>

              <p className="
                mt-2
                text-sm leading-6
                text-slate-500
              ">
                {feature.description}
              </p>

              <div className="
                mt-4 flex items-center
                gap-2 text-xs text-slate-500
              ">
                <Check className="h-4 w-4 text-emerald-400" />

                Statistics are read directly from
                your Firebase feature document.
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   PROFILE
========================================================= */

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [featureStats, setFeatureStats] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [imageBusy, setImageBusy] =
    useState(false);

  const [removingImage, setRemovingImage] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [toast, setToast] =
    useState("");

  const [selectedFeature, setSelectedFeature] =
    useState(null);

  const [showAllActivity, setShowAllActivity] =
    useState(false);

  const [locationBusy, setLocationBusy] =
    useState(false);

  const locationBusyRef = useRef(false);
  const locationAttemptedRef = useRef(false);

  /* =======================================================
     AUTH
  ======================================================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);

          if (!currentUser) {
            setProfile(null);
            setFeatureStats({});
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  const detectAndSaveLocation = useCallback(async (force = false) => {
    if (!user || locationBusyRef.current) return;
    if (!force && locationAttemptedRef.current) return;

    locationAttemptedRef.current = true;

    if (!navigator.geolocation) {
      setToast(
        "Location is not supported by this browser."
      );
      return;
    }

    locationBusyRef.current = true;
    setLocationBusy(true);

    try {
      const position = await new Promise(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 12000,
              maximumAge: 300000,
            }
          );
        }
      );

      const latitude =
        position.coords.latitude;
      const longitude =
        position.coords.longitude;

      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
          latitude
        )}&longitude=${encodeURIComponent(
          longitude
        )}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error(
          "Could not resolve your current location."
        );
      }

      const data = await response.json();
      const city =
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        "Unknown location";
      const country =
        data.countryName || "";
      const region =
        data.principalSubdivision || "";
      const formatted = [
        city,
        country,
      ]
        .filter(Boolean)
        .join(", ");

      await setDoc(
        doc(db, "users", user.uid),
        {
          location: formatted,
          locationData: {
            latitude,
            longitude,
            city,
            region,
            country,
            countryCode:
              data.countryCode || "",
            detectedAt:
              new Date().toISOString(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setToast(
        formatted
          ? `Location updated to ${formatted}.`
          : "Location updated successfully."
      );
    } catch (error) {
      console.error(
        "Location detection error:",
        error
      );

      if (error?.code === 1) {
        setToast(
          "Location permission was denied. You can allow it and try again."
        );
      } else {
        setToast(
          error?.message ||
            "Could not detect your location right now."
        );
      }
    } finally {
      locationBusyRef.current = false;
      setLocationBusy(false);
    }
  }, [user]);

  useEffect(() => {
    if (
      !user ||
      profile === null ||
      profile?.location
    ) {
      return;
    }

    detectAndSaveLocation();
  }, [
    user,
    profile,
    detectAndSaveLocation,
  ]);

  /* =======================================================
     PROFILE DOCUMENT
  ======================================================= */

  useEffect(() => {
    if (!user) return undefined;

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        setProfile(
          snapshot.exists()
            ? snapshot.data()
            : null
        );

        setLoading(false);
      },
      (error) => {
        console.error(
          "Failed to load profile:",
          error
        );

        setLoading(false);
        setToast(
          "Could not load your profile."
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  /* =======================================================
     FEATURE DOCUMENTS
  ======================================================= */

  useEffect(() => {
    if (!user) return undefined;

    const unsubscribers =
      FEATURE_IDS.map((featureId) =>
        onSnapshot(
          doc(
            db,
            "users",
            user.uid,
            "features",
            featureId
          ),
          (snapshot) => {
            setFeatureStats(
              (previous) => ({
                ...previous,
                [featureId]:
                  snapshot.exists()
                    ? snapshot.data()
                    : {},
              })
            );
          },
          (error) => {
            console.error(
              `Failed to load ${featureId} stats:`,
              error
            );
          }
        )
      );

    return () =>
      unsubscribers.forEach(
        (unsubscribe) => unsubscribe()
      );
  }, [user]);

  /* =======================================================
     TOAST
  ======================================================= */

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(
      () => setToast(""),
      2800
    );

    return () =>
      window.clearTimeout(timer);
  }, [toast]);

  /* =======================================================
     AUTH REFRESH
  ======================================================= */

  useEffect(() => {
    const refresh = () => {
      if (auth.currentUser) {
        auth.currentUser
          .reload()
          .catch(() => {});
      }
    };

    window.addEventListener(
      "focus",
      refresh
    );

    return () =>
      window.removeEventListener(
        "focus",
        refresh
      );
  }, []);

  /* =======================================================
     CLOUDINARY UPLOAD
  ======================================================= */

  const uploadProfileImage = async (
    file
  ) => {
    if (!user || !file) return "";

    if (!file.type.startsWith("image/")) {
      throw new Error(
        "Please select a valid image file."
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        "Profile image must be 5MB or smaller."
      );
    }

    const cloudName =
      import.meta.env
        .VITE_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      import.meta.env
        .VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary is not configured. Check your VITE_CLOUDINARY_* environment variables."
      );
    }

    const body = new FormData();

    body.append("file", file);
    body.append(
      "upload_preset",
      uploadPreset
    );

    body.append(
      "folder",
      `techook/users/${user.uid}`
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error?.message ||
          "Failed to upload profile image."
      );
    }

    return result.secure_url || "";
  };

  /* =======================================================
     CHANGE PHOTO
  ======================================================= */

  const handleChangePhoto = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file || !user) return;

    setImageBusy(true);

    try {
      const imageUrl =
        await uploadProfileImage(file);

      await setDoc(
        doc(db, "users", user.uid),
        {
          profileImage: imageUrl,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setToast(
        "Profile photo updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile image update error:",
        error
      );

      setToast(
        error?.message ||
          "Could not update profile photo."
      );
    } finally {
      setImageBusy(false);
    }
  };

  /* =======================================================
     REMOVE PHOTO
  ======================================================= */

  const handleRemovePhoto = async () => {
    if (
      !user ||
      !profile?.profileImage ||
      removingImage
    ) {
      return;
    }

    setRemovingImage(true);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          profileImage: "",
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setToast(
        "Profile photo removed."
      );
    } catch (error) {
      console.error(
        "Profile image removal error:",
        error
      );

      setToast(
        "Could not remove profile photo."
      );
    } finally {
      setRemovingImage(false);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await signOut(auth);

      /*
        Requested route:
        SignUpLogin/
      */
      navigate("/SignUpLogin/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setToast(
        error?.message ||
          "Could not log out."
      );

      setLoggingOut(false);
    }
  };

  /* =======================================================
     NORMALIZED STATS
  ======================================================= */

  const stats = useMemo(() => {
    const normalized = {};

    FEATURE_IDS.forEach(
      (featureId) => {
        const config =
          FEATURE_CONFIG[featureId];

        normalized[featureId] = {
          count: getFeatureCount(
            featureStats[featureId],
            config.countKeys
          ),

          lastUsed:
            getLatestTimestamp(
              featureStats[featureId],
              config.dateKeys
            ),

          raw:
            featureStats[featureId] ||
            {},
        };
      }
    );

    return normalized;
  }, [featureStats]);

  /* =======================================================
     MAIN STATS
  ======================================================= */

  const postsCreated =
    stats.contentGenerator?.count || 0;

  const totalGenerations =
    FEATURE_IDS.reduce(
      (sum, featureId) =>
        sum +
        (stats[featureId]?.count || 0),
      0
    );

  const ideaGenerations =
    stats.ideaGenerator?.count || 0;

  const viralGenerationCount =
    Number(
      featureStats.viralMeter
        ?.generationCount
    ) || 0;

  const viralScoreTotal =
    Number(
      featureStats.viralMeter
        ?.viralScoreTotal
    ) || 0;

  const averageViralScore =
    viralGenerationCount
      ? Math.round(
          viralScoreTotal /
            viralGenerationCount
        )
      : 0;

  /* =======================================================
     USER DATA
  ======================================================= */

  const emailVerified = Boolean(
    user?.emailVerified
  );

  const twoFactorEnabled = Boolean(
    user &&
      multiFactor(user)
        .enrolledFactors?.length
  );

  const displayName =
    profile?.username?.trim() ||
    user?.displayName?.trim() ||
    "Techook User";

  const displayBio =
    profile?.bio?.trim() ||
    "Create smarter content with AI and build your audience faster.";

  const joinedDate =
    formatJoinedDate(
      profile?.createdAt
    );

  const displayLocation =
    profile?.location?.trim() ||
    profile?.locationData?.city ||
    "Detecting location...";

  /* =======================================================
     LOGIN SCREEN
  ======================================================= */

  if (!user && !loading) {
    return (
      <LoginCard
        onLogin={() =>
          navigate("/login")
        }
      />
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="
      relative min-h-screen
      overflow-x-hidden
      bg-[#030615]
      text-white
    ">
      {/* =====================================================
          PREMIUM PAGE BACKGROUND
      ===================================================== */}

      <div className="
        pointer-events-none
        fixed inset-0
        overflow-hidden
      ">
        {/* Purple light */}
        <motion.div
          className="
            absolute
            -left-36 -top-36
            h-[520px] w-[520px]
            rounded-full
            bg-violet-700/[0.16]
            blur-[150px]
          "
          animate={{
            x: [0, 35, 0],
            y: [0, 25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Blue light */}
        <motion.div
          className="
            absolute
            right-[-180px]
            top-[13%]
            h-[600px] w-[600px]
            rounded-full
            bg-blue-700/[0.13]
            blur-[160px]
          "
          animate={{
            x: [0, -35, 0],
            y: [0, 20, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Pink light */}
        <motion.div
          className="
            absolute
            bottom-[-240px]
            left-[30%]
            h-[580px] w-[580px]
            rounded-full
            bg-fuchsia-700/[0.10]
            blur-[160px]
          "
          animate={{
            x: [0, 40, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid */}
        <div
          className="
            absolute inset-0
            opacity-[0.045]
          "
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize:
              "56px 56px",
          }}
        />

        {/* Moving horizontal glow */}
        <motion.div
          className="
            absolute left-[-30%]
            top-[42%]
            h-px
            w-[60%]
            bg-gradient-to-r
            from-transparent
            via-violet-500/25
            to-transparent
            blur-[1px]
          "
          animate={{
            x: ["0vw", "150vw"],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <main className="
        relative mx-auto
        w-full max-w-none
        px-3 py-5
        sm:px-5 sm:py-6
        md:px-6
        lg:px-8
        xl:px-10 xl:py-8
        2xl:px-12
      ">
        {/* ===================================================
            HEADER
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
          }}
          className="
            mb-5
            flex flex-col gap-4
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{
                rotate: 5,
                scale: 1.08,
              }}
              className="flex h-10 w-10 items-center justify-center"
            >
              <CircleUserRound className="h-8 w-8 text-violet-200 drop-shadow-[0_0_10px_rgba(168,85,247,0.75)]" />
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="
                  text-2xl
                  font-semibold
                  tracking-tight
                  sm:text-3xl
                  md:text-[38px]
                ">
                  <span className="
                    bg-gradient-to-r
                    from-violet-600
                    via-purple-500
                    to-blue-400
                    bg-clip-text
                    text-transparent
                    break-words
                  ">
                    {displayName} Profile
                  </span>
                </h1>

                <span className="
                  hidden
                  rounded-full
                  border border-emerald-400/10
                  bg-emerald-500/[0.06]
                  px-2 py-1
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-emerald-300
                  sm:inline-flex
                ">
                  Live
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Manage your account, view stats,
                and track your progress.
              </p>
            </div>
          </div>

          {/* Logout */}
          <motion.button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            whileHover={{
              y: -3,
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="
              group relative
              inline-flex w-full
              items-center
              justify-center
              gap-2
              overflow-hidden
              rounded-xl
              border border-red-400/15
              bg-red-500/[0.045]
              px-5 py-3
              text-sm font-semibold
              text-red-300
              transition-all duration-300
              hover:border-red-400/30
              hover:bg-red-500/[0.08]
              hover:shadow-[0_12px_40px_rgba(239,68,68,0.14)]
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            <motion.span
              className="
                absolute inset-y-0
                -left-[40%]
                w-[25%]
                skew-x-[-20deg]
                bg-white/[0.08]
              "
              animate={{
                left: [
                  "-40%",
                  "140%",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            />

            {loggingOut ? (
              <Loader2 className="relative z-10 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="
                relative z-10
                h-4 w-4
                transition-transform
                duration-300
                group-hover:-translate-x-0.5
              " />
            )}

            <span className="relative z-10">
              {loggingOut
                ? "Logging out..."
                : "Log Out"}
            </span>
          </motion.button>
        </motion.div>

        {/* ===================================================
            PROFILE + SECURITY
        =================================================== */}

        <section className="
          grid gap-5
          xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]
        ">
          {/* PROFILE CARD */}
          <GlassCard
            className="
              min-w-0 p-4 sm:p-6 lg:p-7
            "
            hover={false}
          >
            {/* Big background glow */}
            <motion.div
              className="
                pointer-events-none
                absolute
                -right-20 -top-20
                h-64 w-64
                rounded-full
                bg-violet-600/[0.12]
                blur-[95px]
              "
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.45, 0.8, 0.45],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="
                pointer-events-none
                absolute
                bottom-[-80px]
                right-[30%]
                h-48 w-48
                rounded-full
                bg-blue-600/[0.07]
                blur-[95px]
              "
              animate={{
                x: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="
              relative
              flex flex-col gap-7
              md:flex-row
              md:items-center
            ">
              {/* AVATAR */}
              <div className="
                flex shrink-0
                flex-col
                items-center
                md:items-start
              ">
                <motion.div
                  whileHover={{
                    scale: 1.025,
                  }}
                  className="relative"
                >
                  {/* Animated ring */}
                  <motion.div
                    className="
                      absolute
                      -inset-[5px]
                      rounded-full
                      bg-[conic-gradient(from_20deg,#8b5cf6,#3b82f6,#d946ef,#8b5cf6)]
                      blur-[2px]
                    "
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  <div className="
                    relative
                    h-36 w-36
                    overflow-hidden
                    rounded-full
                    border-2
                    border-[#0f1530]
                    bg-[#0f1630]
                    shadow-[0_0_70px_rgba(124,58,237,0.25)]
                    sm:h-40 sm:w-40
                    lg:h-44 lg:w-44
                  ">
                    {profile?.profileImage ? (
                      <img
                        src={
                          profile.profileImage
                        }
                        alt={`${displayName} profile`}
                        className="
                          h-full w-full
                          object-cover
                          transition-transform
                          duration-700
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div className="
                        flex h-full w-full
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-violet-700/20
                        via-[#111932]
                        to-blue-700/15
                      ">
                        <UserRound className="
                          h-16 w-16
                          text-violet-300/70
                        " />
                      </div>
                    )}

                    {/* Glass overlay */}
                    <div className="
                      pointer-events-none
                      absolute inset-0
                      bg-gradient-to-br
                      from-white/[0.13]
                      via-transparent
                      to-black/[0.20]
                    " />

                  </div>

                  {/* Active */}
                  <motion.span
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(52,211,153,0.35)",
                        "0 0 0 7px rgba(52,211,153,0)",
                        "0 0 0 0 rgba(52,211,153,0)",
                      ],
                    }}
                    transition={{
                      duration: 2.3,
                      repeat: Infinity,
                    }}
                    className="
                      absolute
                      bottom-2 right-2
                      flex h-7 w-7
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-[#070c1d]
                      bg-emerald-400
                      text-[#03110a]
                    "
                    title="Active profile"
                  >
                    <Check
                      className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]"
                      strokeWidth={3}
                    />
                  </motion.span>
                </motion.div>

                {/* Photo controls */}
                <div className="
                  mt-4
                  flex flex-wrap
                  justify-center gap-2
                  md:justify-start
                ">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleChangePhoto
                    }
                    className="hidden"
                  />

                  <motion.button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={imageBusy}
                    whileHover={{
                      y: -2,
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    className="
                      inline-flex
                      items-center gap-2
                      rounded-xl
                      border
                      border-violet-400/25
                      bg-violet-500/[0.06]
                      px-4 py-2.5
                      text-xs font-semibold
                      text-violet-200
                      transition-all duration-300
                      hover:border-violet-300/45
                      hover:bg-violet-500/[0.11]
                      hover:shadow-[0_0_30px_rgba(139,92,246,0.16)]
                      disabled:opacity-60
                    "
                  >
                    {imageBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
                    )}

                    {imageBusy
                      ? "Uploading..."
                      : "Change Photo"}
                  </motion.button>

                  {profile?.profileImage && (
                    <motion.button
                      type="button"
                      onClick={
                        handleRemovePhoto
                      }
                      disabled={
                        removingImage
                      }
                      whileHover={{
                        y: -2,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      className="
                        inline-flex
                        items-center gap-2
                        rounded-xl
                        border
                        border-red-400/15
                        bg-red-500/[0.04]
                        px-3.5 py-2.5
                        text-xs font-semibold
                        text-red-300
                        transition-all duration-300
                        hover:border-red-300/30
                        hover:bg-red-500/[0.08]
                        disabled:opacity-60
                      "
                    >
                      {removingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
                      )}

                      Remove
                    </motion.button>
                  )}
                </div>
              </div>

              {/* PROFILE INFO */}
              <div className="min-w-0 flex-1 max-w-full">
                <div className="
                  flex flex-wrap
                  items-center gap-2
                ">
                  <motion.h2
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    className="
                      text-2xl
                      font-semibold
                      tracking-tight
                      text-white
                      sm:text-3xl
                    "
                  >
                    {loading
                      ? "Loading..."
                      : displayName}
                  </motion.h2>

                  {emailVerified && (
                    <motion.span
                      initial={{
                        scale: 0,
                        rotate: -30,
                      }}
                      animate={{
                        scale: 1,
                        rotate: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 18,
                      }}
                      className="
                        inline-flex
                        h-6 w-6
                        items-center
                        justify-center
                        rounded-full
                        bg-violet-500
                        shadow-[0_0_25px_rgba(139,92,246,0.40)]
                      "
                      title="Email verified"
                    >
                      <Check
                        className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]"
                        strokeWidth={3}
                      />
                    </motion.span>
                  )}
                </div>

                <p className="
                  mt-1
                  text-base
                  text-slate-300
                ">
                  Content Creator & AI Enthusiast
                </p>

                <div className="
                  mt-4
                  flex flex-wrap
                  gap-x-5 gap-y-2
                  text-xs
                  text-slate-500
                  sm:text-sm
                ">
                  <motion.button
                    type="button"
                    onClick={() => detectAndSaveLocation(true)}
                    disabled={locationBusy}
                    whileHover={{
                      y: -1,
                      color: "rgb(216 180 254)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      inline-flex items-center gap-2
                      rounded-lg px-1 py-0.5
                      text-left text-xs text-slate-400
                      transition-colors duration-300
                      hover:text-violet-200
                      disabled:cursor-wait disabled:opacity-70
                      sm:text-sm
                    "
                    title="Detect and save your current location"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
                    <span className="truncate">
                      {locationBusy
                        ? "Detecting location..."
                        : displayLocation}
                    </span>
                  </motion.button>

                  <span className="
                    inline-flex
                    items-center gap-2
                  ">
                    <CalendarDays className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
                    {joinedDate}
                  </span>
                </div>

                <p className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-400
                ">
                  {displayBio}
                </p>

                <div className="
                  mt-6
                  grid gap-3
                  sm:grid-cols-3
                ">
                  {[
                    {
                      label: "Posts Created",
                      value: formatNumber(
                        postsCreated
                      ),
                    },
                    {
                      label: "AI Actions",
                      value: formatNumber(
                        totalGenerations
                      ),
                    },
                    {
                      label: "Idea Generates",
                      value: formatNumber(
                        ideaGenerations
                      ),
                    },
                  ].map(
                    (item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{
                          opacity: 0,
                          y: 14,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            0.15 +
                            index *
                              0.07,
                        }}
                        whileHover={{
                          y: -4,
                          borderColor:
                            "rgba(139,92,246,0.20)",
                        }}
                        className="
                          rounded-2xl
                          border
                          border-white/[0.06]
                          bg-white/[0.02]
                          px-4 py-3
                          transition-colors
                        "
                      >
                        <span className="
                          text-[10px]
                          uppercase
                          tracking-[0.12em]
                          text-slate-600
                        ">
                          {item.label}
                        </span>

                        <p className="
                          mt-1
                          text-lg
                          font-semibold
                          text-white
                        ">
                          {item.value}
                        </p>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* SECURITY CARD */}
          <GlassCard
            className="min-w-0 p-4 sm:p-6"
            hover={false}
          >
            <div className="
              flex items-start
              justify-between gap-3
            ">
              <div>
                <p className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.13em]
                  text-violet-300/80
                ">
                  Security
                </p>

                <h3 className="
                  mt-1
                  text-xl
                  font-semibold
                  text-white
                ">
                  Account Status
                </h3>
              </div>

              <motion.div
                animate={{
                  y: [0, -3, 0],
                  rotate: [0, 2, 0, -2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="
                  flex h-10 w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-violet-400/15
                  bg-violet-500/[0.07]
                  text-violet-300
                  shadow-[0_0_25px_rgba(139,92,246,0.10)]
                "
              >
                <ShieldCheck className="h-5 w-5 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              </motion.div>
            </div>

            <div className="mt-5 space-y-2.5">
              <StatusRow
                icon={
                  <Mail className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
                }
                label="Email Verified"
                value="Enabled"
                good={true}
              />

              <StatusRow
                icon={
                  <ShieldCheck className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
                }
                label="Two-Factor Auth"
                value={
                  twoFactorEnabled
                    ? "Enabled"
                    : "Not Enabled"
                }
                good={twoFactorEnabled}
              />

              <StatusRow
                icon={
                  <CheckCircle2 className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
                }
                label="Account Status"
                value={
                  user
                    ? "Active"
                    : "Inactive"
                }
                good={Boolean(user)}
              />
            </div>

          </GlassCard>
        </section>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="
          mt-5
          rounded-[22px]
          border border-white/[0.07]
          bg-[#070c1d]/90
          p-4
          shadow-[0_25px_100px_rgba(0,0,0,0.25)]
          backdrop-blur-2xl
          sm:p-5
          lg:p-6
        ">
          <div className="
            mb-5
            flex flex-col gap-3
            sm:flex-row
            sm:items-end
            sm:justify-between
          ">
            <div>
              <p className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-violet-300/80
              ">
                Analytics
              </p>

              <h3 className="
                mt-1
                text-xl
                font-semibold
                text-white
              ">
                Your Statistics
              </h3>

              <p className="
                mt-1
                text-sm
                text-slate-500
              ">
                Real counts from the feature
                documents connected to your account.
              </p>
            </div>

            <motion.span
              whileHover={{
                y: -2,
                scale: 1.02,
                borderColor: "rgba(139,92,246,0.22)",
              }}
              className="
                inline-flex
                w-fit
                items-center
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.02]
                px-3 py-2
                text-xs
                text-slate-500
                transition-colors duration-300
              "
            >
              Live Firebase data
            </motion.span>
          </div>

          <div className="
            grid gap-3
            sm:grid-cols-2
            xl:grid-cols-4
          ">
            <StatCard
              icon={
                <FileText className="h-5 w-5 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              }
              label="Posts Created"
              value={formatNumber(postsCreated)}
              trend={getTrendFromHistory(featureStats.contentGenerator)}
              accent="violet"
              delay={0.05}
            />

            <StatCard
              icon={
                <Sparkles className="h-5 w-5 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              }
              label="AI Generations"
              value={formatNumber(totalGenerations)}
              trend={getAggregateTrendFromHistory(featureStats)}
              accent="blue"
              delay={0.10}
            />

            <StatCard
              icon={
                <Lightbulb className="h-5 w-5 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              }
              label="Idea Generates"
              value={formatNumber(ideaGenerations)}
              trend={getTrendFromHistory(featureStats.ideaGenerator)}
              accent="amber"
              delay={0.15}
            />

            <StatCard
              icon={
                <BarChart3 className="h-5 w-5 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
              }
              label="Viral Score Avg."
              value={`${averageViralScore}%`}
              trend={getTrendFromHistory(featureStats.viralMeter)}
              accent="fuchsia"
              delay={0.20}
            />
          </div>
        </section>

        {/* ===================================================
            CHART
        =================================================== */}

        <ActivityChart
          totalGenerations={
            totalGenerations
          }
          featureStats={stats}
        />

        {/* ===================================================
            RECENT ACTIVITY
            Screenshot-inspired layout
        =================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 22,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.15,
          }}
          className="
            mt-5
            overflow-hidden
            rounded-[22px]
            border border-white/[0.07]
            bg-[#070c1d]/90
            shadow-[0_24px_90px_rgba(0,0,0,0.26)]
            backdrop-blur-xl
          "
        >
          {/* Header */}
          <div className="
            flex items-center
            justify-between
            gap-4
            px-5 py-5
            sm:px-6
          ">
            <div>
              <h3 className="
                text-xl
                font-semibold
                tracking-tight
                text-white
              ">
                Recent Activity
              </h3>

              <p className="
                mt-1
                text-sm
                text-slate-600
              ">
                Your latest AI workspace activity.
              </p>
            </div>

            {FEATURE_IDS.length > 4 && (
              <motion.button
                type="button"
                onClick={() =>
                  setShowAllActivity(
                    (current) => !current
                  )
                }
                whileHover={{
                  x: 2,
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="
                  text-sm
                  font-semibold
                  text-blue-300
                  transition-all duration-300
                  hover:text-violet-200
                  hover:drop-shadow-[0_0_14px_rgba(139,92,246,0.55)]
                "
              >
                {showAllActivity
                  ? "Show Less"
                  : "View All"}
              </motion.button>
            )}
          </div>

          {/* Rows */}
          <div className="
            mx-3 mb-3
            overflow-hidden
            rounded-xl
            border border-white/[0.055]
            bg-[#080e20]/80
            sm:mx-4
            sm:mb-4
          ">
            {FEATURE_IDS
              .slice()
              .sort((a, b) => {
                const aTime =
                  safeDate(
                    stats[a]?.lastUsed
                  )?.getTime() || 0;
                const bTime =
                  safeDate(
                    stats[b]?.lastUsed
                  )?.getTime() || 0;

                return bTime - aTime;
              })
              .slice(
                0,
                showAllActivity
                  ? FEATURE_IDS.length
                  : 4
              )
              .map(
                (featureId, index) => {
                const feature =
                  FEATURE_CONFIG[
                    featureId
                  ];

                return (
                  <RecentActivityRow
                    key={featureId}
                    feature={feature}
                    count={
                      stats[featureId]
                        ?.count || 0
                    }
                    lastUsed={
                      stats[featureId]
                        ?.lastUsed
                    }
                    onViewAll={() =>
                      setSelectedFeature(
                        featureId
                      )
                    }
                    index={index}
                    delay={
                      0.05 +
                      index * 0.06
                    }
                  />
                );
              }
            )}
          </div>
        </motion.section>
      </main>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {selectedFeature && (
        <ViewAllModal
          feature={
            FEATURE_CONFIG[
              selectedFeature
            ]
          }
          count={
            stats[selectedFeature]
              ?.count || 0
          }
          lastUsed={
            stats[selectedFeature]
              ?.lastUsed
          }
          onClose={() =>
            setSelectedFeature(null)
          }
        />
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.97,
            }}
            transition={{
              duration: 0.3,
            }}
            className="
              fixed
              bottom-5 right-5
              z-[90]
              flex max-w-sm
              items-center gap-3
              rounded-2xl
              border border-white/[0.08]
              bg-[#0a1024]/95
              px-4 py-3
              text-sm
              text-white
              shadow-[0_20px_70px_rgba(0,0,0,0.45)]
              backdrop-blur-xl
            "
          >
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
              }}
              className="
                flex h-8 w-8
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-emerald-400/15
                bg-emerald-500/[0.08]
              "
            >
              <CheckCircle2 className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
            </motion.div>

            <span>
              {toast}
            </span>

            <button
              type="button"
              onClick={() =>
                setToast("")
              }
              className="
                ml-1
                text-slate-600
                transition
                hover:text-white
              "
              aria-label="Close notification"
            >
              <X className="h-4 w-4 text-violet-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.75)]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}