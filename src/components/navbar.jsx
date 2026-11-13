import React, { useRef, useState } from "react";
import {
  Home,
  Grid2x2,
  Focus,
  User,
  ChevronDown,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState(null);

  const focusTimer = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  /* =========================================================
     Focus Style
  ========================================================= */

  const handleFocusStyle = (item) => {
    setFocusedItem(item);

    if (focusTimer.current) {
      clearTimeout(focusTimer.current);
    }

    focusTimer.current = setTimeout(() => {
      setFocusedItem(null);
    }, 2000);
  };

  /* =========================================================
     Navigation
  ========================================================= */

  const goTo = (path, item) => {
    handleFocusStyle(item);
    navigate(path);
    setIsOpen(false);
  };

  /* =========================================================
     Active Route
  ========================================================= */

  const isActive = (path) => {
    return location.pathname === path;
  };

  /* =========================================================
     Focus State
  ========================================================= */

  const isFocused = (item) => {
    return focusedItem === item;
  };

  /* =========================================================
     Nav Button Styles
  ========================================================= */

  const activeStyle = `
    relative h-10 border
    border-violet-300/[0.16]
    bg-gradient-to-r from-violet-500/[0.15]
    via-fuchsia-500/[0.09]
    to-blue-500/[0.06]
    text-white
    shadow-[0_7px_24px_rgba(124,58,237,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]
  `;

  const focusStyle = `
    relative h-10 border
    border-violet-300/[0.14]
    bg-gradient-to-r from-violet-500/[0.12]
    via-fuchsia-500/[0.07]
    to-blue-500/[0.05]
    text-white
    shadow-[0_7px_24px_rgba(124,58,237,0.10),inset_0_1px_0_rgba(255,255,255,0.05)]
  `;

  const normalStyle = `
    relative h-10 border border-transparent
    text-[#8f94b8]
    hover:border-white/[0.055]
    hover:bg-white/[0.028]
    hover:text-white
    hover:shadow-[0_7px_22px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.025)]
  `;

  const navButton = (active, focused) => `
    group
    flex cursor-pointer items-center gap-2
    rounded-xl px-3
    text-[12px] font-medium tracking-[-0.01em]
    transition-all duration-300
    focus:outline-none
    ${active ? activeStyle : focused ? focusStyle : normalStyle}
  `;

  /* =========================================================
     Icon Wrapper
  ========================================================= */

  const iconWrapper = (active, focused) => `
    relative flex h-7 w-7 shrink-0 items-center justify-center
    rounded-lg border transition-all duration-300
    ${
      active
        ? `
          border-blue-300/15
          bg-blue-400/[0.08]
          text-blue-200
          shadow-[0_0_16px_rgba(96,165,250,0.14)]
        `
        : focused
        ? `
          border-violet-300/15
          bg-violet-400/[0.07]
          text-violet-200
          shadow-[0_0_18px_rgba(139,92,246,0.14)]
        `
        : `
          border-white/[0.04]
          bg-white/[0.018]
          text-slate-500
          group-hover:border-violet-400/12
          group-hover:bg-violet-400/[0.055]
          group-hover:text-violet-200
        `
    }
  `;

  return (
    <nav className="fixed left-0  right-0 top-2.5 z-50 w-full px-2.5 sm:px-4 lg:px-6">
      {/* =====================================================
          Main Navbar
      ===================================================== */}

      <div
        className="
          relative mx-auto h-[68px] w-full max-w-[1700px]
          overflow-hidden rounded-[20px]
          border border-white/[0.075]
          bg-[#050611]/76
          backdrop-blur-2xl
          shadow-[0_12px_45px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.055)]
        "
      >
        {/* Top Light */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />

        {/* Purple Glow */}
        <div className="pointer-events-none absolute left-[20%] top-[-25px] h-[90px] w-[44%] bg-violet-500/[0.04] blur-3xl" />

        {/* Blue Glow */}
        <div className="pointer-events-none absolute right-[4%] top-[-25px] h-[90px] w-[24%] bg-blue-500/[0.03] blur-3xl" />

        {/* Ambient Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.04),transparent_30%)]" />

        <div className="relative flex h-full items-center justify-between px-[clamp(10px,1.8vw,26px)]">
          {/* =================================================
              Logo
          ================================================= */}

          <div
            onClick={() => goTo("/home", "home")}
            className="group flex min-w-0 shrink-0 cursor-pointer items-center gap-2"
          >
            <div className="relative flex h-[clamp(38px,3.2vw,48px)] w-[clamp(38px,3.2vw,48px)] shrink-0 cursor-pointer items-center justify-center">
              {/* Logo Glow */}
              <div className="pointer-events-none absolute inset-[-8px] rounded-full bg-violet-500/[0.08] blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <img
                src="/HLogo.png"
                alt="Techook Studio"
                className="
                  relative z-10 cursor-pointer object-contain
                  h-[clamp(32px,3.8vw,62px)]
                  w-[clamp(32px,3.8vw,62px)]
                  drop-shadow-[0_0_10px_rgba(139,92,246,0.32)]
                  transition-all duration-300
                  group-hover:scale-105
                  group-hover:drop-shadow-[0_0_14px_rgba(139,92,246,0.48)]
                "
              />
            </div>

            <span className="hidden cursor-pointer whitespace-nowrap text-[clamp(13px,1vw,16px)] font-bold tracking-[-0.02em] text-white transition-all duration-300 group-hover:text-violet-200 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.16)] sm:block">
              Techook Studio
            </span>
          </div>

          {/* =================================================
              Desktop Navigation
          ================================================= */}

          <div className="hidden items-center gap-0.5 lg:flex">
            {/* Home */}
            <button
              type="button"
              onClick={() => goTo("/home", "home")}
              onFocus={() => handleFocusStyle("home")}
              className={navButton(isActive("/home"), isFocused("home"))}
            >
              {(isActive("/home") || isFocused("home")) && (
                <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
              )}

              <span className={iconWrapper(isActive("/home"), isFocused("home"))}>
                <Home size={18} strokeWidth={1.8} />
              </span>

              <span className="relative z-10 cursor-pointer">Home</span>
            </button>

            {/* Features */}
            <button
              type="button"
              onClick={() => goTo("/Features", "features")}
              onFocus={() => handleFocusStyle("features")}
              className={navButton(isActive("/Features"), isFocused("features"))}
            >
              {(isActive("/Features") || isFocused("features")) && (
                <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
              )}

              <span className={iconWrapper(isActive("/Features"), isFocused("features"))}>
                <Grid2x2 size={18} strokeWidth={1.8} />
              </span>

              <span className="relative z-10 cursor-pointer">Features</span>

              <ChevronDown
                size={13}
                strokeWidth={1.8}
                className="ml-[-2px] cursor-pointer text-[#555a7d] transition-all duration-300 group-hover:rotate-180 group-hover:text-violet-300"
              />
            </button>

            {/* Tools */}
            <button
              type="button"
              onClick={() => handleFocusStyle("tools")}
              onFocus={() => handleFocusStyle("tools")}
              className={navButton(false, isFocused("tools"))}
            >
              {isFocused("tools") && (
                <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
              )}

              <span className={iconWrapper(false, isFocused("tools"))}>
                <Focus size={18} strokeWidth={1.8} />
              </span>

              <span className="relative z-10 cursor-pointer">Tools</span>

              <ChevronDown
                size={13}
                strokeWidth={1.8}
                className="ml-[-2px] cursor-pointer text-[#555a7d] transition-all duration-300 group-hover:rotate-180 group-hover:text-violet-300"
              />
            </button>

            {/* Pricing */}
            <button
              type="button"
              onClick={() => handleFocusStyle("pricing")}
              onFocus={() => handleFocusStyle("pricing")}
              className={navButton(false, isFocused("pricing"))}
            >
              {isFocused("pricing") && (
                <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
              )}

              <span className="relative z-10 cursor-pointer">Pricing</span>
            </button>

            {/* About */}
            <button
              type="button"
              onClick={() => handleFocusStyle("about")}
              onFocus={() => handleFocusStyle("about")}
              className={navButton(false, isFocused("about"))}
            >
              {isFocused("about") && (
                <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
              )}

              <span className="relative z-10 cursor-pointer">About Us</span>
            </button>

            {/* History */}
            <button
              type="button"
              onClick={() => handleFocusStyle("history")}
              onFocus={() => handleFocusStyle("history")}
              className={navButton(false, isFocused("history"))}
            >
              {isFocused("history") && (
                <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
              )}

              <span className="relative z-10 cursor-pointer">History</span>
            </button>
          </div>

          {/* =================================================
              Right Side
          ================================================= */}

          <div className="hidden items-center lg:flex">
            <div className="mx-2.5 h-7 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent xl:mx-4" />

            {/* Login */}
            <button
              type="button"
              onFocus={() => handleFocusStyle("login")}
              className={navButton(false, isFocused("login"))}
              onClick={() => navigate("/profile")}
            >
              {isFocused("login") && (
                <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
              )}

              <span className={iconWrapper(false, isFocused("login"))}>
                <User size={18} strokeWidth={1.8} />
              </span>

              <span className="relative z-10 cursor-pointer">Log In</span>
            </button>

            {/* Start Creating */}
            <button
              type="button"
              onClick={() => handleFocusStyle("create")}
              onFocus={() => handleFocusStyle("create")}
              className="
                group relative ml-2 flex h-10 cursor-pointer items-center
                gap-2 overflow-hidden rounded-xl
                bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600
                px-4 text-[12px] font-semibold text-white
                shadow-[0_8px_28px_rgba(99,102,241,0.28)]
                transition-all duration-300
                hover:-translate-y-[1px]
                hover:shadow-[0_12px_38px_rgba(124,58,237,0.42)]
                focus:outline-none
              "
            >
              {/* Soft Glow */}
              <span className="pointer-events-none absolute -inset-3 rounded-2xl bg-violet-500/10 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Shine */}
              <span className="pointer-events-none absolute inset-y-0 -left-[105%] w-[75%] rotate-[14deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[125%]" />

              {/* Top Highlight */}
              <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              <Rocket
                size={17}
                strokeWidth={1.9}
                className="relative z-10 cursor-pointer transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />

              <span className="relative z-10 cursor-pointer whitespace-nowrap">
                Start Creating
              </span>
            </button>
          </div>

          {/* =================================================
              Mobile Menu Button
          ================================================= */}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="
              relative flex h-10 w-10 cursor-pointer items-center
              justify-center rounded-xl border border-white/[0.07]
              bg-white/[0.03] text-[#9b9fbd]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
              transition-all duration-300
              hover:border-violet-400/18
              hover:bg-violet-500/[0.07]
              hover:text-white
              focus:outline-none lg:hidden
            "
          >
            <Menu
              size={21}
              strokeWidth={1.8}
              className={`
                absolute cursor-pointer transition-all duration-300
                ${isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}
              `}
            />

            <X
              size={21}
              strokeWidth={1.8}
              className={`
                absolute cursor-pointer text-violet-300 transition-all duration-300
                ${isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}
              `}
            />
          </button>
        </div>
      </div>

      {/* =====================================================
          Mobile Menu
      ===================================================== */}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="
              relative mx-auto mt-2.5 w-full max-w-[700px]
              overflow-hidden rounded-[20px]
              border border-white/[0.075]
              bg-[#050611]/92
              shadow-[0_18px_55px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.045)]
              backdrop-blur-2xl lg:hidden
            "
          >
            {/* Purple Glow */}
            <div className="pointer-events-none absolute left-[10%] top-[-30px] h-[120px] w-[80%] bg-violet-500/[0.035] blur-3xl" />

            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.04,
                  },
                },
              }}
              className="relative p-3"
            >
              <MobileItem
                icon={<Home size={18} strokeWidth={1.8} />}
                label="Home"
                active={isActive("/home")}
                focused={isFocused("home")}
                onClick={() => goTo("/home", "home")}
                onFocus={() => handleFocusStyle("home")}
              />

              <MobileItem
                icon={<Grid2x2 size={18} strokeWidth={1.8} />}
                label="Features"
                active={isActive("/Features")}
                focused={isFocused("features")}
                onClick={() => goTo("/Features", "features")}
                onFocus={() => handleFocusStyle("features")}
                arrow
              />

              <MobileItem
                icon={<Focus size={18} strokeWidth={1.8} />}
                label="Tools"
                active={false}
                focused={isFocused("tools")}
                onClick={() => handleFocusStyle("tools")}
                onFocus={() => handleFocusStyle("tools")}
                arrow
              />

              <MobileItem
                label="Pricing"
                active={false}
                focused={isFocused("pricing")}
                onClick={() => handleFocusStyle("pricing")}
                onFocus={() => handleFocusStyle("pricing")}
              />

              <MobileItem
                label="About Us"
                active={false}
                focused={isFocused("about")}
                onClick={() => handleFocusStyle("about")}
                onFocus={() => handleFocusStyle("about")}
              />

              <MobileItem
                label="History"
                active={false}
                focused={isFocused("history")}
                onClick={() => handleFocusStyle("history")}
                onFocus={() => handleFocusStyle("history")}
              />

              <div className="my-2.5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              <MobileItem
                icon={<User size={18} strokeWidth={1.8} />}
                label="Log In"
                active={false}
                focused={isFocused("login")}
                onClick={() => handleFocusStyle("login")}
                onFocus={() => handleFocusStyle("login")}
              />

              <motion.button
                type="button"
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show: { opacity: 1, y: 0 },
                }}
                onClick={() => handleFocusStyle("create")}
                onFocus={() => handleFocusStyle("create")}
                className="
                  group relative mt-2 flex h-10 w-full cursor-pointer
                  items-center justify-center gap-2 overflow-hidden
                  rounded-xl
                  bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600
                  text-xs font-semibold text-white
                  shadow-[0_8px_25px_rgba(99,102,241,0.25)]
                  transition-all duration-300
                  hover:-translate-y-[1px]
                  hover:shadow-[0_12px_34px_rgba(124,58,237,0.38)]
                  active:scale-[0.985]
                  focus:outline-none
                "
              >
                <span className="pointer-events-none absolute inset-y-0 -left-[100%] w-[70%] rotate-[14deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[125%]" />

                <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                <Rocket size={17} strokeWidth={1.9} className="relative z-10 cursor-pointer" />

                <span className="relative z-10 cursor-pointer whitespace-nowrap">
                  Start Creating
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* =========================================================
   Mobile Item
========================================================= */

function MobileItem({
  icon,
  label,
  active,
  focused,
  onClick,
  onFocus,
  arrow = false,
}) {
  const highlighted = active || focused;

  return (
    <motion.button
      type="button"
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      onClick={onClick}
      onFocus={onFocus}
      className={`
        group relative mt-0.5 flex min-h-10 w-full cursor-pointer
        items-center gap-2.5 overflow-hidden rounded-xl
        border px-3 text-left text-xs font-medium
        transition-all duration-300 focus:outline-none

        ${
          active
            ? `
              border-violet-400/[0.13]
              bg-gradient-to-r
              from-violet-500/[0.13]
              via-fuchsia-500/[0.08]
              to-blue-500/[0.06]
              text-white
              shadow-[0_6px_20px_rgba(124,58,237,0.10)]
            `
            : focused
            ? `
              border-violet-400/[0.12]
              bg-violet-500/[0.075]
              text-white
              shadow-[0_6px_20px_rgba(124,58,237,0.09)]
            `
            : `
              border-transparent
              text-[#8f94b8]
              hover:border-white/[0.045]
              hover:bg-white/[0.028]
              hover:text-white
            `
        }
      `}
    >
      {/* Active / Focus Indicator */}
      {highlighted && (
        <span className="pointer-events-none absolute left-1 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-fuchsia-400 via-violet-400 to-blue-400 shadow-[0_0_8px_rgba(167,139,250,0.35)]" />
      )}

      {/* Icon */}
      {icon && (
        <span
          className={`
            relative z-10 flex h-7 w-7 shrink-0 cursor-pointer
            items-center justify-center rounded-lg border
            transition-all duration-300

            ${
              highlighted
                ? `
                  border-violet-400/12
                  bg-violet-400/[0.07]
                  text-blue-300
                  shadow-[0_0_14px_rgba(124,58,237,0.10)]
                `
                : `
                  border-white/[0.035]
                  bg-white/[0.018]
                  text-slate-500
                  group-hover:border-violet-400/10
                  group-hover:bg-violet-500/[0.05]
                  group-hover:text-violet-300
                `
            }
          `}
        >
          {icon}
        </span>
      )}

      <span className="relative z-10 cursor-pointer">{label}</span>

      {arrow && (
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className="relative z-10 ml-auto cursor-pointer text-[#555a7d] transition-all duration-300 group-hover:rotate-180 group-hover:text-violet-300"
        />
      )}
    </motion.button>
  );
}