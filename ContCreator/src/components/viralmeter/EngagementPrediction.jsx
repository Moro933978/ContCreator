import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Wand2 } from "lucide-react";

const EngagementPredictionChart = ({ loading, result }) => {
  const [showIndicator, setShowIndicator] = useState(false);

  const finalValue = useMemo(() => {
    if (!result?.timeline || !Array.isArray(result.timeline)) {
      return 0;
    }

    const lastPoint = result.timeline[result.timeline.length - 1];

    return Number(lastPoint?.value) || 0;
  }, [result]);

  const Card = ({ children, className = '', delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        type: 'spring',
        stiffness: 90,
        damping: 18,
      }}
      className={`bg-gradient-to-br from-[#1B143F] via-[#120D2B] to-[#0D091F]
        border border-purple-500/25
        rounded-[24px]
        shadow-[0_15px_45px_rgba(139,92,246,0.18)]
        relative overflow-hidden
        ${className}`}
    >
      {/* Ambient Top & Corner Purple Lighting */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      {children}
    </motion.div>
  );

  console.log("📊 Chart result:", result);
  console.log("📈 Chart finalValue:", finalValue);

  const dynamicChartData = useMemo(() => {
    if (!result?.timeline || !Array.isArray(result.timeline)) {
      return [];
    }

    return result.timeline.map((item) => ({
      time: item.time,
      value: Number(item.value) || 0,
    }));
  }, [result]);

  const state =
  loading
    ? "loading"
    : !result || dynamicChartData.length === 0
    ? "idle"
    : "result";

  useEffect(() => {
    setShowIndicator(false);

    if (!loading && finalValue > 0) {
      const timer = setTimeout(() => {
        setShowIndicator(true);
      }, 2100);

      return () => clearTimeout(timer);
    }
  }, [loading, finalValue]);


    const yTicks = useMemo(() => {
        if (!result?.timeline || !Array.isArray(result.timeline)) {
            return [];
        }

    const values = result.timeline
        .map(item => Number(item.value))
        .filter(value => Number.isFinite(value));

    return [0, ...values.sort((a, b) => a - b)];
    }, [result]);

    const formatYAxis = (value) => {
        if (value === 0) return "0";

        if (value >= 1000000) {
            return `${(value / 1000000)
            .toFixed(1)
            .replace(".0", "")}M`;
        }

        if (value >= 1000) {
            return `${(value / 1000)
            .toFixed(1)
            .replace(".0", "")}K`;
        }

        return value.toLocaleString();
    };
  return (
    <Card
      delay={0.9}
      className="p-6 lg:p-7 flex-none lg:flex-1 flex flex-col min-h-[300px]"
    >
      <div className="flex items-center justify-between mb-6 shrink-0 z-10">
        <h3 className="text-sm font-semibold text-gray-200 tracking-wide">
          Engagement Prediction
        </h3>
      </div>

      <div className="flex-1 w-full relative min-h-[230px] z-10">

        {/* IDLE STATE */}
        {state === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl">
            {/* Extremely subtle analytical background grid */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 opacity-30 pointer-events-none">
              <div className="w-full border-b border-purple-500/10" />
              <div className="w-full border-b border-purple-500/10" />
              <div className="w-full border-b border-purple-500/10" />
              <div className="w-full border-b border-purple-400/20" />
            </div>

            {/* Subtle bottom ambient purple glow */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-purple-600/10 to-transparent pointer-events-none" />

            {/* Centered premium glass pill */}
            <motion.div
              animate={{
                opacity: [0.85, 1, 0.85],
                scale: [0.99, 1, 0.99],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full
                bg-white/[0.04]
                border border-purple-500/30
                text-purple-200/90 text-xs font-medium
                backdrop-blur-xl
                shadow-[0_4px_24px_rgba(139,92,246,0.15)]
                z-10"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="tracking-wide">Ready for AI Analysis</span>
            </motion.div>
          </div>
        )}

        {/* LOADING STATE */}
        {state === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
            {/* Subtle analytical grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 opacity-30 pointer-events-none">
              <div className="w-full border-b border-purple-500/10" />
              <div className="w-full border-b border-purple-500/10" />
              <div className="w-full border-b border-purple-500/10" />
              <div className="w-full border-b border-purple-400/20" />
            </div>

            {/* Soft purple glow & ambient field */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-purple-600/15 to-transparent pointer-events-none" />

            {/* Animated scanning beam across the analytical surface */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-purple-500/15 to-transparent blur-md pointer-events-none"
            />

            {/* Sharp thin purple scanning line */}
            <motion.div
              animate={{
                left: ["0%", "100%"],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-400/80 to-transparent shadow-[0_0_12px_#8B5CF6] pointer-events-none"
            />

            {/* Premium glass loading badge */}
            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [0.985, 1, 0.985],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full
                bg-purple-500/10
                border border-purple-400/35
                text-purple-200 text-xs font-semibold
                backdrop-blur-xl
                shadow-[0_8px_30px_rgba(139,92,246,0.22)]
                z-10"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span className="tracking-wide">AI Analyzing Trajectory</span>
            </motion.div>
          </div>
        )}

        {/* RESULT STATE */}
        {state === "result" && (
          <>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={dynamicChartData}
                margin={{
                  top: 15,
                  right: 25,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="engagementGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8B5CF6"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="50%"
                      stopColor="#A855F7"
                      stopOpacity={0.18}
                    />
                    <stop
                      offset="98%"
                      stopColor="#8B5CF6"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  {/* Luminous Glow Filter for the Chart Stroke */}
                  <filter id="purpleLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="6"
                      floodColor="#8B5CF6"
                      floodOpacity="0.45"
                    />
                  </filter>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(139, 92, 246, 0.09)"
                />

                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#E5E7EB",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                  dy={12}
                />

                <YAxis
                ticks={yTicks}
                domain={[0, "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{
                    fill: "#9CA3AF",
                    fontSize: 10,
                }}
                tickFormatter={formatYAxis}
                />

                <Tooltip
                  cursor={{
                    stroke: "rgba(139, 92, 246, 0.35)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;

                    return (
                      <div className="
                        bg-[#0C0A1D]/85
                        backdrop-blur-xl
                        border border-purple-500/30
                        rounded-xl
                        px-3.5 py-2.5
                        shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(139,92,246,0.15)]
                      ">
                        <div className="text-gray-400 text-[11px] font-medium tracking-wide mb-1">
                          {label}
                        </div>

                        <div className="text-white text-sm font-bold tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                          {formatYAxis(payload[0].value)}
                        </div>
                      </div>
                    );
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  strokeWidth={2.8}
                  fill="url(#engagementGradient)"
                  fillOpacity={1}
                  animationDuration={2000}
                  animationEasing="ease-out"
                  style={{
                    filter: "url(#purpleLineGlow)",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* FINAL VALUE INDICATOR */}
            <AnimatePresence>
              {showIndicator && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scaleY: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scaleY: 1,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="
                    absolute
                    right-[25px]
                    bottom-[28px]
                    h-[70%]
                    w-[1.5px]
                    origin-bottom
                    bg-gradient-to-t
                    from-purple-500
                    via-purple-400
                    to-transparent
                    shadow-[0_0_14px_rgba(139,92,246,0.8)]
                  "
                >
                  {/* Premium floating glass value badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="
                      absolute
                      -top-9
                      left-1/2
                      -translate-x-1/2
                      whitespace-nowrap
                      px-3
                      py-1
                      rounded-lg
                      bg-white/10
                      backdrop-blur-xl
                      border border-purple-400/40
                      text-white
                      text-xs
                      font-bold
                      tracking-wide
                      shadow-[0_8px_25px_rgba(139,92,246,0.35)]
                      flex items-center gap-1
                    "
                  >
                    <span>{formatYAxis(finalValue)}</span>
                    <span className="text-purple-300 font-normal">↑</span>
                  </motion.div>

                  {/* Animated Endpoint Target Marker */}
                  <div className="absolute -bottom-1 -left-[5px] w-3 h-3 flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.9, 0.2, 0.9],
                      }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full bg-purple-400/60 blur-[1px]"
                    />
                    <div className="w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_12px_#A855F7]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

      </div>
    </Card>
  );
};

export default EngagementPredictionChart;