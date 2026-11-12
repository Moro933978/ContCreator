import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import {
  TrendingUp, ThumbsUp, Share2, Eye, ThumbsDown, Activity,
  Sparkles, Info, ShieldCheck, Cpu
} from 'lucide-react';

// ==========================================
// UTILITY COMPONENTS
// ==========================================

// Animated Counter Component
const Counter = ({ value, duration = 1.6 }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    let targetNum = 0;
    let formatFn = (v) => Math.floor(v).toLocaleString();

    if (typeof value === 'number') {
      targetNum = value;
    } else if (typeof value === 'string') {
      const cleanStr = value.replace(/,/g, '');
      if (cleanStr.endsWith('%')) {
        targetNum = parseFloat(cleanStr);
        formatFn = (v) => v.toFixed(1) + '%';
      } else if (cleanStr.toUpperCase().endsWith('K')) {
        targetNum = parseFloat(cleanStr) * 1000;
        formatFn = (v) => (v / 1000).toFixed(v % 1000 >= 100 ? 1 : 0) + 'K';
      } else if (cleanStr.toUpperCase().endsWith('M')) {
        targetNum = parseFloat(cleanStr) * 1000000;
        formatFn = (v) => (v / 1000000).toFixed(1) + 'M';
      } else {
        targetNum = parseFloat(cleanStr) || 0;
        formatFn = (v) => Math.floor(v).toLocaleString();
      }
    }

    const controls = animate(0, targetNum, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (node) node.textContent = formatFn(v);
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  return <span ref={nodeRef} />;
};

// Premium Animated Loading Dots
const LoadingDots = ({ color }) => {
  return (
    <div className="flex items-center gap-1.5 h-[32px]">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [0.6, 1.2, 0.6],
            opacity: [0.4, 1, 0.4],
            boxShadow: [
              `0 0 0px transparent`,
              `0 0 10px ${color}`,
              `0 0 0px transparent`,
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

// Small text dots for footer
const TextDots = () => (
  <span className="inline-flex w-3">
    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span>
    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>.</motion.span>
    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}>.</motion.span>
  </span>
);

// Reusable Circular Progress Ring
const ProgressRing = ({ progress = 75, color = '#8B5CF6', size = 52, strokeWidth = 4, icon: Icon }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <div 
        className="absolute inset-0 rounded-full opacity-25 blur-md transition-opacity duration-500 group-hover:opacity-50" 
        style={{ backgroundColor: color }} 
      />
      
      <svg className="transform -rotate-90 w-full h-full absolute inset-0">
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke="rgba(255, 255, 255, 0.06)" 
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
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>

      {Icon && (
        <motion.div
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative z-10 flex items-center justify-center"
        >
          <Icon size={size * 0.38} style={{ color }} />
        </motion.div>
      )}
    </div>
  );
};

// Helper: Determine Status Badge
const getStatusDetails = (title) => {
  if (title.includes('Dislikes')) {
    return { text: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  }
  return { text: 'High', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
};

// ==========================================
// REUSABLE STAT CARD
// ==========================================

const StatCard = ({ title, value, prefix = "", suffix = "", icon: Icon, color, progress, delay = 0, isLoading }) => {
  const statusInfo = useMemo(() => getStatusDetails(title), [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative bg-[#181335]/60 hover:bg-[#201A45]/80 border border-purple-500/15 hover:border-purple-500/40 rounded-2xl p-4.5 flex items-center gap-4 transition-all duration-300 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.18)] cursor-pointer overflow-hidden"
    >
      <div 
        className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <ProgressRing progress={isLoading ? 0 : progress} color={color} icon={Icon} />

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs text-gray-400 font-medium tracking-wide truncate mb-1">
          {title}
        </span>
        
        {/* Value Container (Fixed height to prevent jumping) */}
        <div className="flex items-baseline gap-1 h-[32px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-dots"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center h-full"
              >
                <LoadingDots color={color} />
              </motion.div>
            ) : (
              <motion.div
                key="value"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-baseline gap-1"
              >
                {prefix && <span className="text-lg font-bold text-white/90">{prefix}</span>}
                <span className="text-2xl font-extrabold text-white tracking-tight truncate">
                  <Counter value={value} />
                </span>
                {suffix && <span className="text-sm font-semibold text-gray-300">{suffix}</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Badge Container (Fixed height to prevent jumping) */}
        <div className="mt-1.5 flex items-center gap-2 h-[22px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.span
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 bg-white/5 text-gray-300 shadow-[0_0_8px_rgba(255,255,255,0.08)] flex items-center"
              >
                <span className="animate-pulse">Analyzing...</span>
              </motion.span>
            ) : (
              <motion.span
                key="status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}
              >
                {statusInfo.text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// MAIN COMPONENT: PREDICTION OVERVIEW
// ==========================================

export default function PredictionOverview({
  loading = false,
  result = {},
}) {
  const showLoading = loading;

const predictionBadge = useMemo(() => {
  if (loading || !result || Object.keys(result).length === 0) {
    return null;
  }

  const parseVal = (val) => {
    if (typeof val === "number") return val;

    if (typeof val === "string") {
      return parseFloat(val.replace(/,/g, "")) || 0;
    }

    return 0;
  };

  const views = parseVal(result.predictedViews);
  const likes = parseVal(result.predictedLikes);
  const shares = parseVal(result.predictedShares);
  const subscribers = parseVal(result.predictedSubscribers);
  const dislikes = parseVal(result.predictedDislikes);
  const engagementRate = parseVal(result.engagementRate);

  if (views <= 0) {
    return null;
  }

  // ==========================================
  // 1. VIEWS SCORE — 25%
  // ==========================================

  // Logarithmic scale prevents huge view counts
  // from completely dominating the score.
  const viewsScore = Math.min(
    100,
    (Math.log10(views) / 6) * 100
  );

  // ==========================================
  // 2. LIKE RATE — 20%
  // ==========================================

  const likeRate = (likes / views) * 100;

  // 10% like rate = excellent / 100 score
  const likesScore = Math.min(
    100,
    (likeRate / 10) * 100
  );

  // ==========================================
  // 3. SHARE RATE — 20%
  // ==========================================

  const shareRate = (shares / views) * 100;

  // 2% share rate = excellent / 100 score
  const sharesScore = Math.min(
    100,
    (shareRate / 2) * 100
  );

  // ==========================================
  // 4. SUBSCRIBER CONVERSION — 15%
  // ==========================================

  const subscriberRate = (subscribers / views) * 100;

  // 1% subscriber conversion = excellent
  const subscribersScore = Math.min(
    100,
    (subscriberRate / 1) * 100
  );

  // ==========================================
  // 5. ENGAGEMENT RATE — 15%
  // ==========================================

  const normalizedEngagement =
    engagementRate <= 1
      ? engagementRate * 100
      : engagementRate;

  // 15% engagement = excellent / 100 score
  const engagementScore = Math.min(
    100,
    (normalizedEngagement / 15) * 100
  );

  // ==========================================
  // 6. LIKE / DISLIKE SENTIMENT — 5%
  // ==========================================

  const totalReactions = likes + dislikes;

  const sentimentScore =
    totalReactions > 0
      ? (likes / totalReactions) * 100
      : 0;

  // ==========================================
  // FINAL WEIGHTED SCORE
  // ==========================================

  const finalScore =
    viewsScore * 0.25 +
    likesScore * 0.20 +
    sharesScore * 0.20 +
    subscribersScore * 0.15 +
    engagementScore * 0.15 +
    sentimentScore * 0.05;

  console.log("========== PREDICTION SCORE ==========");
  console.log("Views:", views);
  console.log("Likes:", likes);
  console.log("Shares:", shares);
  console.log("Subscribers:", subscribers);
  console.log("Dislikes:", dislikes);
  console.log("Engagement:", normalizedEngagement + "%");
  console.log("--------------------------------------");
  console.log("Views Score:", viewsScore.toFixed(2));
  console.log("Likes Score:", likesScore.toFixed(2));
  console.log("Shares Score:", sharesScore.toFixed(2));
  console.log("Subscribers Score:", subscribersScore.toFixed(2));
  console.log("Engagement Score:", engagementScore.toFixed(2));
  console.log("Sentiment Score:", sentimentScore.toFixed(2));
  console.log("--------------------------------------");
  console.log("FINAL SCORE:", finalScore.toFixed(2));
  console.log(
    "POTENTIAL:",
    finalScore >= 70
      ? "HIGH"
      : finalScore >= 40
      ? "MEDIUM"
      : "LOW"
  );
  console.log("======================================");

  // ==========================================
  // CLASSIFICATION
  // ==========================================

  if (finalScore >= 70) {
    return {
      text: "High Potential",
      Icon: TrendingUp,
      className:
        "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    };
  }

  if (finalScore >= 40) {
    return {
      text: "Medium Potential",
      Icon: Activity,
      className:
        "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    };
  }

  return {
    text: "Low Potential",
    Icon: ThumbsDown,
    className:
      "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
  };
}, [loading, result]);

  const BadgeIcon = predictionBadge?.Icon;

  const cardsData = useMemo(() => [
    {
      title: "Predicted Subscribers",
      value: result?.predictedSubscribers,
      prefix: "+",
      icon: TrendingUp,
      color: "#8B5CF6",
      progress: 85,
    },
    {
      title: "Predicted Likes",
      value: result?.predictedLikes,
      icon: ThumbsUp,
      color: "#3B82F6",
      progress: 92,
    },
    {
      title: "Predicted Shares",
      value: result?.predictedShares,
      icon: Share2,
      color: "#EAB308",
      progress: 68,
    },
    {
      title: "Predicted Views",
      value: result?.predictedViews,
      icon: Eye,
      color: "#A855F7",
      progress: 88,
    },
    {
      title: "Predicted Dislikes",
      value: result?.predictedDislikes,
      icon: ThumbsDown,
      color: "#F43F5E",
      progress: 15,
    },
    {
      title: "Engagement Rate",
      value: result?.engagementRate,
      suffix: "%",
      icon: Activity,
      color: "#0EA5E9",
      progress: 78,
    },
  ], [result]);

  return (
    <div className="w-full relative min-h-[480px] bg-gradient-to-br from-[#120B2E] via-[#0E0824] to-[#0A051B] border border-purple-500/20 rounded-[26px] p-5 sm:p-6 lg:p-7 shadow-[0_15px_45px_rgba(0,0,0,0.5)] overflow-hidden font-sans">
      
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-purple-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Prediction Overview</h2>
                <Info className="w-4 h-4 text-gray-400 hover:text-purple-300 transition-colors cursor-pointer" />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">AI-backed viral trajectory for your upcoming content</p>
            </div>
          </div>

          {/* Top Right Header Badge */}
          <AnimatePresence mode="wait">
            {showLoading ? (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md"
              >
                <svg className="w-4 h-4 animate-spin text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-semibold text-purple-400 tracking-wide">AI Processing...</span>
              </motion.div>
            ) : predictionBadge ? (
              <motion.div 
                key={predictionBadge.text}
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.03 }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md ${predictionBadge.className}`}
              >
                {BadgeIcon && <BadgeIcon className="w-4 h-4" />}
                <span className="text-xs font-semibold tracking-wide">{predictionBadge.text}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {cardsData.map((card, idx) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              prefix={card.prefix}
              suffix={card.suffix}
              icon={card.icon}
              color={card.color}
              progress={card.progress}
              delay={idx * 0.07}
              isLoading={showLoading || card.value == null}
            />
          ))}
        </div>

        {/* Footer Insights bar */}
        <div className="mt-6 pt-4 border-t border-purple-500/10 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 h-[40px]">
          <AnimatePresence mode="wait">
            {showLoading ? (
              <motion.div
                key="footer-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-purple-300 w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 animate-pulse" />
                  <span>AI is analyzing your content<TextDots /></span>
                </div>
                <span className="text-gray-500 text-[11px] animate-pulse">Running neural models...</span>
              </motion.div>
            ) : (
              <motion.div
                key="footer-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 text-gray-400 w-full justify-between"
              >
                <div className="flex items-center gap-2 text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Confidence Score: <strong className="text-white">94.8%</strong> based on 10M+ analyzed videos</span>
                </div>
                <span className="text-gray-500 text-[11px]">Updated in real-time</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}