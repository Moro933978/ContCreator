import React, { useEffect, useMemo, useRef } from 'react';
import { motion, animate, AnimatePresence } from 'framer-motion';

// ==========================================
// FORMAT VIEWS
// ==========================================

const formatViews = (num) => {
  const value = Number(num);

  if (!Number.isFinite(value) || value <= 0) {
    return '0';
  }

  if (value >= 1000000) {
    return (
      (value / 1000000)
        .toFixed(2)
        .replace(/\.00$/, '')
        .replace(/(\.\d)0$/, '$1') + 'M'
    );
  }

  if (value >= 1000) {
    return (
      (value / 1000)
        .toFixed(1)
        .replace(/\.0$/, '') + 'K'
    );
  }

  return Math.round(value).toString();
};

// ==========================================
// ANIMATED NUMBER
// ==========================================

const AnimatedNumber = ({
  value,
  isPercentage = false,
}) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;

    if (!node) return;

    const numericValue = Number(value) || 0;

    const controls = animate(0, numericValue, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],

      onUpdate(current) {
        if (isPercentage) {
          node.textContent = `${Math.round(current)}%`;
        } else {
          node.textContent = formatViews(current);
        }
      },
    });

    return () => controls.stop();
  }, [value, isPercentage]);

  return (
    <span ref={nodeRef}>
      {isPercentage ? '0%' : '0'}
    </span>
  );
};

// ==========================================
// PLATFORM BRAND COLORS
// ==========================================

const platformStyles = {
  YouTube: {
    color: '#FF0033',
    glow: 'rgba(255,0,51,0.55)',
    gradient: 'linear-gradient(90deg, #FF0033, #FF1744)',
  },

  Twitter: {
    color: '#1DA1F2',
    glow: 'rgba(29,161,242,0.55)',
    gradient: 'linear-gradient(90deg, #1DA1F2, #38BDF8)',
  },

  Instagram: {
    color: '#E1306C',
    glow: 'rgba(225,48,108,0.55)',
    gradient:
      'linear-gradient(90deg, #833AB4, #E1306C, #FCAF45)',
  },

  TikTok: {
    color: '#00F2EA',
    glow: 'rgba(0,242,234,0.55)',
    gradient:
      'linear-gradient(90deg, #00F2EA, #25F4EE)',
  },

  Facebook: {
    color: '#1877F2',
    glow: 'rgba(24,119,242,0.55)',
    gradient:
      'linear-gradient(90deg, #1877F2, #3B82F6)',
  },

  LinkedIn: {
    color: '#0A66C2',
    glow: 'rgba(10,102,194,0.55)',
    gradient:
      'linear-gradient(90deg, #0A66C2, #0EA5E9)',
  },

  Reddit: {
    color: '#FF4500',
    glow: 'rgba(255,69,0,0.55)',
    gradient:
      'linear-gradient(90deg, #FF4500, #FF6A2A)',
  },

  'Other (Direct)': {
    color: '#A855F7',
    glow: 'rgba(168,85,247,0.55)',
    gradient:
      'linear-gradient(90deg, #A855F7, #C084FC)',
  },

  Other: {
    color: '#A855F7',
    glow: 'rgba(168,85,247,0.55)',
    gradient:
      'linear-gradient(90deg, #A855F7, #C084FC)',
  },
};

// ==========================================
// LOADING DATA
// ==========================================

const loadingPlatforms = [
  {
    name: 'YouTube',
    percentage: 65,
  },
  {
    name: 'Instagram',
    percentage: 15,
  },
  {
    name: 'TikTok',
    percentage: 10,
  },
  {
    name: 'Facebook',
    percentage: 7,
  },
  {
    name: 'LinkedIn',
    percentage: 3,
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const PlatformBreakdown = ({
  loading = false,
  result = null,
}) => {
  // ========================================
  // VALIDATION
  // ========================================

  const hasValidData =
    result &&
    Number(result.predictedViews) > 0 &&
    Array.isArray(result.platformBreakdown) &&
    result.platformBreakdown.length > 0;

  const isLoading = loading || !hasValidData;

  // ========================================
  // TOTAL VIEWS
  // ========================================

  const totalViews = hasValidData
    ? Number(result.predictedViews)
    : 0;

  // ========================================
  // PLATFORM DATA
  // ========================================

  const platformsData = useMemo(() => {
    if (!hasValidData) {
      return loadingPlatforms.map((platform) => {
        const style =
          platformStyles[platform.name] ||
          platformStyles.Other;

        return {
          ...platform,
          views: 0,
          color: style.color,
          glow: style.glow,
          gradient: style.gradient,
        };
      });
    }

    return result.platformBreakdown
      .map((platform) => {
        const style =
          platformStyles[platform.name] ||
          platformStyles.Other;

        const percentage = Math.max(
          0,
          Number(platform.percentage) || 0
        );

        const backendViews = Number(platform.views);

        const calculatedViews =
          Number.isFinite(backendViews) &&
          backendViews > 0
            ? backendViews
            : totalViews * (percentage / 100);

        return {
          ...platform,
          percentage,
          views: calculatedViews,
          color: style.color,
          glow: style.glow,
          gradient: style.gradient,
        };
      })
      .filter(
        (platform) => platform.percentage > 0
      );
  }, [
    hasValidData,
    result,
    totalViews,
  ]);

  // ========================================
  // DONUT SETTINGS
  // ========================================

  /*
   * Desktop:
   * 210px
   *
   * Mobile:
   * 165px
   */

  const size = 210;

  const radius = 82;

  const strokeWidth = 20;

  // ========================================
  // DONUT TOTAL
  // ========================================

  const rawTotal = useMemo(() => {
    return platformsData.reduce(
      (sum, platform) =>
        sum +
        Math.max(
          0,
          Number(platform.percentage) || 0
        ),
      0
    );
  }, [platformsData]);

  // ========================================
  // DONUT SEGMENTS
  // ========================================

  const donutSegments = useMemo(() => {
    if (!platformsData.length) {
      return [];
    }

    const safeTotal =
      rawTotal > 0 ? rawTotal : 100;

    /*
     * Gap in percentage units.
     *
     * Small enough to keep the circle
     * visually full.
     */

    const gap = 0.8;

    let accumulated = 0;

    return platformsData.map(
      (platform, index) => {
        const percentage =
          (Number(platform.percentage) /
            safeTotal) *
          100;

        const segmentLength = Math.max(
          percentage - gap,
          0.15
        );

        const start =
          accumulated + gap / 2;

        accumulated += percentage;

        return {
          ...platform,
          index,
          percentage,
          segmentLength,
          offset: -start,
        };
      }
    );
  }, [
    platformsData,
    rawTotal,
  ]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
        ease: 'easeOut',
      }}
      className="
        relative
        w-full
        h-full
        rounded-[22px]
        overflow-hidden
        border
        border-purple-500/25
        bg-[#0B0820]
        px-4
        py-5
        sm:px-6
        sm:py-6
        shadow-[0_0_40px_rgba(139,92,246,0.10)]
      "
    >

      {/* ================================= */}
      {/* AMBIENT GLOWS */}
      {/* ================================= */}

      <div
        className="
          absolute
          -top-28
          left-10
          w-64
          h-64
          rounded-full
          bg-purple-600/10
          blur-[90px]
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          -bottom-28
          right-10
          w-64
          h-64
          rounded-full
          bg-blue-600/10
          blur-[90px]
          pointer-events-none
        "
      />

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          gap-2.5
          mb-5
        "
      >

        <motion.div
          animate={{
            opacity: [0.55, 1, 0.55],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="
            w-3
            h-3
            rounded-full
            bg-[#A855F7]
            shadow-[0_0_12px_#A855F7]
            shrink-0
          "
        />

        <h3
          className="
            text-[16px]
            sm:text-[18px]
            font-semibold
            text-white
            tracking-tight
          "
        >
          Platform Breakdown
        </h3>

      </div>

      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      <div
        className="
          relative
          z-10
          flex
          flex-col
          sm:flex-row
          items-center
          sm:items-center
          justify-center
          sm:justify-between
          gap-7
          sm:gap-6
          w-full
          min-h-[270px]
        "
      >

        {/* ================================= */}
        {/* DONUT */}
        {/* ================================= */}

        <div
          className="
            relative
            shrink-0
            w-[165px]
            h-[165px]
            sm:w-[210px]
            sm:h-[210px]
          "
        >

          <svg
            width={size}
            height={size}
            viewBox="0 0 210 210"
            className="
              absolute
              inset-0
              w-full
              h-full
              overflow-visible
            "
          >

            {/* BACKGROUND */}

            <circle
              cx="105"
              cy="105"
              r={radius}
              fill="none"
              stroke="rgba(139,92,246,0.08)"
              strokeWidth={strokeWidth}
            />

            {/* SEGMENTS */}

            <g
              transform="
                rotate(-90 105 105)
              "
            >

              {isLoading ? (

                <motion.circle
                  cx="105"
                  cy="105"
                  r={radius}
                  fill="none"
                  stroke="rgba(168,85,247,0.28)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="butt"
                  pathLength="100"
                  strokeDasharray="72 100"
                  animate={{
                    strokeDashoffset: [
                      0,
                      -100,
                    ],
                    opacity: [
                      0.3,
                      0.8,
                      0.3,
                    ],
                  }}
                  transition={{
                    strokeDashoffset: {
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'linear',
                    },
                    opacity: {
                      duration: 1.5,
                      repeat: Infinity,
                    },
                  }}
                />

              ) : (

                donutSegments.map(
                  (platform, index) => (
                    <motion.circle
                      key={`${platform.name}-${index}`}
                      cx="105"
                      cy="105"
                      r={radius}
                      fill="none"
                      stroke={platform.color}
                      strokeWidth={strokeWidth}
                      strokeLinecap="butt"
                      pathLength="100"

                      strokeDasharray={`
                        ${platform.segmentLength}
                        100
                      `}

                      initial={{
                        strokeDasharray:
                          `0 100`,
                        strokeDashoffset:
                          platform.offset,
                        opacity: 0,
                      }}

                      animate={{
                        strokeDasharray:
                          `${platform.segmentLength} 100`,
                        strokeDashoffset:
                          platform.offset,
                        opacity: 1,
                      }}

                      transition={{
                        strokeDasharray: {
                          duration: 1.2,
                          delay: index * 0.08,
                          ease: [
                            0.16,
                            1,
                            0.3,
                            1,
                          ],
                        },

                        strokeDashoffset: {
                          duration: 1.2,
                          delay: index * 0.08,
                          ease: [
                            0.16,
                            1,
                            0.3,
                            1,
                          ],
                        },

                        opacity: {
                          duration: 0.3,
                          delay: index * 0.08,
                        },
                      }}

                      style={{
                        filter: `
                          drop-shadow(
                            0 0 6px
                            ${platform.glow}
                          )
                        `,
                      }}
                    />
                  )
                )

              )}

            </g>

          </svg>

          {/* ================================= */}
          {/* CENTER */}
          {/* ================================= */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
          >

            <AnimatePresence mode="wait">

              {isLoading ? (

                <motion.div
                  key="loading"
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  className="
                    flex
                    flex-col
                    items-center
                    gap-2
                  "
                >

                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="
                      relative
                      w-8
                      h-8
                    "
                  >

                    {[...Array(8)].map(
                      (_, i) => (
                        <motion.div
                          key={i}
                          className="
                            absolute
                            w-[5px]
                            h-[5px]
                            rounded-full
                            bg-[#A855F7]
                            shadow-[0_0_7px_#A855F7]
                          "
                          style={{
                            left: '50%',
                            top: '50%',
                            transform:
                              `translate(-50%,-50%)
                               rotate(${i * 45}deg)
                               translateY(-12px)`,
                          }}
                          animate={{
                            opacity: [
                              0.2,
                              1,
                              0.2,
                            ],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.08,
                          }}
                        />
                      )
                    )}

                  </motion.div>

                  <span
                    className="
                      text-[11px]
                      text-purple-300
                      font-medium
                    "
                  >
                    Analyzing...
                  </span>

                </motion.div>

              ) : (

                <motion.div
                  key="result"
                  initial={{
                    opacity: 0,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.55,
                  }}
                  className="
                    flex
                    flex-col
                    items-center
                  "
                >

                  <span
                    className="
                      text-[11px]
                      text-gray-400
                    "
                  >
                    Total
                  </span>

                  <span
                    className="
                      text-[28px]
                      sm:text-[34px]
                      font-bold
                      text-white
                      leading-none
                      my-1
                      tracking-tight
                    "
                  >
                    <AnimatedNumber
                      value={totalViews}
                    />
                  </span>

                  <span
                    className="
                      text-[11px]
                      text-gray-400
                    "
                  >
                    Views
                  </span>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

        </div>

        {/* ================================= */}
        {/* PLATFORM LIST */}
        {/* ================================= */}

        <div
          className="
            w-full
            sm:flex-1
            sm:min-w-0
            sm:max-w-[430px]
            flex
            flex-col
            gap-3
          "
        >

          {platformsData.map(
            (platform, index) => (

              <motion.div
                key={`${platform.name}-${index}`}
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.07,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1,
                  ],
                }}

                /*
                 * IMPORTANT:
                 *
                 * grid-template-columns:
                 *
                 * icon
                 * name
                 * progress
                 * percentage
                 * views
                 *
                 * The numbers ALWAYS have their own
                 * fixed columns.
                 */

                className="
                  grid
                  grid-cols-[14px_68px_minmax(45px,1fr)_38px_48px]
                  sm:grid-cols-[14px_82px_minmax(70px,1fr)_42px_58px]
                  items-center
                  gap-2
                  sm:gap-2.5
                  w-full
                  min-w-0
                  px-1
                  py-1
                  rounded-lg
                  hover:bg-white/[0.025]
                  transition-colors
                "
              >

                {/* ICON */}

                <motion.div
                  animate={
                    isLoading
                      ? {
                          opacity: [
                            0.35,
                            0.7,
                            0.35,
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="
                    w-[13px]
                    h-[13px]
                    rounded-[4px]
                    shrink-0
                  "
                  style={{
                    backgroundColor:
                      isLoading
                        ? '#24174D'
                        : platform.color,

                    boxShadow:
                      isLoading
                        ? 'none'
                        : `0 0 9px ${platform.glow}`,
                  }}
                />

                {/* NAME */}

                <span
                  className="
                    min-w-0
                    w-full
                    truncate
                    text-[11px]
                    sm:text-[12px]
                    font-medium
                    text-gray-200
                  "
                >
                  {platform.name}
                </span>

                {/* ================================= */}
                {/* PROGRESS */}
                {/* ================================= */}

<div
                  className="
                    relative
                    w-full
                    min-w-0
                    h-[8px]
                    rounded-full
                    overflow-hidden
                    bg-[#17112F]
                    border
                    border-white/[0.06]
                  "
                >

                  <div
                    className="
                      absolute
                      inset-0
                      bg-white/[0.015]
                    "
                  />

                  {isLoading ? (

                    <motion.div
                      initial={{
                        x: '-120%',
                      }}
                      animate={{
                        x: '220%',
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: index * 0.12,
                      }}
                      className="
                        absolute
                        top-0
                        bottom-0
                        w-1/2
                        rounded-full
                        bg-gradient-to-r
                        from-transparent
                        via-purple-500/30
                        to-transparent
                      "
                    />

                  ) : (

                    <motion.div
                      initial={{
                        width: '0%', // تم حل المشكلة هنا بتغيير 0 إلى '0%'
                      }}
                      animate={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            platform.percentage
                          )
                        )}%`,
                      }}
                      transition={{
                        duration: 1.25,
                        delay: index * 0.08,
                        ease: [
                          0.16,
                          1,
                          0.3,
                          1,
                        ],
                      }}
                      className="
                        relative
                        h-full
                        rounded-full
                        overflow-hidden
                      "
                      style={{
                        background:
                          platform.gradient,

                        boxShadow:
                          `0 0 8px ${platform.glow}`,
                      }}
                    >

                      <motion.div
                        initial={{
                          x: '-120%',
                        }}
                        animate={{
                          x: '300%',
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                          delay:
                            1 +
                            index * 0.1,
                        }}
                        className="
                          absolute
                          inset-0
                          w-1/3
                          bg-gradient-to-r
                          from-transparent
                          via-white/25
                          to-transparent
                          skew-x-12
                        "
                      />

                    </motion.div>

                  )}

                </div>

                {/* ================================= */}
                {/* PERCENTAGE */}
                {/* ================================= */}

                <div
                  className="
                    w-full
                    text-right
                    whitespace-nowrap
                    overflow-hidden
                  "
                >

                  {isLoading ? (

                    <motion.span
                      animate={{
                        opacity: [
                          0.35,
                          0.8,
                          0.35,
                        ],
                      }}
                      transition={{
                        duration: 1.3,
                        repeat: Infinity,
                        delay: index * 0.08,
                      }}
                      className="
                        block
                        text-[10px]
                        sm:text-[11px]
                        font-bold
                        text-white/40
                      "
                    >
                      --%
                    </motion.span>

                  ) : (

                    <span
                      className="
                        block
                        text-[10px]
                        sm:text-[11px]
                        font-bold
                        text-white
                      "
                    >
                      <AnimatedNumber
                        value={platform.percentage}
                        isPercentage
                      />
                    </span>

                  )}

                </div>

                {/* ================================= */}
                {/* VIEWS */}
                {/* ================================= */}

                <div
                  className="
                    w-full
                    text-right
                    whitespace-nowrap
                    overflow-hidden
                  "
                >

                  {isLoading ? (

                    <span
                      className="
                        block
                        text-[8px]
                        sm:text-[9px]
                        text-gray-600
                      "
                    >
                      --.-K
                    </span>

                  ) : (

                    <span
                      className="
                        block
                        text-[8px]
                        sm:text-[10px]
                        text-gray-400
                      "
                    >
                      (
                      <AnimatedNumber
                        value={platform.views}
                      />
                      )
                    </span>

                  )}

                </div>

              </motion.div>

            )
          )}

        </div>

      </div>

      {/* ================================= */}
      {/* FOOTER */}
      {/* ================================= */}

      <div
        className="
          relative
          z-10
          mt-3
          flex
          items-center
          justify-center
          gap-2
          text-[8px]
          uppercase
          tracking-[0.14em]
          text-gray-600
        "
      >

        <motion.span
          animate={{
            opacity: [
              0.35,
              1,
              0.35,
            ],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
          }}
          className="
            w-1.5
            h-1.5
            rounded-full
            bg-purple-500
            shrink-0
          "
        />

        <span className="truncate">
          {isLoading
            ? 'Generating platform data'
            : 'AI predicted platform distribution'}
        </span>

      </div>

    </motion.div>
  );
};

export default PlatformBreakdown;