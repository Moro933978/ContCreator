import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { BrainCircuit, Smile, Frown, Meh, Loader2, Sparkles, CheckCircle2, Clock } from "lucide-react";

// ==========================================
// UTILITY: EXTRACT & NORMALIZE DATA
// ==========================================
const getSentimentData = (res) => {
  if (!res) return null;

  const target =
    res.audienceSentiment ||
    res.sentiment ||
    res.sentimentAnalysis ||
    res.predictions?.audienceSentiment ||
    res.data?.audienceSentiment ||
    res;

  if (target && typeof target.positive === "number") {
    const p = target.positive || 0;
    const n = target.neutral || 0;
    const neg = target.negative || 0;
    
    const total = p + n + neg;
    
    if (total === 0) return { positive: 0, neutral: 0, negative: 0, total: 0 };

    return {
      positive: Math.round((p / total) * 100),
      neutral: Math.round((n / total) * 100),
      negative: Math.round((neg / total) * 100),
      total,
    };
  }

  return null;
};

// ==========================================
// COMPONENT: ANIMATED NUMBER COUNTER
// ==========================================
const AnimatedNumber = ({ value, duration = 1.5, delay = 0 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(count, value, {
        duration,
        ease: [0.22, 1, 0.36, 1],
      });
      return controls.stop;
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const AudienceSentiment = ({ loading = false, result = null }) => {
  const sentimentData = getSentimentData(result);
  const hasResult = sentimentData && sentimentData.total > 0;

  // Header Status Badge Logic
  let statusText = "WAITING";
  let StatusIcon = Clock;
  let statusColor = "text-gray-400 bg-gray-500/10 border-gray-500/20";

  if (loading) {
    statusText = "ANALYZING";
    StatusIcon = Loader2;
    statusColor = "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]";
  } else if (hasResult) {
    statusText = "ANALYZED";
    StatusIcon = CheckCircle2;
    statusColor = "text-green-400 bg-green-500/10 border-green-500/20";
  }

  // تجهيز بيانات المشاعر وألوانها
  const sentimentsList = hasResult ? [
    { 
      id: "positive", 
      label: "Positive", 
      value: sentimentData.positive, 
      color: "#22C55E", 
      trackColor: "rgba(34, 197, 94, 0.15)",
      iconColor: "text-green-400",
      badgeBg: "bg-green-500/20",
      gradient: "from-[#064E3B] to-[#16A34A]",
      glowColor: "rgba(22,163,74,0.4)",
      Icon: Smile 
    },
    { 
      id: "neutral", 
      label: "Neutral", 
      value: sentimentData.neutral, 
      color: "#F97316", 
      trackColor: "rgba(249, 115, 22, 0.15)",
      iconColor: "text-amber-400",
      badgeBg: "bg-amber-500/20",
      gradient: "from-[#78350F] to-[#D97706]",
      glowColor: "rgba(217,119,6,0.4)",
      Icon: Meh 
    },
    { 
      id: "negative", 
      label: "Negative", 
      value: sentimentData.negative, 
      color: "#EF4444", 
      trackColor: "rgba(239, 68, 68, 0.15)",
      iconColor: "text-rose-400",
      badgeBg: "bg-rose-500/20",
      gradient: "from-[#7F1D1D] to-[#E11D48]",
      glowColor: "rgba(225,29,72,0.4)",
      Icon: Frown 
    },
  ] : [];

  // تحديد القيمة الأعلى علشان الدائرة تاخد لونها وايقونتها واسمها
  const dominantSentiment = hasResult 
    ? [...sentimentsList].sort((a, b) => b.value - a.value)[0] 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="
        relative w-full min-h-[420px] h-full rounded-[24px] overflow-hidden
        border border-purple-500/20 bg-[#080615] flex flex-col
        shadow-[0_20px_60px_rgba(124,58,237,0.08)]
      "
    >
      {/* BACKGROUND GRADIENTS & GLOWS (نفس الاستايل الأصلي) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#171034] via-[#100B27] to-[#080615] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      
      {/* Top Glass Highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-70" />

      {/* HEADER */}
      <div className="relative z-10 p-6 sm:p-8 pb-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20">
            <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-ping opacity-30" />
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              Audience Sentiment
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] uppercase tracking-[0.2em] text-purple-300/70 font-medium">
              <Sparkles className="w-3 h-3" />
              AI Analysis
            </div>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <motion.div
          layout
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-wider ${statusColor} transition-colors duration-500`}
        >
          <StatusIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {statusText}
        </motion.div>
      </div>

      {/* CONTENT AREA */}
      <div className="relative z-10 flex-1 p-6 sm:p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* EMPTY STATE */}
          {!loading && !hasResult && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center text-center h-full my-auto py-8"
            >
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center rounded-3xl bg-purple-500/5 border border-purple-500/10">
                <BrainCircuit className="w-10 h-10 text-purple-500/40" />
                <motion.div 
                  animate={{ opacity: [0.1, 0.4, 0.1] }} 
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-purple-500/10 rounded-3xl blur-xl"
                />
              </div>
              <h4 className="text-white text-lg font-semibold tracking-wide">Ready for Analysis</h4>
              <p className="text-sm text-gray-500 mt-2 max-w-[260px] leading-relaxed">
                Generate predictions to reveal deep AI-driven sentiment insights.
              </p>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full my-auto py-6"
            >
              <div className="relative flex items-center justify-center w-36 h-36 mb-6">
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-full h-full text-purple-500/30 opacity-60"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
                </motion.svg>

                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-[2px] border-transparent border-t-purple-400 border-l-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                />

                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-16 h-16 bg-purple-500/20 rounded-full blur-md"
                />
                
                <BrainCircuit className="relative z-10 w-10 h-10 text-purple-300" />
              </div>

              <h4 className="text-purple-300 text-sm font-bold tracking-[0.2em] uppercase mb-3">
                AI Analyzing
              </h4>
              <LoadingPhrases />
            </motion.div>
          )}

          {/* RESULT STATE */}
          {!loading && hasResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 w-full"
            >
              {/* الدائرة بتشكل ولون أعلى نسبة */}
              <DominantDonut dominant={dominantSentiment} />
              
              {/* البارات الجانبية */}
              <ResultBars items={sentimentsList} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ========================================== */
/* SUB-COMPONENTS */
/* ========================================== */

// Cycling Loading Text
const LoadingPhrases = () => {
  const phrases = [
    "Reading audience signals...",
    "Processing emotional reactions...",
    "Calculating sentiment...",
    "Preparing audience insights...",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="h-6 relative w-full flex justify-center overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="text-sm text-gray-400 absolute"
        >
          {phrases[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

// الدائرة الرئيسية باللون والنسبة لأعلى عنصر (زي الصورة الثانية تماماً)
const DominantDonut = ({ dominant }) => {
  const size = 210;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // حساب المسافة الملونة من الدائرة
  const activeLength = (dominant.value / 100) * circumference;

  return (
    <div className="relative shrink-0 flex flex-col items-center justify-center w-[210px] h-[210px]">
      <svg width={size} height={size} className="absolute inset-0 transform -rotate-90">
        
        {/* Track خلفي بلون هادئ نفس درجة العاطفة */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={dominant.trackColor}
          strokeWidth={strokeWidth}
        />

        {/* الجزء النشط باللون الفاقع مع حواف مستقيمة حادة */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={dominant.color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="butt" // حواف مستقيمة بالظبط زي الصورة
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - activeLength }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 10px ${dominant.glowColor})` }}
        />
      </svg>

      {/* المحتوى الداخلي بالمنتصف */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
      >
        {/* أيقونة أعلى نسبة بداخل دائرة صغيرة */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${dominant.badgeBg} border border-white/10`}>
          <dominant.Icon className={`w-5 h-5 ${dominant.iconColor}`} />
        </div>

        {/* النسبة المئوية */}
        <div className="text-[38px] leading-none font-bold text-white tracking-tighter mb-0.5">
          <AnimatedNumber value={dominant.value} delay={0.2} duration={1.5} />
          <span className="text-xl text-white/80 ml-0.5">%</span>
        </div>

        {/* اسم النسبة الأعلى (Positive / Neutral / Negative) */}
        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
          {dominant.label}
        </span>
      </motion.div>
    </div>
  );
};

// حاوية البارات
const ResultBars = ({ items }) => {
  return (
    <div className="w-full flex-1 flex flex-col gap-6 justify-center">
      {items.map((item, idx) => (
        <SentimentRow key={item.id} item={item} delay={0.3 + idx * 0.2} />
      ))}
    </div>
  );
};

// البار الفردي
const SentimentRow = ({ item, delay }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <item.Icon className={`w-4 h-4 ${item.iconColor}`} />
          <span className="text-sm font-medium text-gray-300 tracking-wide">{item.label}</span>
        </div>
        <div className="text-sm font-bold text-white">
          <AnimatedNumber value={item.value} delay={delay} duration={1.5} />%
        </div>
      </div>

      {/* Track البار */}
      <div className="relative w-full h-3.5 rounded-full bg-[#0B0918] overflow-hidden border border-white/[0.03] shadow-inner">
        {/* تعبئة البار المتحركة */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${item.value}%` }}
          transition={{ delay, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${item.gradient} relative overflow-hidden`}
          style={{ boxShadow: `0 0 12px ${item.glowColor}` }}
        >
          {/* لمعة متحركة (Shimmer) */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: delay + 1 }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AudienceSentiment;