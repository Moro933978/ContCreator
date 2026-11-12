import React, { useEffect, useState } from "react";

import { auth, db } from "../firebase";
import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import EditFocus from "./PostEditor/EditedPost";
import OriginalPostCard from "./PostEditor/OriginalPost";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cont-creator-3uvg.vercel.app/";

const API_CONFIG = {
  EDIT_POST: `${API_BASE_URL}/api/posteditor/improve`,
  REGENERATE_POST: `${API_BASE_URL}/api/posteditor/regenerate`,
  APPLY_SUGGESTION: `${API_BASE_URL}/api/posteditor/apply-suggestion`,
};

const HISTORY_STORAGE_KEY =
  "techook_post_editor_history";

const SAVED_DRAFT_STORAGE_KEY =
  "techook_post_editor_saved_draft";

const updatePostEditorStats = async () => {
  const user = auth.currentUser;

  if (!user) {
    console.warn(
      "No authenticated user. Post Editor stats were not saved."
    );
    return;
  }

  try {
    const statsRef = doc(
      db,
      "users",
      user.uid,
      "features",
      "postEditor"
    );

    const now = new Date();

    // Local calendar date: YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const dateKey = `${year}-${month}-${day}`;

    await setDoc(
      statsRef,
      {
        // Total successful Post Editor generations
        generateCount: increment(1),

        // Real day-by-day activity for the Profile chart
        [`dailyActivity.${dateKey}`]: increment(1),

        lastGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(
      `Post Editor generation count updated for ${dateKey}.`
    );
  } catch (error) {
    console.error(
      "Failed to update Post Editor stats:",
      error
    );
  }
};

export default function App() {
  /* =========================================================
     STATE
  ========================================================= */

  const [tone, setTone] =
    useState("Friendly");

  const [instructions, setInstructions] =
    useState("");

  const [currentOriginalPost, setCurrentOriginalPost] =
    useState("");

  const [editedPost, setEditedPost] =
    useState("");

  const [analysisReady, setAnalysisReady] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isApplyingSuggestion, setIsApplyingSuggestion] =
    useState(false);

  const [isRegenerating, setIsRegenerating] =
    useState(false);

  const [generationProgress, setGenerationProgress] =
    useState(0);

  const [generationStep, setGenerationStep] =
    useState("Waiting for analysis...");

  const [generatedMetrics, setGeneratedMetrics] =
    useState(null);

  const [suggestions, setSuggestions] =
    useState([]);

  const [activeSuggestionTab, setActiveSuggestionTab] =
    useState("All");

  const [saved, setSaved] =
    useState(false);

  const [savedDraft, setSavedDraft] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [isHistoryOpen, setIsHistoryOpen] =
    useState(false);

  const [toast, setToast] =
    useState("");

  const [animationKey, setAnimationKey] =
    useState(0);

  /* =========================================================
     LOAD LOCAL STORAGE
  ========================================================= */

  useEffect(() => {
    try {
      const storedHistory =
        localStorage.getItem(
          HISTORY_STORAGE_KEY
        );

      if (storedHistory) {
        const parsedHistory =
          JSON.parse(
            storedHistory
          );

        if (
          Array.isArray(
            parsedHistory
          )
        ) {
          setHistory(
            parsedHistory
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load history:",
        error
      );
    }

    try {
      const storedDraft =
        localStorage.getItem(
          SAVED_DRAFT_STORAGE_KEY
        );

      if (storedDraft) {
        const parsedDraft =
          JSON.parse(
            storedDraft
          );

        if (
          parsedDraft &&
          typeof parsedDraft ===
            "object" &&
          typeof parsedDraft.editedPost ===
            "string" &&
          parsedDraft.editedPost.trim()
        ) {
          setSavedDraft(
            parsedDraft
          );

          setSaved(true);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load saved draft:",
        error
      );
    }
  }, []);

  /* =========================================================
     TOAST
  ========================================================= */

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer =
      setTimeout(() => {
        setToast("");
      }, 2500);

    return () =>
      clearTimeout(timer);
  }, [toast]);

  const showToast = (
    message
  ) => {
    setToast(message);
  };

  /* =========================================================
     METRICS
  ========================================================= */

  const normalizeMetric = (
    value,
    fallback = 0
  ) => {
    const numeric =
      Number(value);

    if (
      !Number.isFinite(
        numeric
      )
    ) {
      return fallback;
    }

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          numeric
        )
      )
    );
  };

  const getScoreStatus = (
    score
  ) => {
    if (score >= 92) {
      return "Excellent";
    }

    if (score >= 85) {
      return "High";
    }

    return "Good";
  };

  const calculateFallbackMetrics =
    (text) => {
      const value = text || "";

      if (!value.trim()) {
        return {
          readability: 0,
          engagement: 0,
          clarity: 0,
          viral: 0,
        };
      }

      const characters =
        value.length;

      const words =
        value
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      const sentences =
        value
          .split(/[.!?]+/)
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      const avgWordsPerSentence =
        sentences.length > 0
          ? words.length /
            sentences.length
          : words.length;

      const paragraphs =
        value
          .split(/\n\s*\n/)
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      const hasNumbers =
        /\d+\./.test(value);

      const hasQuestion =
        /\?/.test(value);

      const hasEmoji =
        /[\u{1F300}-\u{1FAFF}]/u.test(
          value
        );

      const readability =
        normalizeMetric(
          98 -
            Math.max(
              0,
              avgWordsPerSentence -
                14
            ) *
              2.2 -
            Math.max(
              0,
              characters - 1000
            ) /
              100,
          88
        );

      const engagement =
        normalizeMetric(
          68 +
            (hasQuestion
              ? 8
              : 0) +
            (hasEmoji
              ? 6
              : 0) +
            (hasNumbers
              ? 7
              : 0) +
            Math.min(
              9,
              paragraphs.length *
                2
            ),
          82
        );

      const clarity =
        normalizeMetric(
          96 -
            Math.max(
              0,
              avgWordsPerSentence -
                12
            ) *
              1.8 -
            (sentences.length ===
            0
              ? 8
              : 0),
          90
        );

      const viral =
        normalizeMetric(
          engagement * 0.42 +
            readability *
              0.18 +
            clarity * 0.2 +
            (hasQuestion
              ? 7
              : 0) +
            (hasEmoji
              ? 5
              : 0),
          84
        );

      return {
        readability,
        engagement,
        clarity,
        viral,
      };
    };

  /* =========================================================
     API RESPONSE HELPERS
  ========================================================= */

  const extractEditedPost = (
    data
  ) => {
    if (!data) {
      return "";
    }

    const candidates = [
      data.editedPost,
      data.edited_post,

      data.improvedPost,
      data.improved_post,

      data.generatedPost,
      data.generated_post,

      data.content,

      data.result?.editedPost,
      data.result?.edited_post,
      data.result?.improvedPost,
      data.result?.improved_post,
      data.result?.content,

      data.data?.editedPost,
      data.data?.edited_post,
      data.data?.improvedPost,
      data.data?.improved_post,
      data.data?.generatedPost,
      data.data?.generated_post,
      data.data?.content,

      data.data?.result?.editedPost,
      data.data?.result?.edited_post,
      data.data?.result?.content,

      data.post,
      data.data?.post,
    ];

    for (
      const candidate of candidates
    ) {
      if (
        typeof candidate ===
          "string" &&
        candidate.trim()
      ) {
        return candidate.trim();
      }
    }

    return "";
  };

  const extractMetrics = (
    data,
    generatedText
  ) => {
    const fallback =
      calculateFallbackMetrics(
        generatedText
      );

    const apiMetrics =
      data?.metrics ||
      data?.result?.metrics ||
      data?.data?.metrics ||
      data?.analysis ||
      data?.result?.analysis ||
      data?.data?.analysis;

    if (!apiMetrics) {
      return fallback;
    }

    return {
      readability:
        normalizeMetric(
          apiMetrics.readability ??
            apiMetrics.readabilityScore,
          fallback.readability
        ),

      engagement:
        normalizeMetric(
          apiMetrics.engagement ??
            apiMetrics.engagementScore,
          fallback.engagement
        ),

      clarity:
        normalizeMetric(
          apiMetrics.clarity ??
            apiMetrics.clarityScore,
          fallback.clarity
        ),

      viral:
        normalizeMetric(
          apiMetrics.viral ??
            apiMetrics.viralScore,
          fallback.viral
        ),
    };
  };

  const extractSuggestions = (
    data
  ) => {
    const apiSuggestions =
      data?.suggestions ||
      data?.result?.suggestions ||
      data?.data?.suggestions ||
      data?.data?.result
        ?.suggestions;

    if (
      !Array.isArray(
        apiSuggestions
      )
    ) {
      return [];
    }

    return apiSuggestions
      .filter(
        (item) =>
          item &&
          typeof item ===
            "object" &&
          typeof item.content ===
            "string" &&
          item.content.trim()
      )
      .map((item) => ({
        type:
          typeof item.type ===
          "string"
            ? item.type.toLowerCase()
            : "improve",

        title:
          item.title ||
          "Content Suggestion",

        impact:
          item.impact ||
          "Useful",

        content:
          item.content.trim(),

        action:
          item.action ||
          "Apply Suggestion",
      }))
      .slice(0, 6);
  };

  /* =========================================================
     HISTORY
  ========================================================= */

  const saveHistory = ({
    originalPost,
    generatedPost,
    metrics,
    source = "Generate",
  }) => {
    if (
      !originalPost?.trim() ||
      !generatedPost?.trim()
    ) {
      return;
    }

    const historyItem = {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      originalPost:
        originalPost.trim(),

      generatedPost:
        generatedPost.trim(),

      metrics:
        metrics || null,

      source,

      createdAt:
        new Date().toISOString(),
    };

    setHistory(
      (previousHistory) => {
        const nextHistory = [
          historyItem,
          ...previousHistory,
        ].slice(
          0,
          50
        );

        try {
          localStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(
              nextHistory
            )
          );
        } catch (error) {
          console.error(
            "Failed to save history:",
            error
          );
        }

        return nextHistory;
      }
    );
  };

  const deleteHistoryItem =
    (id) => {
      setHistory(
        (previousHistory) => {
          const nextHistory =
            previousHistory.filter(
              (item) =>
                item.id !== id
            );

          try {
            localStorage.setItem(
              HISTORY_STORAGE_KEY,
              JSON.stringify(
                nextHistory
              )
            );
          } catch (error) {
            console.error(
              "Failed to update history:",
              error
            );
          }

          return nextHistory;
        }
      );

      showToast(
        "Generation removed from history"
      );
    };

  const clearHistory = () => {
    const confirmed =
      window.confirm(
        "Clear all generation history?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      HISTORY_STORAGE_KEY
    );

    setHistory([]);

    showToast(
      "Generation history cleared"
    );
  };

  const restoreHistoryItem =
    (item) => {
      if (!item) {
        return;
      }

      setCurrentOriginalPost(
        item.originalPost || ""
      );

      setEditedPost(
        item.generatedPost || ""
      );

      setGeneratedMetrics(
        item.metrics ||
          calculateFallbackMetrics(
            item.generatedPost
          )
      );

      setSuggestions([]);

      setAnalysisReady(
        true
      );

      setGenerationProgress(
        100
      );

      setGenerationStep(
        "Complete"
      );

      setAnimationKey(
        (value) =>
          value + 1
      );

      setIsHistoryOpen(
        false
      );

      showToast(
        "Previous version restored"
      );
    };

  const formatHistoryDate =
    (date) => {
      if (!date) {
        return "Unknown time";
      }

      const parsedDate =
        new Date(date);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return "Unknown time";
      }

      return parsedDate.toLocaleString(
        undefined,
        {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  /* =========================================================
     SAVE / UNSAVE
  ========================================================= */

  const handleSaveDraft =
    () => {
      /* -----------------------------------------------
         UNSAVE
      ------------------------------------------------ */

      if (saved) {
        localStorage.removeItem(
          SAVED_DRAFT_STORAGE_KEY
        );

        setSavedDraft(null);

        setSaved(false);

        showToast(
          "Draft unsaved"
        );

        return;
      }

      /* -----------------------------------------------
         SAVE
      ------------------------------------------------ */

      if (!editedPost?.trim()) {
        showToast(
          "Generate an edited post before saving"
        );

        return;
      }

      const draftMetrics =
        generatedMetrics ||
        calculateFallbackMetrics(
          editedPost
        );

      const draft = {
        originalPost:
          currentOriginalPost,

        editedPost:
          editedPost.trim(),

        metrics:
          draftMetrics,

        savedAt:
          new Date().toISOString(),
      };

      try {
        localStorage.setItem(
          SAVED_DRAFT_STORAGE_KEY,
          JSON.stringify(draft)
        );

        setSavedDraft(
          draft
        );

        setSaved(true);

        /*
         * IMPORTANT:
         * We do NOT touch editedPost here.
         * The current generated post stays exactly
         * where it is.
         */

        showToast(
          "Draft saved successfully"
        );
      } catch (error) {
        console.error(
          "Failed to save draft:",
          error
        );

        showToast(
          "Unable to save draft locally"
        );
      }
    };

  /* =========================================================
     COPY EDITED POST
  ========================================================= */

  const handleCopyEditedPost =
    async () => {
      if (!editedPost?.trim()) {
        showToast(
          "Generate an edited post before copying"
        );

        return;
      }

      try {
        await navigator.clipboard.writeText(
          editedPost.trim()
        );

        showToast(
          "Edited post copied to clipboard"
        );
      } catch (error) {
        console.error(
          "Clipboard error:",
          error
        );

        try {
          const textarea =
            document.createElement(
              "textarea"
            );

          textarea.value =
            editedPost.trim();

          textarea.style.position =
            "fixed";

          textarea.style.left =
            "-9999px";

          textarea.style.top =
            "0";

          document.body.appendChild(
            textarea
          );

          textarea.focus();

          textarea.select();

          document.execCommand(
            "copy"
          );

          document.body.removeChild(
            textarea
          );

          showToast(
            "Edited post copied to clipboard"
          );
        } catch {
          showToast(
            "Unable to copy the edited post"
          );
        }
      }
    };

  /* =========================================================
     SERVER RESULT
  ========================================================= */

  const applyServerResult = (
    data,
    historySource = "Generate"
  ) => {
    const generatedText =
      extractEditedPost(data);

    if (!generatedText) {
      throw new Error(
        "The AI response did not contain an edited post."
      );
    }

    const metrics =
      extractMetrics(
        data,
        generatedText
      );

    const nextSuggestions =
      extractSuggestions(
        data
      );

    setEditedPost(
      generatedText
    );

    setGeneratedMetrics(
      metrics
    );

    setSuggestions(
      nextSuggestions
    );

    setAnimationKey(
      (value) =>
        value + 1
    );

    saveHistory({
      originalPost:
        currentOriginalPost,

      generatedPost:
        generatedText,

      metrics,

      source:
        historySource,
    });

    return {
      generatedText,
      metrics,
      suggestions:
        nextSuggestions,
    };
  };

  /* =========================================================
     EDIT FOCUS
  ========================================================= */

  const handleEditFocusSuccess =
    (newEditedPost) => {
      if (!newEditedPost) {
        return;
      }

      const metrics =
        calculateFallbackMetrics(
          newEditedPost
        );

      setEditedPost(
        newEditedPost
      );

      setGeneratedMetrics(
        metrics
      );

      setAnimationKey(
        (value) =>
          value + 1
      );

      saveHistory({
        originalPost:
          currentOriginalPost,

        generatedPost:
          newEditedPost,

        metrics,

        source:
          "Edit Focus",
      });

      showToast(
        "AI changes applied"
      );
    };

  /* =========================================================
     ORIGINAL POST
  ========================================================= */

  const handleOriginalPostSubmit =
    ({
      originalText,
      result,
      error,
    }) => {
      const cleanOriginal =
        typeof originalText ===
        "string"
          ? originalText.trim()
          : "";

      if (error) {
        setAnalysisReady(
          false
        );

        setCurrentOriginalPost(
          cleanOriginal
        );

        return;
      }

      setCurrentOriginalPost(
        cleanOriginal
      );

      setAnalysisReady(true);

      setEditedPost("");

      setGeneratedMetrics(
        null
      );

      setSuggestions([]);

      setGenerationProgress(
        0
      );

      setGenerationStep(
        "Ready to generate"
      );

      const resultPost =
        extractEditedPost(
          result
        );

      if (resultPost) {
        const metrics =
          extractMetrics(
            result,
            resultPost
          );

        setEditedPost(
          resultPost
        );

        setGeneratedMetrics(
          metrics
        );

        setSuggestions(
          extractSuggestions(
            result
          )
        );

        setAnimationKey(
          (value) =>
            value + 1
        );

        saveHistory({
          originalPost:
            cleanOriginal,

          generatedPost:
            resultPost,

          metrics,

          source:
            "Analyze",
        });

        showToast(
          "Post analyzed successfully"
        );

        return;
      }

      showToast(
        "Post analyzed — ready to generate"
      );
    };

  /* =========================================================
     GENERATE
  ========================================================= */

  const generatePost =
    async () => {
      if (
        !currentOriginalPost.trim()
      ) {
        showToast(
          "Please enter your original post first"
        );

        return;
      }

      if (!analysisReady) {
        showToast(
          "Press Analyze first"
        );

        return;
      }

      if (
        isGenerating ||
        isApplyingSuggestion ||
        isRegenerating
      ) {
        return;
      }

      setIsGenerating(true);

      setEditedPost("");

      setGeneratedMetrics(
        null
      );

      setSuggestions([]);

      setGenerationProgress(
        8
      );

      setGenerationStep(
        "Preparing your content..."
      );

      let progressTimer =
        null;

      try {
        const progressSteps = [
          {
            value: 18,
            text:
              "Reading your original post...",
          },
          {
            value: 32,
            text:
              "Analyzing tone and structure...",
          },
          {
            value: 48,
            text:
              "Improving your content...",
          },
          {
            value: 64,
            text:
              "Optimizing readability...",
          },
          {
            value: 78,
            text:
              "Polishing engagement...",
          },
          {
            value: 88,
            text:
              "Generating AI suggestions...",
          },
        ];

        let stepIndex =
          0;

        progressTimer =
          setInterval(() => {
            if (
              stepIndex >=
              progressSteps.length
            ) {
              return;
            }

            const step =
              progressSteps[
                stepIndex
              ];

            setGenerationProgress(
              step.value
            );

            setGenerationStep(
              step.text
            );

            stepIndex += 1;
          }, 650);

        const response =
          await fetch(
            API_CONFIG.EDIT_POST,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                post:
                  currentOriginalPost.trim(),

                editFocus:
                  "general",

                tone:
                  typeof tone ===
                  "string"
                    ? tone.toLowerCase()
                    : "friendly",

                customInstructions:
                  instructions.trim(),
              }),
            }
          );

        const responseText =
          await response.text();

        let data = null;

        if (responseText) {
          try {
            data =
              JSON.parse(
                responseText
              );
          } catch {
            throw new Error(
              `Server returned invalid JSON. Status: ${response.status}`
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to generate the post. Server returned ${response.status}.`
          );
        }

        if (
          data?.success ===
          false
        ) {
          throw new Error(
            data?.message ||
              data?.error ||
              "The server could not process the post."
          );
        }

        setGenerationProgress(
          96
        );

        setGenerationStep(
          "Finalizing your edited post..."
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              450
            )
        );

        applyServerResult(
          data,
          "Generate"
        );

        // Count only a successful Generate operation.
        await updatePostEditorStats();

        setGenerationProgress(
          100
        );

        setGenerationStep(
          "Complete"
        );

        showToast(
          "Post generated successfully"
        );
      } catch (error) {
        console.error(
          "Post generation error:",
          error
        );

        setGenerationProgress(
          0
        );

        setGenerationStep(
          "Generation failed"
        );

        showToast(
          error?.message ||
            "Something went wrong while generating the post."
        );
      } finally {
        if (progressTimer) {
          clearInterval(
            progressTimer
          );
        }

        setTimeout(() => {
          setIsGenerating(
            false
          );
        }, 450);
      }
    };

  /* =========================================================
     REGENERATE
  ========================================================= */

  const regeneratePost =
    async () => {
      if (
        !currentOriginalPost.trim()
      ) {
        showToast(
          "Original post is required"
        );

        return;
      }

      if (!editedPost.trim()) {
        showToast(
          "Generate a post first"
        );

        return;
      }

      if (
        isGenerating ||
        isApplyingSuggestion ||
        isRegenerating
      ) {
        return;
      }

      setIsRegenerating(
        true
      );

      setGenerationProgress(
        15
      );

      setGenerationStep(
        "Creating a different version..."
      );

      let progressTimer =
        null;

      try {
        const progressSteps = [
          {
            value: 30,
            text:
              "Reviewing the previous version...",
          },
          {
            value: 48,
            text:
              "Creating a fresh hook...",
          },
          {
            value: 66,
            text:
              "Reworking the structure...",
          },
          {
            value: 82,
            text:
              "Improving engagement...",
          },
          {
            value: 92,
            text:
              "Finalizing suggestions...",
          },
        ];

        let stepIndex =
          0;

        progressTimer =
          setInterval(() => {
            if (
              stepIndex >=
              progressSteps.length
            ) {
              return;
            }

            const step =
              progressSteps[
                stepIndex
              ];

            setGenerationProgress(
              step.value
            );

            setGenerationStep(
              step.text
            );

            stepIndex += 1;
          }, 600);

        const response =
          await fetch(
            API_CONFIG.REGENERATE_POST,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                post:
                  currentOriginalPost.trim(),

                editFocus:
                  "general",

                tone:
                  typeof tone ===
                  "string"
                    ? tone.toLowerCase()
                    : "friendly",

                customInstructions:
                  instructions.trim(),

                previousResult: {
                  editedPost,

                  metrics:
                    generatedMetrics,

                  suggestions,
                },
              }),
            }
          );

        const responseText =
          await response.text();

        let data = null;

        if (responseText) {
          try {
            data =
              JSON.parse(
                responseText
              );
          } catch {
            throw new Error(
              "Server returned invalid JSON."
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to regenerate. Server returned ${response.status}.`
          );
        }

        if (
          data?.success ===
          false
        ) {
          throw new Error(
            data?.message ||
              data?.error ||
              "The server could not regenerate the post."
          );
        }

        setGenerationProgress(
          96
        );

        setGenerationStep(
          "Finishing your new version..."
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              400
            )
        );

        applyServerResult(
          data,
          "Regenerate"
        );

        // Count Regenerate as a successful generation too.
        await updatePostEditorStats();

        setGenerationProgress(
          100
        );

        setGenerationStep(
          "Complete"
        );

        showToast(
          "New version generated"
        );
      } catch (error) {
        console.error(
          "Regeneration error:",
          error
        );

        setGenerationProgress(
          0
        );

        setGenerationStep(
          "Regeneration failed"
        );

        showToast(
          error?.message ||
            "Failed to regenerate the post."
        );
      } finally {
        if (progressTimer) {
          clearInterval(
            progressTimer
          );
        }

        setTimeout(() => {
          setIsRegenerating(
            false
          );
        }, 450);
      }
    };

  /* =========================================================
     APPLY SUGGESTION
  ========================================================= */

  const applySuggestion =
    async (
      suggestion
    ) => {
      if (
        !suggestion ||
        typeof suggestion !==
          "object"
      ) {
        return;
      }

      if (!editedPost.trim()) {
        showToast(
          "Generate an edited post first"
        );

        return;
      }

      if (
        isGenerating ||
        isApplyingSuggestion ||
        isRegenerating
      ) {
        return;
      }

      setIsApplyingSuggestion(
        true
      );

      setGenerationProgress(
        20
      );

      setGenerationStep(
        "Applying AI suggestion..."
      );

      let progressTimer =
        null;

      try {
        const progressSteps = [
          {
            value: 38,
            text:
              "Reading the selected suggestion...",
          },
          {
            value: 58,
            text:
              "Applying the requested improvement...",
          },
          {
            value: 76,
            text:
              "Checking the updated post...",
          },
          {
            value: 90,
            text:
              "Updating content scores...",
          },
        ];

        let stepIndex =
          0;

        progressTimer =
          setInterval(() => {
            if (
              stepIndex >=
              progressSteps.length
            ) {
              return;
            }

            const step =
              progressSteps[
                stepIndex
              ];

            setGenerationProgress(
              step.value
            );

            setGenerationStep(
              step.text
            );

            stepIndex += 1;
          }, 600);

        const response =
          await fetch(
            API_CONFIG.APPLY_SUGGESTION,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                post:
                  editedPost.trim(),

                suggestion,

                tone:
                  typeof tone ===
                  "string"
                    ? tone.toLowerCase()
                    : "friendly",

                customInstructions:
                  instructions.trim(),
              }),
            }
          );

        const responseText =
          await response.text();

        let data = null;

        if (responseText) {
          try {
            data =
              JSON.parse(
                responseText
              );
          } catch {
            throw new Error(
              "Server returned invalid JSON."
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to apply suggestion. Server returned ${response.status}.`
          );
        }

        if (
          data?.success ===
          false
        ) {
          throw new Error(
            data?.message ||
              data?.error ||
              "The server could not apply the suggestion."
          );
        }

        setGenerationProgress(
          96
        );

        setGenerationStep(
          "Finalizing changes..."
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              350
            )
        );

        applyServerResult(
          data,
          "Apply Suggestion"
        );

        setGenerationProgress(
          100
        );

        setGenerationStep(
          "Complete"
        );

        showToast(
          suggestion.action ||
            "Suggestion applied"
        );
      } catch (error) {
        console.error(
          "Apply suggestion error:",
          error
        );

        setGenerationProgress(
          0
        );

        setGenerationStep(
          "Suggestion failed"
        );

        showToast(
          error?.message ||
            "Failed to apply suggestion."
        );
      } finally {
        if (progressTimer) {
          clearInterval(
            progressTimer
          );
        }

        setTimeout(() => {
          setIsApplyingSuggestion(
            false
          );
        }, 450);
      }
    };

  /* =========================================================
     FILTER SUGGESTIONS
  ========================================================= */

  const getFilteredSuggestions =
    () => {
      if (
        activeSuggestionTab ===
        "All"
      ) {
        return suggestions;
      }

      if (
        activeSuggestionTab ===
        "Hooks"
      ) {
        return suggestions.filter(
          (item) =>
            item.type ===
            "hook"
        );
      }

      if (
        activeSuggestionTab ===
        "CTA"
      ) {
        return suggestions.filter(
          (item) =>
            item.type ===
            "cta"
        );
      }

      if (
        activeSuggestionTab ===
        "Improve"
      ) {
        return suggestions.filter(
          (item) =>
            item.type ===
              "improve" ||
            item.type ===
              "tone" ||
            item.type ===
              "structure"
        );
      }

      return suggestions;
    };

  /* =========================================================
     ICON
  ========================================================= */

  const Icon = ({
    name,
    size = 18,
    stroke = 1.8,
  }) => {
    const common = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke:
        "currentColor",
      strokeWidth:
        stroke,
      strokeLinecap:
        "round",
      strokeLinejoin:
        "round",
      xmlns:
        "http://www.w3.org/2000/svg",
    };

    const icons = {
      pen: (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </>
      ),

      sparkle: (
        <>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="m5.6 5.6 2.1 2.1" />
          <path d="m16.3 16.3 2.1 2.1" />
          <path d="m5.6 18.4 2.1-2.1" />
          <path d="m16.3 7.7 2.1-2.1" />
          <circle
            cx="12"
            cy="12"
            r="3"
          />
        </>
      ),

      book: (
        <>
          <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22Z" />
          <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5A2.5 2.5 0 0 1 21 22Z" />
        </>
      ),

      bookmark: (
        <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21Z" />
      ),

      history: (
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </>
      ),

      copy: (
        <>
          <rect
            x="9"
            y="9"
            width="11"
            height="11"
            rx="2"
          />

          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </>
      ),

      check: (
        <path d="m5 12 4 4L19 6" />
      ),

      refresh: (
        <>
          <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
          <path d="M21 19v-5h-5" />
        </>
      ),

      sparkles: (
        <>
          <path d="m12 3-1.2 5.1L6 9.5l4.8 1.4L12 16l1.2-5.1L18 9.5l-4.8-1.4Z" />
          <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7Z" />
          <path d="m5 14-.6 1.9L2.5 16.5l1.9.6L5 19l.6-1.9 1.9-.6Z" />
        </>
      ),

      trash: (
        <>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 15H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </>
      ),

      close: (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ),
    };

    return (
      <svg {...common}>
        {icons[name]}
      </svg>
    );
  };

  /* =========================================================
     METRIC
  ========================================================= */

  const Metric = ({
    label,
    value,
    metricClass,
  }) => {
    const safeValue =
      normalizeMetric(
        value,
        0
      );

    const degrees =
      safeValue * 3.6;

    const busy =
      isGenerating ||
      isApplyingSuggestion ||
      isRegenerating;

    if (
      busy ||
      !generatedMetrics
    ) {
      return (
        <div className="metric-card metric-loading">
          <div className="metric-ring skeleton-ring">
            <div className="metric-ring-inner skeleton-circle" />
          </div>

          <div className="metric-text">
            <span className="metric-label">
              {label}
            </span>

            <div className="metric-skeleton-value" />

            <div className="metric-skeleton-status" />
          </div>
        </div>
      );
    }

    return (
      <div className="metric-card">
        <div
          className={`metric-ring ${
            metricClass || ""
          }`}
          style={{
            "--progress":
              `${degrees}deg`,
          }}
        >
          <div className="metric-ring-inner">
            {safeValue}
          </div>
        </div>

        <div className="metric-text">
          <span className="metric-label">
            {label}
          </span>

          <strong>
            {safeValue}%
          </strong>

          <small>
            {getScoreStatus(
              safeValue
            )}
          </small>
        </div>
      </div>
    );
  };

  /* =========================================================
     SUGGESTION CARD
  ========================================================= */

  const SuggestionCard = ({
    suggestion,
  }) => {
    const type =
      suggestion?.type ||
      "improve";

    let iconName =
      "sparkle";

    if (
      type === "cta"
    ) {
      iconName =
        "refresh";
    }

    if (
      type === "structure"
    ) {
      iconName =
        "book";
    }

    let badgeClass =
      "badge-green";

    if (
      String(
        suggestion?.impact
      )
        .toLowerCase()
        .includes("high")
    ) {
      badgeClass =
        "badge-red";
    }

    if (
      String(
        suggestion?.impact
      )
        .toLowerCase()
        .includes("useful")
    ) {
      badgeClass =
        "badge-yellow";
    }

    return (
      <div className="suggestion-card">
        <div className="suggestion-top">
          <div className="suggestion-title">
            <span className="suggestion-icon">
              <Icon
                name={iconName}
                size={17}
              />
            </span>

            <strong>
              {suggestion.title}
            </strong>
          </div>

          <span
            className={`badge ${badgeClass}`}
          >
            {suggestion.impact}
          </span>
        </div>

        <p>
          {suggestion.content}
        </p>

        <button
          className="suggestion-button"
          onClick={() =>
            applySuggestion(
              suggestion
            )
          }
          disabled={
            isApplyingSuggestion ||
            isGenerating ||
            isRegenerating
          }
          type="button"
        >
          {isApplyingSuggestion ? (
            <>
              <span className="button-spinner" />
              Applying...
            </>
          ) : (
            suggestion.action ||
            "Apply Suggestion"
          )}
        </button>
      </div>
    );
  };

  /* =========================================================
     SAVED DRAFT CARD
  ========================================================= */

  const SavedDraftCard =
    () => {
      if (!savedDraft) {
        return null;
      }

      const metrics =
        savedDraft.metrics ||
        calculateFallbackMetrics(
          savedDraft.editedPost
        );

      return (
        <div className="saved-draft-card">
          <div className="saved-draft-header">
            <div className="saved-draft-title">
              <span className="saved-draft-icon">
                <Icon className="mt-11" 
                  name="bookmark"
                  size={16}
                />
              </span>

              <div>
                <strong>
                  Saved Draft
                </strong>

                <span>
                  Latest saved version
                </span>
              </div>
            </div>

            <span className="saved-draft-status">
              SAVED
            </span>
          </div>

          <div className="saved-draft-meta">
            <span>
              <Icon
                name="history"
                size={12}
              />

              {formatHistoryDate(
                savedDraft.savedAt
              )}
            </span>
          </div>

          <div className="saved-draft-content">
            {savedDraft.editedPost}
          </div>

          <div className="saved-draft-metrics">
            <span>
              Readability{" "}
              <strong>
                {metrics.readability}%
              </strong>
            </span>

            <span>
              Engagement{" "}
              <strong>
                {metrics.engagement}%
              </strong>
            </span>

            <span>
              Clarity{" "}
              <strong>
                {metrics.clarity}%
              </strong>
            </span>

            <span>
              Viral{" "}
              <strong>
                {metrics.viral}%
              </strong>
            </span>
          </div>

          <div className="saved-draft-actions">
            <button
              type="button"
              onClick={() =>
                restoreHistoryItem({
                  originalPost:
                    savedDraft.originalPost,

                  generatedPost:
                    savedDraft.editedPost,

                  metrics:
                    savedDraft.metrics,
                })
              }
            >
              <Icon
                name="refresh"
                size={14}
              />

              Restore Saved Version
            </button>
          </div>
        </div>
      );
    };

  /* =========================================================
     MAIN EDITS
  ========================================================= */

  const MainEdits =
    () => {
      const metrics =
        generatedMetrics || {
          readability: 0,
          engagement: 0,
          clarity: 0,
          viral: 0,
        };

      const busy =
        isGenerating ||
        isApplyingSuggestion ||
        isRegenerating;

      return (
        <div className="main-edits">
          <div className="main-edits-header">
            <div>
              <div className="main-edits-title">
                <span className="main-edits-icon">
                  <Icon
                    name="sparkles"
                    size={17}
                  />
                </span>

                <strong>
                  Main Edits
                </strong>

                {busy && (
                  <span className="generating-badge">
                    <span className="generating-dot" />
                    AI Working
                  </span>
                )}

                {!busy &&
                  analysisReady &&
                  !editedPost && (
                    <span className="ready-badge">
                      Ready
                    </span>
                  )}

                {!analysisReady && (
                  <span className="waiting-badge">
                    Waiting
                  </span>
                )}
              </div>

              <p>
                {busy
                  ? generationStep
                  : !analysisReady
                  ? "Analyze your original post first to unlock AI editing."
                  : editedPost
                  ? "Your AI-enhanced post is ready."
                  : "Choose your preferences and generate your improved post."}
              </p>
            </div>

            {busy && (
              <div className="generation-percentage">
                {generationProgress}%
              </div>
            )}
          </div>

          <SavedDraftCard />

          {!analysisReady ? (
            <div className="main-edits-locked">
              <div className="locked-orbit">
                <div className="locked-ring ring-one" />

                <div className="locked-ring ring-two" />

                <div className="locked-core">
                  <Icon
                    name="sparkles"
                    size={23}
                  />
                </div>
              </div>

              <h3>
                Waiting for Analysis
              </h3>

              <p>
                Press{" "}
                <strong>
                  Analyze
                </strong>{" "}
                on the Original Post card above
                to prepare your content for AI editing.
              </p>

              <div className="waiting-line">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : (
            <>
              <div className="generation-area">
                {busy ? (
                  <div className="generation-loading">
                    <div className="ai-loader">
                      <div className="loader-ring loader-ring-one" />
                      <div className="loader-ring loader-ring-two" />

                      <div className="loader-core">
                        <Icon
                          name="sparkles"
                          size={22}
                        />
                      </div>
                    </div>

                    <div className="loading-copy">
                      <strong>
                        AI is refining your post
                      </strong>

                      <span>
                        {generationStep}
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width:
                            `${generationProgress}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : editedPost ? (
                  <div
                    key={
                      animationKey
                    }
                    className="generated-preview"
                  >
                    <div className="generated-label">
                      <span className="success-check">
                        <Icon
                          name="check"
                          size={10}
                          stroke={2.7}
                        />
                      </span>

                      <span>
                        AI Generated
                      </span>
                    </div>

                    <div className="generated-text">
                      {
                        editedPost
                      }
                    </div>

                    <div className="generated-actions">
                      <button
                        type="button"
                        className="regenerate-button"
                        onClick={
                          regeneratePost
                        }
                        disabled={
                          busy
                        }
                      >
                        <Icon
                          name="refresh"
                          size={15}
                        />

                        Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="generate-empty">
                    <div className="empty-icon">
                      <Icon
                        name="sparkles"
                        size={21}
                      />
                    </div>

                    <div>
                      <strong>
                        Your edited post is ready to be generated
                      </strong>

                      <span>
                        AI will improve the tone, structure,
                        clarity, hook, and CTA based on your settings.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="metrics-title">
                <span>
                  AI Content Analysis
                </span>

                <small>
                  {busy
                    ? "Analyzing..."
                    : generatedMetrics
                    ? "Generated"
                    : "Waiting for Generate"}
                </small>
              </div>

              <div className="metrics">
                <Metric
                  label="Readability"
                  value={
                    metrics.readability
                  }
                  metricClass="metric-purple"
                />

                <Metric
                  label="Engagement"
                  value={
                    metrics.engagement
                  }
                  metricClass="metric-green"
                />

                <Metric
                  label="Clarity"
                  value={
                    metrics.clarity
                  }
                  metricClass="metric-blue"
                />

                <Metric
                  label="Viral Score"
                  value={
                    metrics.viral
                  }
                  metricClass="metric-violet"
                />
              </div>

              <button
                type="button"
                className={`generate-button ${
                  busy
                    ? "loading"
                    : ""
                }`}
                disabled={
                  busy
                }
                onClick={
                  generatePost
                }
              >
                {busy ? (
                  <>
                    <span className="button-spinner" />

                    {isApplyingSuggestion
                      ? "Applying..."
                      : isRegenerating
                      ? "Regenerating..."
                      : "Generating..."}
                  </>
                ) : (
                  <>
                    <Icon
                      name="sparkles"
                      size={17}
                    />

                    Generate
                  </>
                )}
              </button>
            </>
          )}
        </div>
      );
    };

  /* =========================================================
     HISTORY PANEL
  ========================================================= */

  const HistoryPanel =
    () => {
      if (!isHistoryOpen) {
        return null;
      }

      return (
        <div
          className="history-overlay"
          onClick={() =>
            setIsHistoryOpen(
              false
            )
          }
        >
          <aside
            className="history-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="history-panel-header">
              <div>
                <div className="history-kicker">
                  AI WORKSPACE
                </div>

                <div className="history-title">
                  <span className="history-title-icon">
                    <Icon
                      name="history"
                      size={20}
                    />
                  </span>

                  <div>
                    <h2>
                      Generation History
                    </h2>

                    <p>
                      Your previous AI generations
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="history-close"
                onClick={() =>
                  setIsHistoryOpen(
                    false
                  )
                }
              >
                <Icon
                  name="close"
                  size={18}
                />
              </button>
            </div>

            <div className="history-stats">
              <div>
                <span>
                  GENERATIONS
                </span>

                <strong>
                  {history.length}
                </strong>
              </div>

              <div>
                <span>
                  STORAGE
                </span>

                <strong>
                  LOCAL
                </strong>
              </div>

              <div>
                <span>
                  STATUS
                </span>

                <strong>
                  ACTIVE
                </strong>
              </div>
            </div>

            {history.length ===
            0 ? (
              <div className="history-empty">
                <div className="history-empty-icon">
                  <Icon
                    name="sparkles"
                    size={25}
                  />
                </div>

                <h3>
                  No generations yet
                </h3>

                <p>
                  Generate your first AI-enhanced
                  post and it will appear here automatically.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setIsHistoryOpen(
                      false
                    )
                  }
                >
                  Start Creating
                </button>
              </div>
            ) : (
              <>
                <div className="history-list">
                  {history.map(
                    (
                      item,
                      index
                    ) => (
                      <article
                        className="history-card"
                        key={
                          item.id
                        }
                      >
                        <div className="history-card-top">
                          <div>
                            <div className="history-source">
                              <span />

                              {
                                item.source ||
                                "Generate"
                              }
                            </div>

                            <div className="history-time">
                              <Icon
                                name="history"
                                size={13}
                              />

                              {formatHistoryDate(
                                item.createdAt
                              )}
                            </div>
                          </div>

                          <div className="history-actions">
                            <button
                              type="button"
                              onClick={() =>
                                restoreHistoryItem(
                                  item
                                )
                              }
                            >
                              <Icon
                                name="refresh"
                                size={13}
                              />

                              Restore
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteHistoryItem(
                                  item.id
                                )
                              }
                              aria-label="Delete history item"
                            >
                              <Icon
                                name="trash"
                                size={14}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="history-version">
                          VERSION{" "}
                          {history.length -
                            index}
                        </div>

                        <div className="history-grid">
                          <div className="history-block">
                            <span>
                              ORIGINAL
                            </span>

                            <p>
                              {
                                item.originalPost
                              }
                            </p>
                          </div>

                          <div className="history-block generated">
                            <span>
                              AI GENERATED
                            </span>

                            <p>
                              {
                                item.generatedPost
                              }
                            </p>
                          </div>
                        </div>

                        {item.metrics && (
                          <div className="history-metrics">
                            <div>
                              <span>
                                Readability
                              </span>

                              <strong>
                                {
                                  item
                                    .metrics
                                    .readability
                                }
                                %
                              </strong>
                            </div>

                            <div>
                              <span>
                                Engagement
                              </span>

                              <strong>
                                {
                                  item
                                    .metrics
                                    .engagement
                                }
                                %
                              </strong>
                            </div>

                            <div>
                              <span>
                                Clarity
                              </span>

                              <strong>
                                {
                                  item
                                    .metrics
                                    .clarity
                                }
                                %
                              </strong>
                            </div>

                            <div>
                              <span>
                                Viral
                              </span>

                              <strong>
                                {
                                  item
                                    .metrics
                                    .viral
                                }
                                %
                              </strong>
                            </div>
                          </div>
                        )}
                      </article>
                    )
                  )}
                </div>

                <div className="history-footer">
                  <span>
                    Stored locally · Up to 50 generations
                  </span>

                  <button
                    type="button"
                    onClick={
                      clearHistory
                    }
                  >
                    <Icon
                      name="trash"
                      size={13}
                    />

                    Clear all
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      );
    };

  /* =========================================================
     RENDER
  ========================================================= */

  const filteredSuggestions =
    getFilteredSuggestions();

  return (
    <>
      <div className="techook-app">
        <div className="bg-glow one" />
        <div className="bg-glow two" />

        <main className="editor-wrapper">
          {/* HEADER */}

          <header className="editor-header">
            <div className="page-title-area">
              <div className="page-title-icon">
                <Icon
                  name="pen"
                  size={29}
                  stroke={1.7}
                />
              </div>

              <div className="page-title-content">
                <h1>
                  Post Editor
                </h1>

                <p>
                  Refine, enhance, and perfect
                  your content with AI
                </p>
              </div>
            </div>

            <div className="header-actions">
              {/* HISTORY */}

              <button
                type="button"
                className="header-button"
                onClick={() =>
                  setIsHistoryOpen(
                    true
                  )
                }
              >
                <Icon
                  name="history"
                  size={17}
                />

                History

                {history.length >
                  0 && (
                  <span className="header-history-count">
                    {history.length}
                  </span>
                )}
              </button>

              {/* SAVE / UNSAVE */}

              <button
                type="button"
                onClick={
                  handleSaveDraft
                }
                className={`save-draft-button ${
                  saved
                    ? "is-saved"
                    : ""
                }`}
                title={
                  saved
                    ? "Click to unsave"
                    : "Save current edited post"
                }
              >
                <span className="save-draft-icon">
                  <Icon
                    name="bookmark"
                    size={16}
                  />
                </span>

                <span>
                  {saved
                    ? "Saved"
                    : "Save Draft"}
                </span>

                {saved && (
                  <span className="save-check">
                    <Icon
                      name="check"
                      size={10}
                      stroke={2.8}
                    />
                  </span>
                )}
              </button>

              {/* COPY EDITED POST */}

              <button
                type="button"
                onClick={
                  handleCopyEditedPost
                }
                className="copy-edited-button"
              >
                <Icon
                  name="copy"
                  size={17}
                />

                <span>
                  Copy Edited Post
                </span>
              </button>
            </div>
          </header>

          {/* WORKSPACE */}

          <section className="workspace">
            {/* LEFT */}

            <aside className="left-column">
              <div className="glass-panel">
                <EditFocus
                  originalPost={
                    currentOriginalPost
                  }
                  apiUrl={
                    API_CONFIG.EDIT_POST
                  }
                  onEditSuccess={
                    handleEditFocusSuccess
                  }
                />
              </div>
            </aside>

            {/* CENTER */}

            <section className="center-column">
              <div className="glass-panel post-panel">
                <OriginalPostCard
                  initialValue={
                    currentOriginalPost
                  }
                  apiEndpoint={
                    API_CONFIG.EDIT_POST
                  }
                  onTextChange={
                    setCurrentOriginalPost
                  }
                  onSubmit={
                    handleOriginalPostSubmit
                  }
                />

                <MainEdits />
              </div>
            </section>

            {/* RIGHT */}

            <aside className="right-column">
              <div className="glass-panel suggestions-panel">
                <div className="ai-title">
                  <span className="ai-title-icon">
                    <Icon
                      name="sparkle"
                      size={20}
                    />
                  </span>

                  <strong>
                    AI Suggestions
                  </strong>

                  {suggestions.length >
                    0 && (
                    <span className="suggestion-count">
                      {suggestions.length}
                    </span>
                  )}
                </div>

                <div className="tabs">
                  {[
                    "All",
                    "Improve",
                    "Hooks",
                    "CTA",
                  ].map(
                    (tab) => (
                      <button
                        key={
                          tab
                        }
                        type="button"
                        className={`tab-button ${
                          activeSuggestionTab ===
                          tab
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setActiveSuggestionTab(
                            tab
                          )
                        }
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>

                <div className="suggestions-list">
                  {isGenerating ||
                  isApplyingSuggestion ||
                  isRegenerating ? (
                    <>
                      <div className="suggestion-skeleton">
                        <div className="skeleton-line short" />
                        <div className="skeleton-line" />
                        <div className="skeleton-line" />
                        <div className="skeleton-button" />
                      </div>

                      <div className="suggestion-skeleton">
                        <div className="skeleton-line short" />
                        <div className="skeleton-line" />
                        <div className="skeleton-line" />
                        <div className="skeleton-button" />
                      </div>
                    </>
                  ) : filteredSuggestions.length >
                    0 ? (
                    filteredSuggestions.map(
                      (
                        suggestion,
                        index
                      ) => (
                        <SuggestionCard
                          key={`${suggestion.type}-${index}`}
                          suggestion={
                            suggestion
                          }
                        />
                      )
                    )
                  ) : (
                    <div className="suggestions-empty">
                      <div className="empty-icon">
                        <Icon
                          name="sparkles"
                          size={20}
                        />
                      </div>

                      <strong>
                        AI Suggestions
                      </strong>

                      <span>
                        Generate your post to receive
                        personalized AI suggestions.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </main>

        <HistoryPanel />

        {toast && (
          <div className="toast">
            <span className="toast-check">
              <Icon
                name="check"
                size={11}
                stroke={2.6}
              />
            </span>

            {toast}
          </div>
        )}
      </div>

    </>
  );
}