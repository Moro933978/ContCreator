import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const API_URL =
  "https://cont-creator-3uvg.vercel.app/api/generate-content";

const viralHooksList = [
  "Stop wasting hours editing... AI can do it in minutes.",
  "99% of creators fail because they ignore this one simple growth rule.",
  "I tested 50 AI tools so you don't have to. Here are the top 3.",
  "How to grow from 0 to 10k followers using automated AI workflows.",
  "The secret formula behind viral TikTok & Reels explained in 30s.",
  "Stop doing manual content planning. Let AI build your 30-day calendar.",
  "Why your videos are getting 0 views (And how to fix it today).",
  "The exact prompt I used to generate 1M+ views last month.",
  "Want to build a personal brand? Steal my exact content blueprint.",
  "Don't post your next video until you watch this 10-second warning.",
  "How to write high-converting hooks that stop the scroll instantly.",
  "The hidden AI feature top creators are sleeping on right now.",
  "From zero to hero: How I automated my entire social media pipeline.",
  "Three content mistakes that are secretly killing your organic reach.",
  "Turn a single tweet into a full week of viral video scripts.",
  "Why top influencers secretly use AI tools behind the scenes.",
  "Stop guessing what works. Use this data-driven viral framework.",
  "How to script a 60-second video that keeps people hooked till the end.",
  "The ultimate workflow to 10x your content output with zero burnout.",
  "If you want to go viral on Instagram or TikTok this week, watch this.",
];

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

/* ================= 3D TILT FLOATING CARD ================= */

function TiltCard({
  className = "",
  children,
  delay = 0,
  y = 10,
  rotate = 0,
}) {
  const x = useMotionValue(0);
  const yRot = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(yRot);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["12deg", "-12deg"]
  );

  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-12deg", "12deg"]
  );

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    yRot.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    yRot.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ rotateZ: rotate }}
      animate={{
        y: [0, -y, 0],
        rotateZ: [rotate, rotate + 0.6, rotate],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`
        rounded-[26px] overflow-hidden cursor-pointer
        bg-gradient-to-br from-[#121635]/85 via-[#0b0e24]/90 to-[#050714]/95
        backdrop-blur-3xl
        shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)]
        hover:shadow-[0_30px_90px_rgba(139,92,246,0.35),inset_0_1px_2px_rgba(255,255,255,0.25)]
        transition-shadow duration-500 group
        ${className}
      `}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="pointer-events-none absolute -right-12 -top-12 w-36 h-36 rounded-full bg-purple-500/20 blur-3xl group-hover:bg-purple-500/40 transition-all duration-700" />

      <div className="pointer-events-none absolute -left-12 -bottom-12 w-36 h-36 rounded-full bg-blue-500/15 blur-3xl group-hover:bg-blue-500/35 transition-all duration-700" />

      <div className="pointer-events-none absolute -left-36 top-0 h-full w-28 rotate-[25deg] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent blur-md opacity-0 group-hover:left-[150%] group-hover:opacity-100 transition-all duration-1000" />

      <div
        className="relative z-10 h-full"
        style={{ transform: "translateZ(30px)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({ icon, value, label, i }) {
  return (
    <motion.div
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={fadeUp}
      whileHover={{ y: -8, scale: 1.025 }}
      className="group relative flex items-center gap-4 sm:gap-5 min-w-[200px] sm:min-w-[210px] flex-1 px-5 sm:px-6 py-4 sm:py-5 rounded-3xl transition-all duration-500 cursor-pointer overflow-hidden bg-white/[0.015] hover:bg-white/[0.045] shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.25)] text-left"
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/15 via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.10] to-white/[0.02] text-purple-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-500 group-hover:scale-110 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
        <div className="absolute inset-0 rounded-2xl bg-purple-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10">{icon}</div>
      </div>

      <div className="relative z-15 text-left">
        <div className="text-2xl sm:text-[28px] font-black tracking-tight text-white leading-none group-hover:text-purple-200 transition-colors">
          {value}
        </div>

        <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400 font-semibold group-hover:text-slate-200 transition-colors">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

/* ================= MAIN APP ================= */

export default function App() {
  const [hookCopied, setHookCopied] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [nicheInput, setNicheInput] = useState("");

  const [isGeneratingModal, setIsGeneratingModal] = useState(false);

  const [generatedHookResult, setGeneratedHookResult] = useState("");

  const [generatedPost, setGeneratedPost] = useState("");

  const [generatedCTA, setGeneratedCTA] = useState("");

  const [generatedHashtags, setGeneratedHashtags] = useState([]);

  const [generatedViralScore, setGeneratedViralScore] = useState(null);

  const [generationError, setGenerationError] = useState("");

  const [currentHookIndex, setCurrentHookIndex] = useState(() =>
    Math.floor(Math.random() * viralHooksList.length)
  );

  const [viralScore, setViralScore] = useState(94);

  useEffect(() => {
    const hookTimer = setInterval(() => {
      setCurrentHookIndex(
        (prev) => (prev + 1) % viralHooksList.length
      );
    }, 5000);

    const scoreTimer = setInterval(() => {
      setViralScore((prev) =>
        prev === 94 ? 98 : prev === 98 ? 96 : 94
      );
    }, 4000);

    return () => {
      clearInterval(hookTimer);
      clearInterval(scoreTimer);
    };
  }, []);

  const [mousePos, setMousePos] = useState({
    x: -1000,
    y: -1000,
  });

  const [isHoveredBtn, setIsHoveredBtn] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  /* ================= COPY FUNCTION ================= */

  const copyHook = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setHookCopied(true);

      setTimeout(() => {
        setHookCopied(false);
      }, 1600);
    } catch (error) {
      console.error("Clipboard error:", error);
    }
  };

  /* ================= REAL AI GENERATOR ================= */

  const handleGenerateAI = async (e) => {
    e.preventDefault();

    if (!nicheInput.trim() || isGeneratingModal) return;

    setIsGeneratingModal(true);

    setGeneratedHookResult("");
    setGeneratedPost("");
    setGeneratedCTA("");
    setGeneratedHashtags([]);
    setGeneratedViralScore(null);
    setGenerationError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          idea: nicheInput.trim(),

          targetAudience: "Social media audience",

          tone: "Engaging",

          platform: "Instagram",

          contentStyle: "Hook and social media post",

          contentLength: "Short",

          include: [],
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Server error: ${response.status}`
        );
      }

      const data = result.data;

      if (!data) {
        throw new Error("The server returned an empty response.");
      }

      setGeneratedHookResult(
        data.hook || "No hook was generated."
      );

      setGeneratedPost(data.post || "");

      setGeneratedCTA(data.callToAction || "");

      setGeneratedHashtags(
        Array.isArray(data.hashtags) ? data.hashtags : []
      );

      setGeneratedViralScore(
        typeof data.viralScore === "number"
          ? data.viralScore
          : null
      );
    } catch (error) {
      console.error("Content generation error:", error);

      setGenerationError(
        error.message ||
          "Something went wrong while generating content."
      );
    } finally {
      setIsGeneratingModal(false);
    }
  };

  /* ================= RESET MODAL ================= */

  const closeModal = () => {
    if (isGeneratingModal) return;

    setIsModalOpen(false);
    setNicheInput("");

    setGeneratedHookResult("");
    setGeneratedPost("");
    setGeneratedCTA("");
    setGeneratedHashtags([]);
    setGeneratedViralScore(null);

    setGenerationError("");
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[#020308] text-white antialiased flex flex-col items-center cursor-default"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ULTRA CUSTOM GLOW CURSOR */}

      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-50 rounded-full bg-purple-500/40 blur-xl mix-blend-screen hidden lg:block"
        animate={{
          x: mousePos.x - (isHoveredBtn ? 60 : 35),
          y: mousePos.y - (isHoveredBtn ? 60 : 35),
          width: isHoveredBtn ? 120 : 70,
          height: isHoveredBtn ? 120 : 70,
          backgroundColor: isHoveredBtn
            ? "rgba(168, 85, 247, 0.5)"
            : "rgba(59, 130, 246, 0.3)",
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 250,
          mass: 0.5,
        }}
      />

      {/* DYNAMIC SPOTLIGHT & GRID PATTERN */}

      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-70 transition-opacity duration-300 hidden sm:block"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(147, 51, 234, 0.16), rgba(37, 99, 235, 0.08) 40%, transparent 80%)`,
        }}
      />

      {/* BACKGROUND AMBIENT LAYER */}

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#020308]/85 backdrop-blur-[3px]" />

        <div className="absolute left-[50%] top-[20%] h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-purple-800/[0.18] to-blue-600/[0.12] blur-[140px] sm:blur-[180px]" />

        <div
          className="absolute bottom-0 left-0 right-0 h-[60%] opacity-[0.48] mix-blend-screen"
          style={{
            backgroundImage:
              "url('/ffb2a79c-34d1-4633-b88a-6bc142fc1ed4.png')",
            backgroundPosition: "center bottom",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            maskImage:
              "linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.95) 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.95) 50%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-[1380px] px-4 sm:px-7 lg:px-10 pt-12 sm:pt-10 pb-8 flex flex-col items-start">
        <section className="grid min-h-auto lg:min-h-[720px] items-center gap-10 lg:gap-8 grid-cols-1 lg:grid-cols-[0.95fr_1.15fr] w-full">

          {/* LEFT CONTENT */}

          <div className="flex flex-col items-start justify-center text-left">

            {/* BADGE */}

            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0}
              onMouseEnter={() => setIsHoveredBtn(true)}
              onMouseLeave={() => setIsHoveredBtn(false)}
              className="mb-6 sm:mb-8 inline-flex items-center gap-3 rounded-full bg-white/[0.035] hover:bg-white/[0.08] px-4 sm:px-5 py-2 sm:py-2.5 shadow-[0_0_35px_rgba(139,92,246,0.22),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-3xl transition-all duration-300 cursor-pointer text-left"
            >
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 animate-pulse shrink-0">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </span>

              <span className="text-xs font-bold text-slate-200 sm:text-sm tracking-wide">
                Next-Gen AI Creator Suite
              </span>
            </motion.div>

            {/* TITLE */}

            <motion.h1
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={2}
              className="mb-5 sm:mb-6 font-black tracking-[-0.04em] text-white text-[34px] leading-[1.2] sm:text-5xl lg:text-[4.4rem] xl:text-[5rem] text-left"
            >
              <span className="block lg:whitespace-nowrap">
                Create Content
              </span>

              <span className="block lg:whitespace-nowrap">
                People{" "}
                <span className="bg-gradient-to-r from-[#c488ff] via-[#9333ea] to-[#3b82f6] bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(168,85,247,0.5)]">
                  Actually
                </span>
              </span>

              <span className="block lg:whitespace-nowrap">
                Stop Scrolling For
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={3}
              className="mb-7 sm:mb-9 max-w-[520px] text-[15px] sm:text-[18px] leading-7 sm:leading-8 text-slate-400 text-left"
            >
              All the best AI tools for creators in one place. Generate
              hooks, stories, images, ideas and complete content plans
              <span className="font-bold text-purple-300">
                {" "}
                — in seconds.
              </span>
            </motion.p>

            {/* ACTION BUTTONS */}

            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={4}
              className="flex w-full flex-col sm:flex-row items-stretch sm:items-center gap-4 text-left"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                onMouseEnter={() => setIsHoveredBtn(true)}
                onMouseLeave={() => setIsHoveredBtn(false)}
                className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 sm:px-8 py-4 sm:py-4.5 text-sm font-extrabold text-white shadow-[0_15px_45px_rgba(79,70,229,0.4)] hover:shadow-[0_25px_65px_rgba(147,51,234,0.65)] transition-all duration-500 hover:-translate-y-1.5 active:translate-y-0"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 shrink-0"
                >
                  <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z" />
                  <path d="M12 17v-4" />
                  <path d="m9 12 3-3 3 3" />
                </svg>

                <span className="relative tracking-wide">
                  Generate My First Post
                </span>
              </button>

              {/* <button
                onClick={() => setIsModalOpen(true)}
                onMouseEnter={() => setIsHoveredBtn(true)}
                onMouseLeave={() => setIsHoveredBtn(false)}
                className="group flex items-center justify-center gap-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] px-6 sm:px-8 py-4 sm:py-4.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_45px_rgba(255,255,255,0.12)] backdrop-blur-3xl transition-all duration-300 hover:-translate-y-1.5"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:scale-125 group-hover:text-purple-300 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon
                    points="10 8 16 12 10 16 10 8"
                    fill="currentColor"
                  />
                </svg>

                Watch Demo
              </button> */}
            </motion.div>
          </div>

          {/* VISUAL SECTION */}

          <div className="relative h-[560px] sm:h-[620px] lg:h-[660px] select-none w-full mt-6 lg:mt-0">

            {/* CENTRAL 3D ASSET */}

            <motion.div
              className="absolute left-1/2 top-[48%] z-[8] w-[320px] sm:w-[440px] lg:w-[560px] -translate-x-1/2 -translate-y-1/2"
              animate={{ y: [0, -14, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] sm:h-[380px] sm:w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.22] blur-[100px] sm:blur-[120px]" />

              <img
                src="/ChatGPT Image Jun 19, 2026, 05_26_10 PM.png"
                alt="Techook Central AI"
                className="relative z-10 w-full scale-110 sm:scale-[1.2] object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.75)] drop-shadow-[0_0_90px_rgba(147,51,234,0.5)]"
              />
            </motion.div>

            {/* INSTAGRAM ICON */}

            <motion.div
              className="absolute left-[5%] sm:left-[29%] top-[4%] sm:top-[9%] z-30 scale-85 sm:scale-100"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 4, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="relative flex h-[60px] w-[60px] sm:h-[72px] sm:w-[72px] items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-[1px] shadow-[0_15px_45px_rgba(236,72,153,0.45)] hover:scale-115 transition-transform duration-300 cursor-pointer">
                <div className="flex h-full w-full items-center justify-center rounded-[21px] bg-[#070914]">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#igGradient)"
                    strokeWidth="1.8"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* TIKTOK ICON */}

            <motion.div
              className="absolute right-[5%] sm:right-[19%] top-[4%] sm:top-[8%] z-30 scale-85 sm:scale-100"
              animate={{ y: [0, -11, 0] }}
              transition={{
                duration: 4.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            >
              <div className="flex h-[60px] w-[60px] sm:h-[72px] sm:w-[72px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[#121b30] to-[#060812] shadow-[0_15px_45px_rgba(0,0,0,0.7)] hover:scale-115 transition-transform duration-300 cursor-pointer">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  <path d="M15 8a4 4 0 0 0 4-4" />
                </svg>
              </div>
            </motion.div>

            {/* YOUTUBE ICON */}

            <motion.div
              className="absolute left-[2%] sm:left-[12%] top-[42%] sm:top-[45%] z-30 scale-85 sm:scale-100 hidden xs:block"
              animate={{
                y: [0, -8, 0],
                rotate: [0, -4, 0],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <div className="flex h-[56px] w-[64px] sm:h-[66px] sm:w-[78px] items-center justify-center rounded-[22px] bg-gradient-to-br from-red-500 to-red-600 shadow-[0_15px_45px_rgba(239,68,68,0.4)] hover:scale-115 transition-transform duration-300 cursor-pointer">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z" />
                  <polygon
                    points="9.75,8.25 16,12 9.75,15.75"
                    fill="#ef4444"
                  />
                </svg>
              </div>
            </motion.div>

            {/* X ICON */}

            <motion.div
              className="absolute right-[2%] sm:right-[13%] top-[43%] sm:top-[48%] z-30 scale-85 sm:scale-100 hidden xs:block"
              animate={{ y: [0, -9, 0] }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="flex h-[54px] w-[58px] sm:h-[64px] sm:w-[68px] items-center justify-center rounded-[22px] bg-[#060812] shadow-[0_15px_45px_rgba(0,0,0,0.7)] hover:scale-115 transition-transform duration-300 cursor-pointer">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                >
                  <path d="M4 4l11.733 16h4.267l-11.733-16z" />
                  <path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772" />
                </svg>
              </div>
            </motion.div>

            {/* VIRAL SCORE CARD */}

            <TiltCard
              className="absolute left-[0%] sm:left-[1%] top-[18%] sm:top-[17%] w-[150px] sm:w-[190px] p-3.5 sm:p-5 scale-90 sm:scale-100"
              delay={0}
              y={9}
              rotate={-4}
            >
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] font-bold text-slate-200">
                  Viral Score
                </span>

                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_#38bdf8] animate-ping" />
              </div>

              <div className="relative mx-auto flex h-[85px] w-[85px] sm:h-[105px] sm:w-[105px] items-center justify-center">
                <div className="absolute inset-2 rounded-full bg-cyan-400/[0.12] blur-xl" />

                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full -rotate-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="39"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="5"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="39"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="5"
                    strokeDasharray="245"
                    strokeDashoffset="15"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="relative flex flex-col items-center">
                  <motion.span
                    key={viralScore}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[22px] sm:text-[26px] font-extrabold leading-none text-white"
                  >
                    {viralScore}%
                  </motion.span>

                  <span className="mt-1 text-[8px] sm:text-[9px] font-bold text-purple-300">
                    Live AI
                  </span>
                </div>
              </div>
            </TiltCard>

            {/* HOOK READY CARD */}

            <TiltCard
              className="absolute right-[0%] top-[19%] w-[155px] sm:w-[195px] p-3.5 sm:p-5 scale-90 sm:scale-100"
              delay={0.6}
              y={8}
              rotate={4}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] font-bold text-slate-200">
                  Hook Ready
                </span>

                <span className="text-[10px] text-slate-500">×</span>
              </div>

              <p className="mb-3 sm:mb-4 text-[9px] sm:text-[10px] text-slate-400 font-semibold">
                Generated
              </p>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="h-1.5 sm:h-2 w-full rounded-full bg-gradient-to-r from-purple-500/60 to-purple-800/30" />

                <div className="h-1.5 sm:h-2 w-[82%] rounded-full bg-gradient-to-r from-blue-500/60 to-blue-800/30" />

                <div className="h-1.5 sm:h-2 w-[62%] rounded-full bg-gradient-to-r from-slate-700/60 to-slate-800/30" />
              </div>

              <div className="mt-3 sm:mt-4 flex justify-end">
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.7)]">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            </TiltCard>

            {/* TRENDING TOPICS */}

            <TiltCard
              className="absolute left-[0%] sm:left-[2%] top-[61%] w-[155px] sm:w-[195px] p-3.5 sm:p-5 scale-90 sm:scale-100"
              delay={0.35}
              y={8}
              rotate={-3}
            >
              <p className="mb-3 sm:mb-4 text-[11px] sm:text-[12px] font-bold text-slate-200">
                Trending Topics
              </p>

              <div className="space-y-2 sm:space-y-3">
                {[
                  "AI Tools",
                  "Content Strategy",
                  "YouTube Growth",
                ].map((topic, index) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between text-[9.5px] sm:text-[10px] font-semibold text-slate-300"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6]" />

                      {topic}
                    </span>

                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={index === 1 ? "#22c55e" : "#38bdf8"}
                      strokeWidth="2.5"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                ))}
              </div>
            </TiltCard>

            {/* BEST TIME CARD */}

            <TiltCard
              className="absolute right-[0%] top-[62%] w-[160px] sm:w-[200px] p-3.5 sm:p-5 scale-90 sm:scale-100"
              delay={0.8}
              y={7}
              rotate={4}
            >
              <p className="text-[11px] sm:text-[12px] font-bold text-slate-200">
                Best Time to Post
              </p>

              <p className="mb-3 sm:mb-4 mt-1 text-[9.5px] sm:text-[10px] text-slate-400 font-semibold">
                Today, 7:00 PM
              </p>

              <div className="flex h-12 sm:h-14 items-end gap-1 sm:gap-1.5">
                {[40, 58, 42, 78, 50, 100, 68].map(
                  (height, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t-md transition-all duration-300 ${
                        index === 5
                          ? "bg-gradient-to-t from-blue-700 to-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.75)]"
                          : "bg-gradient-to-t from-purple-700/40 to-blue-500/50"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>
            </TiltCard>

            {/* LIVE AI HOOK CARD */}

            <TiltCard
              className="absolute left-[14%] sm:left-[37%] top-[74%] sm:top-[72%] z-40 w-[250px] sm:w-[330px] p-4 sm:p-6 shadow-[0_35px_100px_rgba(147,51,234,0.45)] scale-90 sm:scale-100"
              delay={0.2}
              y={5}
              rotate={2}
            >
              <div className="relative z-10 text-left">
                <div className="mb-2.5 sm:mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <p className="text-[12px] sm:text-[13px] font-bold text-slate-100">
                      Live AI Hook
                    </p>

                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[8px] sm:text-[9px] font-bold text-purple-300 animate-pulse">
                      Auto-Rotating ⚡
                    </span>
                  </div>

                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_#a855f7]" />
                </div>

                <div className="min-h-[46px] sm:min-h-[52px] mb-3 sm:mb-4 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentHookIndex}
                      initial={{
                        opacity: 0,
                        y: 10,
                        filter: "blur(4px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                        filter: "blur(4px)",
                      }}
                      transition={{ duration: 0.4 }}
                      className="text-[12.5px] sm:text-[13.5px] leading-5 sm:leading-6 font-medium text-slate-200 text-left"
                    >
                      "{viralHooksList[currentHookIndex]}"
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      copyHook(viralHooksList[currentHookIndex])
                    }
                    className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] px-3 sm:px-4 py-1.5 sm:py-2 text-[10.5px] sm:text-[11px] font-bold text-slate-200 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {hookCopied ? (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>

                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                          />

                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>

                        Copy Hook <span className="text-blue-400">✓</span>
                      </>
                    )}
                  </button>

                  <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-mono">
                    {currentHookIndex + 1} / {viralHooksList.length}
                  </span>
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* STATS SECTION */}

        {/* <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative mb-10 mt-12 sm:mt-6 overflow-hidden rounded-[32px] bg-white/[0.02] hover:bg-white/[0.035] px-4 sm:px-8 lg:px-12 py-6 sm:py-7 shadow-[0_30px_90px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-3xl transition-colors duration-500 w-full"
        >
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              i={0}
              value="12K+"
              label="Happy Creators"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />

            <StatCard
              i={1}
              value="2.4M+"
              label="Contents Generated"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <path d="M8 6h8" />
                  <path d="M8 10h8" />
                  <path d="M8 14h5" />
                  <path d="M9 22v-4h6v4" />
                </svg>
              }
            />

            <StatCard
              i={2}
              value="98%"
              label="Saved Time"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              }
            />

            <StatCard
              i={3}
              value="30%+"
              label="More Engagement"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              }
            />
          </div>
        </motion.section> */}
      </div>

      {/* AI GENERATOR MODAL */}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 py-6 overflow-y-auto"
          >
            <motion.div
              initial={{
                scale: 0.88,
                opacity: 0,
                y: 25,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.88,
                opacity: 0,
                y: 25,
              }}
              className="relative w-full max-w-lg my-auto rounded-[32px] bg-gradient-to-br from-[#151a36] via-[#090c20] to-[#040614] p-6 sm:p-9 shadow-[0_30px_120px_rgba(147,51,234,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] text-left max-h-[90vh] overflow-y-auto"
            >
              {/* CLOSE BUTTON */}

              <button
                onClick={closeModal}
                disabled={isGeneratingModal}
                className="absolute right-5 sm:right-6 top-5 sm:top-6 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/15 hover:text-white transition-colors disabled:opacity-30"
              >
                ✕
              </button>

              {/* MODAL HEADER */}

              <div className="mb-6 sm:mb-7 flex items-center gap-4 pr-8">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] text-lg sm:text-xl shrink-0">
                  ✨
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    AI Post & Hook Studio
                  </h3>

                  <p className="text-xs text-slate-400 font-semibold">
                    Powered by Gemini AI
                  </p>
                </div>
              </div>

              {/* INPUT FORM */}

              <form
                onSubmit={handleGenerateAI}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2.5">
                    What is your niche or topic?
                  </label>

                  <input
                    type="text"
                    value={nicheInput}
                    onChange={(e) => setNicheInput(e.target.value)}
                    placeholder="e.g. Fitness for developers, Real Estate AI, Tech Hacks..."
                    className="w-full rounded-2xl bg-white/[0.05] focus:bg-white/[0.09] px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 transition-all font-medium"
                    required
                    disabled={isGeneratingModal}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingModal || !nicheInput.trim()}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 sm:py-4 text-sm font-extrabold text-white shadow-[0_10px_35px_rgba(79,70,229,0.4)] transition-all hover:opacity-95 hover:shadow-[0_15px_45px_rgba(147,51,234,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingModal
                    ? "Generating with Gemini AI..."
                    : "✨ Generate Now"}
                </button>
              </form>

              {/* LOADING */}

              {isGeneratingModal && (
                <div className="mt-6 sm:mt-7 flex flex-col items-center justify-center py-5 space-y-3">
                  <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-purple-500 border-t-transparent" />

                  <p className="text-xs font-bold text-purple-300 animate-pulse">
                    Gemini AI is generating your content...
                  </p>

                  <p className="text-[10px] text-slate-500">
                    This may take a few seconds.
                  </p>
                </div>
              )}

              {/* ERROR */}

              {generationError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-left"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-red-400">⚠</span>

                    <span className="text-xs font-bold text-red-300">
                      Generation Failed
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-red-200/90 break-words">
                    {generationError}
                  </p>

                  <button
                    type="button"
                    onClick={() => setGenerationError("")}
                    className="mt-3 text-xs font-bold text-red-300 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}

              {/* GENERATED RESULT */}

              {generatedHookResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 sm:mt-7 space-y-4 text-left"
                >
                  {/* VIRAL SCORE */}

                  {generatedViralScore !== null && (
                    <div className="flex items-center justify-between rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
                      <div>
                        <p className="text-xs font-bold text-purple-300">
                          AI Viral Score
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Generated by Gemini AI
                        </p>
                      </div>

                      <div className="text-2xl font-black text-white">
                        {generatedViralScore}%
                      </div>
                    </div>
                  )}

                  {/* HOOK */}

                  <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-purple-300">
                        Generated Hook
                      </span>

                      <button
                        type="button"
                        onClick={() => copyHook(generatedHookResult)}
                        className="shrink-0 text-xs font-bold text-blue-400 hover:text-white transition-colors"
                      >
                        {hookCopied ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {generatedHookResult}
                    </p>
                  </div>

                  {/* POST */}

                  {generatedPost && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-purple-300">
                          Generated Post
                        </span>

                        <button
                          type="button"
                          onClick={() => copyHook(generatedPost)}
                          className="shrink-0 text-xs font-bold text-blue-400 hover:text-white transition-colors"
                        >
                          Copy
                        </button>
                      </div>

                      <p className="text-sm text-slate-200 leading-7 whitespace-pre-wrap">
                        {generatedPost}
                      </p>
                    </div>
                  )}

                  {/* CALL TO ACTION */}

                  {generatedCTA && (
                    <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                      <p className="mb-2 text-xs font-bold text-blue-300">
                        Call To Action
                      </p>

                      <p className="text-sm text-slate-200 leading-relaxed">
                        {generatedCTA}
                      </p>
                    </div>
                  )}

                  {/* HASHTAGS */}

                  {generatedHashtags.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-purple-300">
                          Hashtags
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            copyHook(generatedHashtags.join(" "))
                          }
                          className="text-xs font-bold text-blue-400 hover:text-white transition-colors"
                        >
                          Copy All
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {generatedHashtags.map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-200"
                          >
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COPY EVERYTHING */}

                  <button
                    type="button"
                    onClick={() =>
                      copyHook(
                        [
                          `HOOK:\n${generatedHookResult}`,
                          generatedPost
                            ? `POST:\n${generatedPost}`
                            : "",
                          generatedCTA
                            ? `CALL TO ACTION:\n${generatedCTA}`
                            : "",
                          generatedHashtags.length
                            ? `HASHTAGS:\n${generatedHashtags.join(" ")}`
                            : "",
                        ]
                          .filter(Boolean)
                          .join("\n\n")
                      )
                    }
                    className="w-full rounded-2xl border border-purple-400/20 bg-white/[0.05] py-3.5 text-sm font-bold text-white hover:bg-purple-500/15 transition-all"
                  >
                    {hookCopied ? "Copied Successfully! ✓" : "Copy Full Content"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG GRADIENT DEFINITIONS */}

      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <linearGradient
            id="igGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient
            id="scoreGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}