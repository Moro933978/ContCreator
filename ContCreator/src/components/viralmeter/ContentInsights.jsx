import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  BrainCircuit,
  ArrowUpRight,
} from "lucide-react";

const ContentInsights = ({ loading = false, result = null }) => {
  const [copied, setCopied] = useState(false);

  // -----------------------------------------
  // GET REAL BACKEND INSIGHTS
  // -----------------------------------------

  const backendInsights =
    result?.insights ||
    result?.contentInsights ||
    result?.data?.insights ||
    [];

  // Make sure we always have an array
  const insights = Array.isArray(backendInsights)
    ? backendInsights
        .filter((item) => typeof item === "string" && item.trim())
        .map((item, index) => ({
          type:
            index === backendInsights.length - 1
              ? "warning"
              : "positive",
          text: getInsightTitle(item),
          detail: item,
        }))
    : [];

  // -----------------------------------------
  // SUGGESTION FROM BACKEND
  // -----------------------------------------

// -----------------------------------------
// AI SUGGESTION
// -----------------------------------------
console.log(
  "🔥 FULL CONTENT INSIGHTS RESULT:",
  JSON.stringify(result, null, 2)
);
  const suggestion =
  result?.suggestion ||
  result?.recommendation ||
  result?.contentSuggestion ||
  "";

const handleCopySuggestion = async () => {
  const text = suggestion || result?.insights?.join("\n") || "";

  if (!text) {
    console.warn("There is no content to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  } catch (error) {
    console.error("Copy failed:", error);

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();

    document.execCommand("copy");

    document.body.removeChild(textarea);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }
};

  // -----------------------------------------
  // LOADING STATE
  // -----------------------------------------

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          relative
          w-full
          min-h-[360px]
          h-full
          overflow-hidden
          rounded-[24px]
          border border-purple-500/20
          bg-gradient-to-br
          from-[#171034]
          via-[#0F0A25]
          to-[#080615]
          p-5 sm:p-6
          shadow-[0_20px_60px_rgba(124,58,237,0.12)]
        "
      >
        {/* Ambient Glow */}

        <div
          className="
            absolute
            -top-24
            -right-24
            w-48
            h-48
            rounded-full
            bg-purple-600/20
            blur-[80px]
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            -bottom-24
            -left-24
            w-48
            h-48
            rounded-full
            bg-fuchsia-600/10
            blur-[80px]
            pointer-events-none
          "
        />

        {/* Subtle Grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            pointer-events-none
          "
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(168,85,247,0.8) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(168,85,247,0.8) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Header */}

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="
                w-3
                h-3
                rounded-full
                bg-purple-400
                shadow-[0_0_15px_rgba(168,85,247,0.9)]
              "
            />

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Content Insights
              </h3>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  mt-1
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  text-purple-300/70
                "
              >
                <BrainCircuit className="w-3 h-3" />
                AI Analysis
              </div>
            </div>
          </div>

          {/* AI Icon */}

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              w-7
              h-7
              rounded-lg
              border
              border-purple-400/20
              bg-purple-500/10
              flex
              items-center
              justify-center
            "
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          </motion.div>
        </div>

        {/* AI SCANNING AREA */}

        <div className="relative z-10 mt-10">
          <div
            className="
              relative
              h-32
              rounded-2xl
              border
              border-purple-400/10
              bg-white/[0.02]
              overflow-hidden
            "
          >
            {/* Scanner */}

            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                absolute
                top-0
                bottom-0
                w-1/3
                bg-gradient-to-r
                from-transparent
                via-purple-500/20
                to-transparent
                blur-xl
              "
            />

            {/* Fake Analysis Lines */}

            <div
              className="
                absolute
                inset-0
                p-5
                flex
                flex-col
                justify-center
                gap-3
              "
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <div
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-purple-500/40
                      shrink-0
                    "
                  />

                  <motion.div
                    animate={{
                      opacity: [0.25, 0.7, 0.25],
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: item * 0.15,
                    }}
                    className="
                      h-2
                      rounded-full
                      bg-purple-400/20
                    "
                    style={{
                      width: `${70 - item * 12}%`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Loading Text */}

            <div
              className="
                absolute
                bottom-3
                left-0
                right-0
                text-center
                text-[10px]
                uppercase
                tracking-[0.2em]
                text-purple-300/60
              "
            >
              AI is analyzing your content...
            </div>
          </div>
        </div>

        {/* Processing Status */}

        <div
          className="
            absolute
            bottom-5
            left-5
            right-5
            flex
            items-center
            justify-between
            text-[10px]
            text-gray-500
          "
        >
          <span>Generating insights</span>

          <motion.span
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
            }}
            className="text-purple-400"
          >
            ● PROCESSING
          </motion.span>
        </div>
      </motion.div>
    );
  }

  // -----------------------------------------
  // EMPTY STATE
  // -----------------------------------------

  if (!insights.length) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          relative
          w-full
          min-h-[360px]
          h-full
          overflow-hidden
          rounded-[24px]
          border
          border-purple-500/20
          bg-gradient-to-br
          from-[#171034]
          via-[#0F0A25]
          to-[#080615]
          p-5 sm:p-6
          shadow-[0_20px_60px_rgba(124,58,237,0.12)]
        "
      >
        <div
          className="
            absolute
            -top-24
            -right-24
            w-52
            h-52
            rounded-full
            bg-purple-600/15
            blur-[90px]
          "
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="
                w-3
                h-3
                rounded-full
                bg-purple-400
                shadow-[0_0_14px_rgba(168,85,247,0.9)]
              "
            />

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Content Insights
              </h3>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  mt-1
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  text-purple-300/60
                "
              >
                <Sparkles className="w-3 h-3" />
                AI Analysis
              </div>
            </div>
          </div>

          <div
            className="
              h-[260px]
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-purple-500/10
                border
                border-purple-500/20
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <BrainCircuit
                size={24}
                className="text-purple-400"
              />
            </div>

            <h4 className="text-white font-semibold">
              Waiting for Analysis
            </h4>

            <p className="text-xs text-gray-500 mt-2 max-w-[230px]">
              Generate your prediction to receive AI-powered content
              insights.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // -----------------------------------------
  // RESULT STATE
  // -----------------------------------------

  return (
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
      }}
      className="
        group
        relative
        w-full
        min-h-[360px]
        h-full
        overflow-visible
        rounded-[24px]
        border
        border-purple-500/20
        bg-gradient-to-br
        from-[#171034]
        via-[#0F0A25]
        to-[#080615]
        p-5 sm:p-6
        shadow-[0_20px_60px_rgba(124,58,237,0.12)]
      "
    >
      {/* Ambient Glow */}

      <div
        className="
          absolute
          -top-24
          -right-24
          w-52
          h-52
          rounded-full
          bg-purple-600/15
          blur-[90px]
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          -bottom-28
          -left-20
          w-48
          h-48
          rounded-full
          bg-blue-600/10
          blur-[80px]
          pointer-events-none
        "
      />

      {/* Top Shine */}

      <div
        className="
          absolute
          top-0
          left-10
          right-10
          h-px
          bg-gradient-to-r
          from-transparent
          via-purple-400/40
          to-transparent
        "
      />

      {/* ----------------------------------------- */}
      {/* HEADER */}
      {/* ----------------------------------------- */}

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              relative
              w-3
              h-3
              rounded-full
              bg-purple-400
              shadow-[0_0_14px_rgba(168,85,247,0.9)]
            "
          >
            <div
              className="
                absolute
                inset-[-4px]
                rounded-full
                border
                border-purple-400/20
              "
            />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Content Insights
            </h3>

            <div
              className="
                flex
                items-center
                gap-1.5
                mt-1
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-purple-300/60
              "
            >
              <Sparkles className="w-3 h-3" />
              AI Generated
            </div>
          </div>
        </div>

        {/* Ready Badge */}

        <div
          className="
            flex
            items-center
            gap-1.5
            px-2.5
            py-1.5
            rounded-full
            border
            border-green-400/10
            bg-green-400/[0.04]
            text-[10px]
            text-green-400
            font-medium
          "
        >
          <span
            className="
              w-1.5
              h-1.5
              rounded-full
              bg-green-400
              shadow-[0_0_7px_rgba(34,197,94,0.8)]
            "
          />

          READY
        </div>
      </div>

      {/* ----------------------------------------- */}
      {/* INSIGHTS */}
      {/* ----------------------------------------- */}

      <div className="relative z-20 mt-7 space-y-3">
        <AnimatePresence>
          {insights.map((item, index) => {
            const positive = item.type === "positive";

            return (
              <motion.div
                key={`${item.text}-${index}`}
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
                className="
                  group/item
                  relative
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-white/[0.04]
                  bg-white/[0.015]
                  px-3
                  py-3
                  transition-all
                  duration-300
                  hover:bg-white/[0.035]
                  hover:border-purple-400/15
                "
              >
                {/* Icon */}

                <div
                  className={`
                    relative
                    w-8
                    h-8
                    rounded-lg
                    shrink-0
                    flex
                    items-center
                    justify-center
                    ${
                      positive
                        ? "bg-green-500/[0.08] border border-green-400/10"
                        : "bg-orange-500/[0.08] border border-orange-400/10"
                    }
                  `}
                >
                  {positive ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                  )}
                </div>

                {/* Text */}

                <div className="min-w-0 flex-1">
                  {/* Short title */}

                  <div className="text-xs sm:text-sm font-medium text-gray-200 truncate">
                    {item.text}
                  </div>

                  {/* Short Preview */}

                  <div className="relative mt-0.5">
                    <div
                      className="
                        text-[10px]
                        text-gray-500
                        truncate
                        pr-2
                      "
                    >
                      {item.detail}
                    </div>

                    {/* -------------------------------- */}
                    {/* FULL TEXT HOVER PANEL */}
                    {/* -------------------------------- */}

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 6,
                        scale: 0.97,
                      }}
                      className="
                        pointer-events-none
                        absolute
                        left-0
                        top-[calc(100%+8px)]
                        z-[100]

                        w-[280px]

                        rounded-xl
                        border
                        border-purple-400/20

                        bg-[#0F0A25]/95
                        backdrop-blur-xl

                        px-4
                        py-3

                        shadow-[0_20px_50px_rgba(0,0,0,0.55)]

                        opacity-0
                        invisible

                        group-hover/item:opacity-100
                        group-hover/item:visible
                        group-hover/item:translate-y-[-2px]

                        transition-all
                        duration-200
                      "
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles
                          className="
                            w-3
                            h-3
                            mt-0.5
                            shrink-0
                            text-purple-400
                          "
                        />

                        <p
                          className="
                            text-[10px]
                            leading-relaxed
                            text-gray-300
                          "
                        >
                          {item.detail}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Hover Arrow */}

                <ArrowUpRight
                  className="
                    w-3.5
                    h-3.5
                    text-gray-600
                    opacity-0
                    group-hover/item:opacity-100
                    transition-opacity
                  "
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ----------------------------------------- */}
      {/* DIVIDER */}
      {/* ----------------------------------------- */}

      <div
        className="
          relative
          z-10
          mt-5
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/[0.08]
          to-transparent
        "
      />

      {/* ----------------------------------------- */}
      {/* COPY SUGGESTION */}
      {/* ----------------------------------------- */}

      <motion.button
        type="button"
        onClick={handleCopySuggestion}
        whileHover={{
          y: -2,
        }}
        whileTap={{
          scale: 0.98,
        }}
        className={`
          relative
          z-10
          mt-5
          w-full
          h-12
          rounded-xl
          border
          overflow-hidden
          flex
          items-center
          justify-center
          gap-2.5
          font-medium
          text-sm
          transition-all
          duration-300

          ${
            copied
              ? "border-green-400/20 bg-green-400/[0.06] text-green-300"
              : "border-purple-400/15 bg-purple-500/[0.04] text-white hover:border-purple-400/30 hover:bg-purple-500/[0.08]"
          }
        `}
      >
        {/* Button Glow */}

        {!copied && (
          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              inset-y-0
              w-1/3
              bg-gradient-to-r
              from-transparent
              via-white/[0.04]
              to-transparent
              skew-x-12
            "
          />
        )}

        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="copied"
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -5,
              }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Copied to clipboard
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -5,
              }}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4 text-purple-300" />
              Copy Suggestion
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ----------------------------------------- */}
      {/* FOOTER */}
      {/* ----------------------------------------- */}

      <div
        className="
          relative
          z-10
          mt-3
          flex
          items-center
          justify-center
          gap-1.5
          text-[9px]
          uppercase
          tracking-[0.16em]
          text-gray-600
        "
      >
        <Sparkles className="w-3 h-3 text-purple-500/60" />

        Powered by Viral Meter AI
      </div>
    </motion.div>
  );
};

// =============================================
// HELPER
// =============================================

function getInsightTitle(text) {
  if (!text || typeof text !== "string") {
    return "AI Insight";
  }

  const normalized = text.toLowerCase();

  if (
    normalized.includes("hook") ||
    normalized.includes("opening")
  ) {
    return "Hook Analysis";
  }

  if (
    normalized.includes("replay") ||
    normalized.includes("watch again") ||
    normalized.includes("retention")
  ) {
    return "Replay Potential";
  }

  if (
    normalized.includes("audience") ||
    normalized.includes("topic")
  ) {
    return "Audience Relevance";
  }

  if (
    normalized.includes("cta") ||
    normalized.includes("call-to-action") ||
    normalized.includes("call to action")
  ) {
    return "CTA Recommendation";
  }

  if (
    normalized.includes("cannot be analyzed") ||
    normalized.includes("gibberish") ||
    normalized.includes("random characters")
  ) {
    return "Content Quality";
  }

  if (
    normalized.includes("recommend") ||
    normalized.includes("review")
  ) {
    return "AI Recommendation";
  }

  return "AI Insight";
}

export default ContentInsights;