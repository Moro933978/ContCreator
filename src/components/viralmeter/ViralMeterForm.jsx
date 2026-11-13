import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, AlertCircle, Loader2 } from 'lucide-react';

// --- SOCIAL ICONS WITH BRAND STYLING ---
const SocialIcons = {
  YouTube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="url(#ig-grad)" className="w-4 h-4">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="50%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#8134AF" />
        </linearGradient>
      </defs>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  TikTok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-500">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
};

// --- CARD ARCHITECTURE ---
const Card = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, type: 'spring', stiffness: 100 }}
    className={`bg-gradient-to-br from-[#1B143F] via-[#120D2B] to-[#0D091F] border border-purple-500/20 rounded-[22px] shadow-[0_10px_35px_rgba(139,92,246,0.12)] relative overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

// --- PLATFORM BUTTON COMPONENT ---
const PlatformButton = ({ platform, selected, onClick }) => {
  const Icon = SocialIcons[platform];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border cursor-pointer ${
        selected
          ? 'bg-white/[0.08] border-purple-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
          : 'bg-transparent border-white/[0.04] text-gray-400 hover:bg-white/[0.02] hover:text-white'
      }`}
    >
      <span>
        <Icon />
      </span>
      {platform}
    </motion.button>
  );
};

// --- MAIN FORM COMPONENT ---
const ViralMeterForm = ({ loading = false, onAnalyze }) => {
  const [content, setContent] = useState('');
  const [activePlatform, setActivePlatform] = useState('YouTube');
  const [validationErrors, setValidationErrors] = useState({});
  const textareaRef = useRef(null);

  // Auto-resize textarea handler
  const handleTextarea = (e) => {
    const value = e.target.value;
    setContent(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(128, textareaRef.current.scrollHeight)}px`;
    }

    if (validationErrors.content) {
      setValidationErrors((prev) => ({ ...prev, content: undefined }));
    }
  };

  const handlePlatformChange = (platform) => {
    setActivePlatform(platform);
    if (validationErrors.platform) {
      setValidationErrors((prev) => ({ ...prev, platform: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      errors.content = 'Content is required to generate viral predictions.';
    } else if (trimmedContent.length < 15) {
      errors.content = 'Please enter at least 15 characters for an accurate analysis.';
    } else if (trimmedContent.length > 5000) {
      errors.content = 'Content must not exceed 5000 characters.';
    }

    if (!activePlatform) {
      errors.platform = 'Please select a target platform.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    if (validateForm() && typeof onAnalyze === "function") {
      onAnalyze({
        content: content.trim(),
        platform: activePlatform,
      });
    }
  };

  return (
    <Card delay={0.1} className="h-full flex flex-col p-6 sm:p-8 w-full">
      <form onSubmit={handleSubmit} noValidate className="h-full flex flex-col justify-between">
        <div className="flex-1 space-y-8">
          {/* Step 1: Content Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 shrink-0 rounded-full bg-[#6D28D9] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.8)] border border-purple-400/40">
                1
              </div>
              <div className="flex flex-col">
                <label htmlFor="viral-content-input" className="text-sm font-semibold text-white leading-tight cursor-pointer">
                  Enter Your Content
                </label>
                <p className="text-[11px] text-gray-400">
                  Paste your post, video title, or script
                </p>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="viral-content-input"
                ref={textareaRef}
                value={content}
                onChange={handleTextarea}
                maxLength={5000}
                disabled={loading}
                aria-invalid={!!validationErrors.content}
                aria-describedby={validationErrors.content ? 'content-error' : undefined}
                className={`w-full min-h-[8rem] bg-[#121024] border rounded-xl p-4 text-sm text-gray-200 focus:outline-none transition-all duration-200 resize-none placeholder:text-gray-500 ${
                  validationErrors.content
                    ? 'border-rose-500/60 focus:border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                    : 'border-white/[0.04] focus:border-[#7C3AED]/50 focus:shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                }`}
                placeholder="Type or paste your content here..."
              />
              <div className="absolute bottom-3 right-4 text-[10px] text-gray-500 pointer-events-none">
                {content.length} / 5000
              </div>
            </div>

            <AnimatePresence>
              {validationErrors.content && (
                <motion.div
                  id="content-error"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-rose-400 text-xs font-medium pl-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationErrors.content}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 2: Platform Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 shrink-0 rounded-full bg-[#6D28D9] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.8)] border border-purple-400/40">
                2
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-white leading-tight">
                  Select Platform
                </h3>
                <p className="text-[11px] text-gray-400">
                  Choose the platform you're posting on
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select Platform">
              {Object.keys(SocialIcons).map((platform) => (
                <PlatformButton
                  key={platform}
                  platform={platform}
                  selected={activePlatform === platform}
                  onClick={() => handlePlatformChange(platform)}
                />
              ))}
            </div>

            <AnimatePresence>
              {validationErrors.platform && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-rose-400 text-xs font-medium pl-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationErrors.platform}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8 shrink-0 mt-auto">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            className={`w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm text-white font-medium transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] ${
              loading
                ? "opacity-80 cursor-not-allowed"
                : "hover:brightness-110 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Analyze & Predict</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </Card>
  );
};

export default ViralMeterForm;