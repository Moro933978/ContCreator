
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import ContentForm from "./contentgenerator/ContentForm";
import GeneratedContent from "./contentgenerator/ContentPreview";

const API_URL = "https://cont-creator-3uvg.vercel.app";

const ContentGenerator = () => {
  // =========================
  // State Management
  // =========================

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedContent, setGeneratedContent] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  const getSavedForm = () => {
    try {
      const saved = localStorage.getItem("contentFormState");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Failed to parse saved content form:", error);
      return {};
    }
  };

  const savedForm = getSavedForm();

  const [currentPlatform, setCurrentPlatform] = useState(
    savedForm.platform || "Instagram"
  );

  const [currentStyle, setCurrentStyle] = useState(
    savedForm.contentStyle || "Friendly"
  );

  // =========================
  // User Profile Placeholder
  // =========================

  const userProfile = {
    targetAudience: "AI & Productivity",
    niche: "Content Creation",
    businessType: "Creator",
    language: "English",
  };

  // =========================
  // Load Ideas from localStorage
  // =========================

  useEffect(() => {
    try {
      const storedIdeas = localStorage.getItem("generatedIdeas");

      if (storedIdeas) {
        setIdeas(JSON.parse(storedIdeas));
      } else {
        setIdeas([]);
      }
    } catch (err) {
      console.error(
        "Failed to parse generated ideas from localStorage:",
        err
      );

      setIdeas([]);
    }
  }, []);

  // =========================
  // Save Content Generator Stats
  // =========================

  const updateContentGeneratorStats = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.warn(
        "No authenticated user found. Content Generator stats were not saved."
      );
      return;
    }

    try {
      const statsRef = doc(
        db,
        "users",
        user.uid,
        "features",
        "contentGenerator"
      );

      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const dateKey = `${year}-${month}-${day}`;

      await setDoc(
        statsRef,
        {
          postCount: increment(1),
          [`dailyActivity.${dateKey}`]: increment(1),
          lastGeneratedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      console.log(
        `Content Generator stats updated successfully for ${dateKey}.`
      );
    } catch (error) {
      console.error(
        "Failed to update Content Generator stats:",
        error
      );
    }
  };

  // =========================
  // Generate Content
  // =========================

  const handleGenerate = async (payload) => {
    console.log("Payload:", payload);

    setLoading(true);
    setError("");
    setLastPayload(payload);

    try {
      const response = await fetch(
        `${API_URL}/api/generate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      // =========================
      // Check API Response
      // =========================

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to generate content."
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Failed to generate content."
        );
      }

      // =========================
      // Save Generated Content
      // =========================

      setGeneratedContent(data.data);

      // =========================
      // Count Real Generated Post
      // =========================

      await updateContentGeneratorStats();
    } catch (err) {
      console.error("Content generation error:", err);

      setError(
        err?.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Save Idea
  // =========================

  const handleSaveIdea = () => {
    if (!generatedContent) {
      return;
    }

    try {
      localStorage.setItem(
        "savedIdea",
        JSON.stringify(generatedContent)
      );

      console.log("Saved!");
    } catch (error) {
      console.error("Failed to save idea:", error);
    }
  };

  // =========================
  // Regenerate
  // =========================

  const handleRegenerate = async () => {
    if (!lastPayload) {
      return;
    }

    await handleGenerate(lastPayload);
  };

  // =========================
  // Debug
  // =========================

  console.log("Last Payload:", lastPayload);

  // =========================
  // UI
  // =========================

  return (
    <div className="relative min-h-screen bg-[#00020f] text-white p-4 md:p-8 mt-20 font-sans overflow-hidden">

      {/* Animated Background Blobs */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            top-[15%]
            left-[5%]
            w-[400px]
            h-[400px]
            bg-purple-600
            rounded-full
            mix-blend-screen
            opacity-20
            blur-[180px]
          "
        />

        <motion.div
          animate={{
            x: [0, -50, 50, 0],
            y: [0, 50, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            top-[35%]
            right-[10%]
            w-[500px]
            h-[500px]
            bg-blue-600
            rounded-full
            mix-blend-screen
            opacity-20
            blur-[180px]
          "
        />

      </div>

      {/* Fluid Container */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-[1420px]
          mx-auto
          flex
          flex-col
          gap-6
          h-full
          min-h-[calc(100vh-4rem)]
        "
      >

        {/* Header */}

        <div className="flex items-center gap-4 px-2">

          {/* Icon */}

          <motion.img
            src="/ContentGeneratorHeaderImg.png"
            alt="Content Generator"
            whileHover={{
              scale: 1.08,
              rotate: -4,
              y: -2,
            }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 18,
            }}
            className="
              w-[70px]
              h-[70px]
              object-contain
              cursor-pointer
              select-none
              border-2xl
              transition-all
              duration-500
            "
          />

          {/* Text */}

          <div className="flex flex-col">

            <div className="flex items-center gap-2">

              <h1
                className="
                  text-[42px]
                  leading-none
                  font-bold
                  tracking-[-0.03em]
                  bg-gradient-to-r
                  from-fuchsia-300
                  via-purple-300
                  to-cyan-300
                  bg-clip-text
                  text-transparent
                "
              >
                Content Generator
              </h1>

              <Sparkles
                className="
                  w-5
                  h-5
                  text-yellow-300
                  animate-pulse
                  mt-1
                "
              />

            </div>

            <p
              className="
                mt-1
                text-[15px]
                text-gray-400
                font-medium
                flex
                items-center
                gap-1
              "
            >
              Turn your ideas into
              scroll-stopping content
              in seconds

              <span className="text-yellow-300">
                ✨
              </span>
            </p>

          </div>

        </div>

        {/* Error Banner */}

        {error && (
          <div
            className="
              bg-red-500/10
              border
              border-red-500/30
              rounded-xl
              px-4
              py-3
              text-red-400
              text-sm
              font-medium
              backdrop-blur-md
            "
          >
            {error}
          </div>
        )}

        {/* Main Grid */}

        <div
          className="
            flex-1
            grid
            grid-cols-1
            lg:grid-cols-[1fr_1.1fr]
            gap-6
            items-stretch
          "
        >

          {/* Content Form */}

          <ContentForm
            ideas={ideas?.ideas || []}
            loading={loading}
            onGenerate={handleGenerate}
            userProfile={userProfile}
            currentPlatform={currentPlatform}
            currentStyle={currentStyle}
            setCurrentPlatform={setCurrentPlatform}
            setCurrentStyle={setCurrentStyle}
          />

          {/* Generated Content */}

          <GeneratedContent
            generatedContent={generatedContent}
            loading={loading}
            onRegenerate={handleRegenerate}
            onSaveIdea={handleSaveIdea}
            selectedPlatform={currentPlatform}
            selectedStyle={currentStyle}
            options={lastPayload?.options || {}}
          />

        </div>

      </div>

    </div>
  );
};

export default ContentGenerator;
