import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   CONFIG
========================================================= */

const API_URL = "/api/posteditor/improve";

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
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
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
        <circle cx="12" cy="12" r="3" />
      </>
    ),

    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
        <path d="M3 5v5h5" />
        <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
        <path d="M21 19v-5h-5" />
      </>
    ),

    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    zap: (
      <>
        <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
      </>
    ),

    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
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
  };

  return (
    <svg {...common}>
      {icons[name]}
    </svg>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  label,
  value,
  color,
  loading,
}) => {
  const degrees =
    typeof value === "number"
      ? Math.max(
          0,
          Math.min(100, value)
        ) * 3.6
      : 0;

  return (
    <div className="main-edit-stat">
      <div className="main-edit-stat-ring">
        {loading ? (
          <div className="stat-loader-ring">
            <div className="stat-loader-dot" />
          </div>
        ) : (
          <div
            className="stat-progress"
            style={{
              "--progress": `${degrees}deg`,
              "--stat-color": color,
            }}
          >
            <div className="stat-progress-inner">
              <span>{value}</span>
            </div>
          </div>
        )}
      </div>

      <div className="main-edit-stat-info">
        <span className="main-edit-stat-label">
          {label}
        </span>

        {loading ? (
          <>
            <div className="stat-value-skeleton" />
            <div className="stat-status-skeleton" />
          </>
        ) : (
          <>
            <strong>{value}%</strong>

            <small
              style={{
                color,
              }}
            >
              {value >= 92
                ? "Excellent"
                : value >= 85
                ? "High"
                : "Good"}
            </small>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN EDITS
========================================================= */

export default function MainEdits({
  originalPost = "",
  analyzed = false,

  /*
    Selections coming from EditFocus.
  */
  selectedFocus = "Tone of Voice",
  tone = "Friendly",
  storytellingMode = false,
  instructions = "",

  /*
    Parent receives generated post.
  */
  onGenerateSuccess,
}) {
  const [status, setStatus] = useState(
    analyzed
      ? "ready"
      : "waiting"
  );

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generatedPost, setGeneratedPost] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    generationProgress,
    setGenerationProgress,
  ] = useState(0);

  const [copied, setCopied] =
    useState(false);

  /* =========================================================
     SYNC ANALYSIS STATE
  ========================================================= */

  useEffect(() => {
    if (analyzed) {
      setStatus("ready");
      setError("");
    } else {
      setStatus("waiting");
      setIsGenerating(false);
      setGenerationProgress(0);
      setGeneratedPost("");
    }
  }, [analyzed]);

  /* =========================================================
     PROGRESS ANIMATION
  ========================================================= */

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    setGenerationProgress(8);

    const interval =
      setInterval(() => {
        setGenerationProgress(
          (previous) => {
            if (previous >= 92) {
              return previous;
            }

            const increment =
              previous < 35
                ? 7
                : previous < 65
                ? 4
                : 2;

            return Math.min(
              previous + increment,
              92
            );
          }
        );
      }, 450);

    return () =>
      clearInterval(interval);
  }, [isGenerating]);

  /* =========================================================
     RESPONSE PARSER
  ========================================================= */

  async function readResponse(
    response
  ) {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    const responseText =
      await response.text();

    if (!responseText) {
      return null;
    }

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      try {
        return JSON.parse(
          responseText
        );
      } catch {
        throw new Error(
          "Server returned invalid JSON."
        );
      }
    }

    try {
      return JSON.parse(
        responseText
      );
    } catch {
      return {
        success: response.ok,
        message: responseText,
        data: null,
      };
    }
  }

  /* =========================================================
     BACKEND ERROR
  ========================================================= */

  function getBackendError(
    payload,
    response
  ) {
    return (
      payload?.message ||
      payload?.error ||
      payload?.data?.message ||
      payload?.data?.error ||
      `Request failed with status ${response.status}.`
    );
  }

  /* =========================================================
     EXTRACT EDITED POST
  ========================================================= */

  function extractEditedPost(
    payload
  ) {
    if (!payload) {
      return "";
    }

    const candidates = [
      payload.editedPost,
      payload.edited_post,

      payload.improvedPost,
      payload.improved_post,

      payload.generatedPost,
      payload.generated_post,

      payload.content,

      payload.post,

      payload.text,

      payload.result?.editedPost,
      payload.result?.edited_post,

      payload.result?.improvedPost,
      payload.result?.improved_post,

      payload.result?.generatedPost,
      payload.result?.generated_post,

      payload.result?.content,
      payload.result?.post,
      payload.result?.text,

      payload.output?.editedPost,
      payload.output?.edited_post,

      payload.output?.improvedPost,
      payload.output?.improved_post,

      payload.output?.content,
      payload.output?.post,
      payload.output?.text,

      payload.data?.editedPost,
      payload.data?.edited_post,

      payload.data?.improvedPost,
      payload.data?.improved_post,

      payload.data?.generatedPost,
      payload.data?.generated_post,

      payload.data?.content,
      payload.data?.post,
      payload.data?.text,

      payload.data?.result?.editedPost,
      payload.data?.result?.edited_post,

      payload.data?.result?.improvedPost,
      payload.data?.result?.improved_post,

      payload.data?.result?.content,
      payload.data?.result?.post,
      payload.data?.result?.text,
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
  }

  /* =========================================================
     GENERATE
  ========================================================= */

  const generatePost =
    async () => {
      if (
        !analyzed ||
        isGenerating
      ) {
        return;
      }

      const cleanOriginalPost =
        originalPost.trim();

      if (!cleanOriginalPost) {
        setError(
          "There is no original post to generate."
        );

        return;
      }

      setError("");
      setIsGenerating(true);
      setStatus("generating");
      setGeneratedPost("");
      setCopied(false);
      setGenerationProgress(8);

      const controller =
        new AbortController();

      const timeoutId =
        setTimeout(() => {
          controller.abort();
        }, 60000);

      try {
        /*
         * IMPORTANT
         *
         * MainEdits now uses the SAME endpoint
         * used by OriginalPostCard:
         *
         * POST /api/posteditor/improve
         */

        const payload = {
          /*
           * Original post
           */
          post:
            cleanOriginalPost,

          /*
           * EditFocus selection
           */
          editFocus:
            selectedFocus,

          /*
           * Tone selection
           */
          tone:
            tone,

          /*
           * Storytelling toggle
           */
          storytellingMode:
            storytellingMode,

          /*
           * Custom instructions
           */
          customInstructions:
            instructions || "",

          /*
           * Extra aliases.
           *
           * These make the request compatible
           * with different backend controller
           * implementations without changing
           * the main API contract.
           */
          originalPost:
            cleanOriginalPost,

          focus:
            selectedFocus,

          selectedFocus,

          instructions:
            instructions || "",
        };

        console.log(
          "================================="
        );

        console.log(
          "MAIN EDITS GENERATE REQUEST"
        );

        console.log(
          "URL:",
          API_URL
        );

        console.log(
          "Payload:",
          payload
        );

        console.log(
          "================================="
        );

        const response =
          await fetch(
            API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),

              signal:
                controller.signal,
            }
          );

        const result =
          await readResponse(
            response
          );

        console.log(
          "================================="
        );

        console.log(
          "MAIN EDITS GENERATE RESPONSE"
        );

        console.log(
          "Status:",
          response.status
        );

        console.log(
          "OK:",
          response.ok
        );

        console.log(
          "Response:",
          result
        );

        console.log(
          "================================="
        );

        /* =====================================================
           HTTP ERRORS
        ====================================================== */

        if (!response.ok) {
          if (
            response.status ===
            404
          ) {
            throw new Error(
              `API endpoint not found: POST ${API_URL}.`
            );
          }

          if (
            response.status ===
            400
          ) {
            throw new Error(
              result?.message ||
                result?.error ||
                "Invalid post data sent to the server."
            );
          }

          if (
            response.status ===
            401
          ) {
            throw new Error(
              "You are not authorized to generate this post."
            );
          }

          if (
            response.status ===
            403
          ) {
            throw new Error(
              "You do not have permission to generate this post."
            );
          }

          if (
            response.status >=
            500
          ) {
            throw new Error(
              result?.message ||
                result?.error ||
                "The AI service encountered a server error."
            );
          }

          throw new Error(
            getBackendError(
              result,
              response
            )
          );
        }

        /* =====================================================
           BACKEND LEVEL ERROR
        ====================================================== */

        if (
          result?.success ===
          false
        ) {
          throw new Error(
            result?.message ||
              result?.error ||
              "The server could not generate the post."
          );
        }

        /* =====================================================
           EXTRACT GENERATED POST
        ====================================================== */

        const editedPost =
          extractEditedPost(
            result
          );

        if (!editedPost) {
          console.error(
            "MAIN EDITS: No edited post found in response.",
            result
          );

          throw new Error(
            "The AI response did not contain an edited post."
          );
        }

        /* =====================================================
           COMPLETE PROGRESS
        ====================================================== */

        setGenerationProgress(
          100
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              450
            )
        );

        /* =====================================================
           SHOW RESULT
        ====================================================== */

        setGeneratedPost(
          editedPost
        );

        setStatus(
          "generated"
        );

        if (
          typeof onGenerateSuccess ===
          "function"
        ) {
          onGenerateSuccess(
            editedPost,
            result
          );
        }
      } catch (err) {
        console.error(
          "================================="
        );

        console.error(
          "MAIN EDITS GENERATE ERROR"
        );

        console.error(err);

        console.error(
          "================================="
        );

        let message =
          "We couldn't connect to the AI service. Please try again.";

        if (
          err?.name ===
          "AbortError"
        ) {
          message =
            "The AI request took too long. Please check your backend and try again.";
        } else if (
          err?.message
        ) {
          message =
            err.message;
        }

        setError(
          message
        );

        setStatus(
          "ready"
        );
      } finally {
        clearTimeout(
          timeoutId
        );

        setIsGenerating(
          false
        );
      }
    };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics =
    useMemo(() => {
      if (isGenerating) {
        return {
          readability: null,
          engagement: null,
          clarity: null,
          viral: null,
        };
      }

      if (!generatedPost) {
        return {
          readability: null,
          engagement: null,
          clarity: null,
          viral: null,
        };
      }

      const sentences =
        generatedPost
          .split(/[.!?]+/)
          .filter(Boolean)
          .length;

      const words =
        generatedPost
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .length;

      const emojiCount =
        (
          generatedPost.match(
            /[\u{1F300}-\u{1FAFF}]/gu
          ) || []
        ).length;

      const paragraphs =
        generatedPost
          .split(/\n\s*\n/)
          .filter(Boolean)
          .length;

      const averageWordsPerSentence =
        sentences > 0
          ? words /
            sentences
          : words;

      const readabilityBase =
        94 -
        Math.max(
          0,
          averageWordsPerSentence -
            18
        ) *
          1.2;

      const engagementBase =
        79 +
        Math.min(
          9,
          paragraphs * 1.3
        ) +
        Math.min(
          7,
          emojiCount * 1.5
        );

      const clarityBase =
        96 -
        Math.max(
          0,
          averageWordsPerSentence -
            16
        );

      const viralBase =
        82 +
        Math.min(
          8,
          emojiCount * 1.3
        ) +
        (selectedFocus ===
        "Hook"
          ? 5
          : 0) +
        (selectedFocus ===
        "CTA"
          ? 4
          : 0);

      return {
        readability:
          Math.round(
            Math.max(
              72,
              Math.min(
                99,
                readabilityBase
              )
            )
          ),

        engagement:
          Math.round(
            Math.max(
              70,
              Math.min(
                98,
                engagementBase
              )
            )
          ),

        clarity:
          Math.round(
            Math.max(
              75,
              Math.min(
                99,
                clarityBase
              )
            )
          ),

        viral:
          Math.round(
            Math.max(
              70,
              Math.min(
                98,
                viralBase
              )
            )
          ),
      };
    }, [
      generatedPost,
      isGenerating,
      selectedFocus,
    ]);

  /* =========================================================
     COPY
  ========================================================= */

  const copyPost =
    async () => {
      if (!generatedPost) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          generatedPost
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch (err) {
        console.error(
          "Copy failed:",
          err
        );

        setError(
          "Could not copy the generated post."
        );
      }
    };

  /* =========================================================
     STATES
  ========================================================= */

  const isWaiting =
    !analyzed ||
    status === "waiting";

  const showLoading =
    isGenerating ||
    status === "generating";

  const showGenerated =
    status === "generated" &&
    Boolean(generatedPost) &&
    !isGenerating;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .main-edits-card {
          position: relative;
          width: 100%;
          overflow: hidden;

          padding: 20px;

          border-radius: 18px;

          border: 1px solid rgba(124, 92, 246, 0.18);

          background:
            radial-gradient(
              circle at 8% 0%,
              rgba(139, 92, 246, 0.11),
              transparent 30%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(59, 130, 246, 0.05),
              transparent 28%
            ),
            linear-gradient(
              145deg,
              rgba(13, 18, 40, 0.98),
              rgba(7, 11, 27, 0.98)
            );

          color: #eef0ff;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          box-shadow:
            0 24px 60px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
        }

        .main-edits-card.generated {
          border-color: rgba(139, 92, 246, 0.28);
        }

        .main-edits-card.generating {
          border-color: rgba(139, 92, 246, 0.3);
        }

        .main-edits-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;

          margin-bottom: 18px;
        }

        .main-edits-title-area {
          display: flex;
          align-items: center;
          gap: 11px;

          min-width: 0;
        }

        .main-edits-icon {
          width: 42px;
          height: 42px;

          flex: 0 0 42px;

          display: grid;
          place-items: center;

          border-radius: 13px;

          color: #b56cff;

          border: 1px solid rgba(160, 110, 255, 0.26);

          background:
            linear-gradient(
              145deg,
              rgba(139, 92, 246, 0.2),
              rgba(67, 35, 130, 0.08)
            );
        }

        .main-edits-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .main-edits-title-row h3 {
          margin: 0;

          color: #f5f4ff;

          font-size: 15px;
          line-height: 1.2;
          font-weight: 750;
        }

        .main-edits-tag {
          display: inline-flex;
          align-items: center;

          padding: 4px 7px;

          border-radius: 6px;

          border: 1px solid rgba(139, 92, 246, 0.22);

          background: rgba(124, 58, 237, 0.1);

          color: #b98cff;

          font-size: 9px;
          font-weight: 800;
        }

        .main-edits-title-area p {
          margin: 5px 0 0;

          color: #737d9d;

          font-size: 10px;
          line-height: 1.4;
        }

        .main-edits-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 7px 9px;

          border-radius: 8px;

          border: 1px solid rgba(120, 131, 170, 0.1);

          background: rgba(255, 255, 255, 0.015);

          color: #7d86a4;

          font-size: 9px;
          font-weight: 700;

          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;
        }

        .waiting-dot {
          background: #68738f;
        }

        .ready-dot {
          background: #8b5cf6;

          box-shadow:
            0 0 9px rgba(139, 92, 246, 0.75);
        }

        .generating-dot {
          background: #b36cff;

          box-shadow:
            0 0 10px rgba(179, 108, 255, 0.85);

          animation:
            statusPulse 1s ease-in-out infinite;
        }

        .generated-dot {
          background: #20d86e;

          box-shadow:
            0 0 9px rgba(32, 216, 110, 0.6);
        }

        @keyframes statusPulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.85);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        /* =====================================================
           WAITING
        ====================================================== */

        .main-edits-waiting {
          min-height: 330px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          padding: 34px 20px;

          border-radius: 14px;

          border: 1px solid rgba(82, 96, 140, 0.14);

          background:
            linear-gradient(
              145deg,
              rgba(8, 13, 30, 0.74),
              rgba(5, 9, 23, 0.8)
            );
        }

        .waiting-orbit {
          position: relative;

          width: 94px;
          height: 94px;

          display: grid;
          place-items: center;

          margin-bottom: 22px;
        }

        .orbit-ring {
          position: absolute;

          border-radius: 50%;

          border: 1px solid rgba(139, 92, 246, 0.16);
        }

        .ring-one {
          width: 62px;
          height: 62px;
        }

        .ring-two {
          width: 78px;
          height: 78px;

          border-color: rgba(139, 92, 246, 0.1);
        }

        .ring-three {
          width: 94px;
          height: 94px;

          border-color: rgba(139, 92, 246, 0.06);
        }

        .waiting-core {
          position: relative;
          z-index: 2;

          width: 54px;
          height: 54px;

          display: grid;
          place-items: center;

          border-radius: 17px;

          border: 1px solid rgba(153, 102, 255, 0.28);

          background:
            linear-gradient(
              145deg,
              rgba(108, 47, 210, 0.18),
              rgba(25, 22, 58, 0.7)
            );

          color: #a76aff;

          box-shadow:
            0 14px 35px rgba(92, 48, 190, 0.18);
        }

        .waiting-content {
          max-width: 430px;
        }

        .waiting-content h4 {
          margin: 0 0 8px;

          color: #b6bdd3;

          font-size: 15px;
          font-weight: 750;
        }

        .waiting-content p {
          margin: 0 auto;

          max-width: 380px;

          color: #646e8b;

          font-size: 11px;
          line-height: 1.7;
        }

        .waiting-line {
          width: 190px;
          height: 2px;

          overflow: hidden;

          margin: 20px auto 14px;

          border-radius: 20px;

          background: rgba(139, 92, 246, 0.06);
        }

        .waiting-line span {
          display: block;

          width: 40%;
          height: 100%;

          margin-left: -40%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              transparent,
              #8b5cf6,
              transparent
            );

          animation:
            waitingLine 2.2s ease-in-out infinite;
        }

        @keyframes waitingLine {
          0% {
            margin-left: -40%;
          }

          100% {
            margin-left: 100%;
          }
        }

        .waiting-hint {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          color: #59637e;

          font-size: 9px;
          font-weight: 600;
        }

        .waiting-hint > span {
          width: 20px;
          height: 20px;

          display: grid;
          place-items: center;

          border-radius: 6px;

          color: #a26bff;

          background: rgba(124, 58, 237, 0.09);
        }

        .waiting-hint strong {
          color: #8f75bd;
        }

        /* =====================================================
           READY
        ====================================================== */

        .main-edits-ready {
          min-height: 330px;

          padding: 25px;

          border-radius: 14px;

          border: 1px solid rgba(82, 96, 140, 0.14);

          background:
            linear-gradient(
              145deg,
              rgba(8, 13, 30, 0.74),
              rgba(5, 9, 23, 0.8)
            );
        }

        .ready-preview {
          position: relative;

          min-height: 205px;

          overflow: hidden;

          padding: 25px;

          border-radius: 12px;

          border: 1px solid rgba(82, 96, 140, 0.12);

          background: rgba(255, 255, 255, 0.012);
        }

        .preview-shimmer {
          height: 10px;

          margin-bottom: 16px;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              rgba(92, 104, 142, 0.12),
              rgba(139, 92, 246, 0.14),
              rgba(92, 104, 142, 0.12)
            );

          background-size: 220% 100%;

          animation:
            shimmer 2s linear infinite;
        }

        .preview-shimmer.one {
          width: 85%;
        }

        .preview-shimmer.two {
          width: 96%;
        }

        .preview-shimmer.three {
          width: 72%;
        }

        .preview-shimmer.four {
          width: 55%;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -20% 0;
          }
        }

        .ready-message {
          display: flex;
          align-items: center;
          gap: 12px;

          margin-top: 16px;

          padding: 12px 14px;

          border-radius: 10px;

          border: 1px solid rgba(124, 92, 246, 0.13);

          background: rgba(124, 58, 237, 0.055);
        }

        .ready-message-icon {
          width: 34px;
          height: 34px;

          flex: 0 0 34px;

          display: grid;
          place-items: center;

          border-radius: 10px;

          color: #ae72ff;

          background: rgba(124, 58, 237, 0.1);
        }

        .ready-message strong {
          display: block;

          margin-bottom: 3px;

          color: #aeb6ce;

          font-size: 11px;
          font-weight: 750;
        }

        .ready-message span {
          display: block;

          color: #606b87;

          font-size: 10px;
          line-height: 1.5;
        }

        /* =====================================================
           GENERATING
        ====================================================== */

        .main-edits-generating {
          min-height: 470px;

          padding: 22px;

          border-radius: 14px;

          border: 1px solid rgba(82, 96, 140, 0.14);

          background:
            linear-gradient(
              145deg,
              rgba(8, 13, 30, 0.74),
              rgba(5, 9, 23, 0.8)
            );
        }

        .generating-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .ai-processing {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .processing-orb {
          position: relative;

          width: 48px;
          height: 48px;

          flex: 0 0 48px;

          display: grid;
          place-items: center;

          border-radius: 15px;

          border: 1px solid rgba(139, 92, 246, 0.25);

          background:
            linear-gradient(
              145deg,
              rgba(124, 58, 237, 0.18),
              rgba(25, 22, 58, 0.55)
            );

          color: #b16cff;
        }

        .processing-ring {
          position: absolute;

          width: 62px;
          height: 62px;

          border-radius: 50%;

          border: 1px solid rgba(139, 92, 246, 0.1);

          border-top-color: rgba(179, 108, 255, 0.7);

          animation:
            spin 1.5s linear infinite;
        }

        .ring-delay {
          width: 72px;
          height: 72px;

          border-top-color: rgba(59, 130, 246, 0.35);

          animation-duration: 2.2s;

          animation-direction: reverse;
        }

        .ai-processing strong {
          display: block;

          margin-bottom: 4px;

          color: #b4bdd4;

          font-size: 12px;
          font-weight: 750;
        }

        .ai-processing span {
          display: block;

          color: #606a87;

          font-size: 10px;
          line-height: 1.5;
        }

        .progress-number {
          color: #a86cff;

          font-size: 15px;
          font-weight: 800;
        }

        .generation-progress {
          position: relative;

          width: 100%;
          height: 5px;

          overflow: hidden;

          margin-top: 22px;

          border-radius: 20px;

          background: rgba(139, 92, 246, 0.08);
        }

        .generation-progress-bar {
          position: relative;
          z-index: 2;

          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #6d28d9,
              #9a4dff,
              #6c63ff
            );

          transition:
            width 350ms ease;
        }

        .progress-glow {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(179, 108, 255, 0.5),
              transparent
            );

          animation:
            progressGlow 1.7s linear infinite;
        }

        @keyframes progressGlow {
          from {
            transform: translateX(-100%);
          }

          to {
            transform: translateX(100%);
          }
        }

        .generation-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          margin-top: 12px;

          color: #515b76;

          font-size: 9px;
          font-weight: 650;
        }

        .generation-steps span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .generation-steps .completed {
          color: #8e78b8;
        }

        .generation-steps .active-step {
          color: #ae75ff;
        }

        .mini-spinner {
          width: 10px;
          height: 10px;

          border-radius: 50%;

          border: 1.5px solid rgba(174, 117, 255, 0.25);
          border-top-color: #ae75ff;

          animation:
            spin 700ms linear infinite;
        }

        .step-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #3f4963;
        }

        .generated-skeleton {
          margin-top: 25px;

          min-height: 210px;

          padding: 22px;

          border-radius: 12px;

          border: 1px solid rgba(82, 96, 140, 0.11);

          background: rgba(255, 255, 255, 0.012);
        }

        .skeleton-label {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 24px;
        }

        .skeleton-label span {
          display: block;

          height: 8px;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              rgba(92, 104, 142, 0.08),
              rgba(139, 92, 246, 0.16),
              rgba(92, 104, 142, 0.08)
            );

          background-size: 200% 100%;

          animation:
            shimmer 1.8s linear infinite;
        }

        .skeleton-label span:first-child {
          width: 125px;
        }

        .skeleton-label span:last-child {
          width: 55px;
        }

        .skeleton-lines {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .skeleton-lines span {
          display: block;

          height: 9px;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              rgba(92, 104, 142, 0.08),
              rgba(139, 92, 246, 0.14),
              rgba(92, 104, 142, 0.08)
            );

          background-size: 200% 100%;

          animation:
            shimmer 1.8s linear infinite;
        }

        .skeleton-lines span:nth-child(1) {
          width: 94%;
        }

        .skeleton-lines span:nth-child(2) {
          width: 88%;
          animation-delay: 0.08s;
        }

        .skeleton-lines span:nth-child(3) {
          width: 97%;
          animation-delay: 0.16s;
        }

        .skeleton-lines span:nth-child(4) {
          width: 79%;
          animation-delay: 0.24s;
        }

        .skeleton-lines span:nth-child(5) {
          width: 91%;
          animation-delay: 0.32s;
        }

        .skeleton-lines span:nth-child(6) {
          width: 65%;
          animation-delay: 0.4s;
        }

        /* =====================================================
           RESULT
        ====================================================== */

        .main-edits-result {
          animation:
            resultAppear 450ms ease both;
        }

        @keyframes resultAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .generated-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 14px;

          margin-bottom: 10px;
        }

        .generated-result-header > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .result-label {
          color: #aeb6ce;

          font-size: 11px;
          font-weight: 750;
        }

        .result-focus {
          padding: 4px 7px;

          border-radius: 6px;

          background: rgba(124, 58, 237, 0.09);

          border: 1px solid rgba(139, 92, 246, 0.14);

          color: #9d76d1;

          font-size: 8px;
          font-weight: 700;
        }

        .copy-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;

          padding: 7px 10px;

          border-radius: 7px;

          border: 1px solid rgba(120, 131, 170, 0.12);

          background: rgba(255, 255, 255, 0.02);

          color: #7e88a4;

          font-family: inherit;

          font-size: 9px;
          font-weight: 700;

          cursor: pointer;

          transition:
            color 160ms ease,
            border-color 160ms ease,
            background 160ms ease;
        }

        .copy-button:hover {
          color: #b58aff;

          border-color: rgba(139, 92, 246, 0.3);

          background: rgba(124, 58, 237, 0.06);
        }

        .generated-post {
          min-height: 210px;

          padding: 20px;

          overflow: auto;

          white-space: pre-wrap;
          word-break: break-word;

          border-radius: 13px;

          border: 1px solid rgba(139, 92, 246, 0.15);

          background:
            linear-gradient(
              145deg,
              rgba(8, 13, 30, 0.92),
              rgba(5, 9, 23, 0.95)
            );

          color: #dfe3f1;

          font-size: 13px;
          line-height: 1.8;
          font-weight: 500;

          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.015);
        }

        /* =====================================================
           STATS
        ====================================================== */

        .main-edits-stats {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 10px;

          margin-top: 13px;
        }

        .main-edit-stat {
          display: flex;
          align-items: center;
          gap: 9px;

          min-width: 0;

          padding: 11px;

          border-radius: 11px;

          border: 1px solid rgba(82, 96, 140, 0.13);

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.018),
              rgba(255, 255, 255, 0.008)
            );
        }

        .main-edit-stat-ring {
          width: 40px;
          height: 40px;

          flex: 0 0 40px;

          display: grid;
          place-items: center;
        }

        .stat-progress {
          position: relative;

          width: 40px;
          height: 40px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          background:
            conic-gradient(
              var(--stat-color)
                var(--progress),
              rgba(255, 255, 255, 0.06)
                var(--progress)
            );
        }

        .stat-progress::before {
          content: "";

          position: absolute;
          inset: 4px;

          border-radius: 50%;

          background: #0b1025;
        }

        .stat-progress-inner {
          position: relative;
          z-index: 2;

          display: grid;
          place-items: center;

          width: 100%;
          height: 100%;
        }

        .stat-progress-inner span {
          color: #c5cbe0;

          font-size: 9px;
          font-weight: 800;
        }

        .main-edit-stat-info {
          min-width: 0;
        }

        .main-edit-stat-label {
          display: block;

          margin-bottom: 3px;

          overflow: hidden;

          color: #606a86;

          font-size: 8px;
          font-weight: 700;

          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .main-edit-stat-info strong {
          display: block;

          color: #d7dbea;

          font-size: 13px;
          line-height: 1.2;
        }

        .main-edit-stat-info small {
          display: block;

          margin-top: 2px;

          font-size: 8px;
          font-weight: 700;
        }

        .stat-loader-ring {
          position: relative;

          width: 40px;
          height: 40px;

          display: grid;
          place-items: center;

          border-radius: 50%;

          border: 2px solid rgba(139, 92, 246, 0.08);

          border-top-color: rgba(139, 92, 246, 0.65);

          animation:
            spin 1.2s linear infinite;
        }

        .stat-loader-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #9c62ff;

          box-shadow:
            0 0 10px rgba(156, 98, 255, 0.6);
        }

        .stat-value-skeleton {
          width: 30px;
          height: 8px;

          margin-top: 5px;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              rgba(92, 104, 142, 0.08),
              rgba(139, 92, 246, 0.15),
              rgba(92, 104, 142, 0.08)
            );

          background-size: 200% 100%;

          animation:
            shimmer 1.7s linear infinite;
        }

        .stat-status-skeleton {
          width: 42px;
          height: 6px;

          margin-top: 5px;

          border-radius: 20px;

          background: rgba(92, 104, 142, 0.08);
        }

        /* =====================================================
           ERROR
        ====================================================== */

        .main-edits-error {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-top: 11px;

          padding: 10px 12px;

          border-radius: 9px;

          border: 1px solid rgba(239, 68, 68, 0.2);

          background: rgba(239, 68, 68, 0.06);

          color: #f48d8d;

          font-size: 10px;
          line-height: 1.45;
        }

        .error-icon {
          width: 22px;
          height: 22px;

          flex: 0 0 22px;

          display: grid;
          place-items: center;

          border-radius: 6px;

          color: #ff8b8b;

          background: rgba(239, 68, 68, 0.08);
        }

        .main-edits-error span {
          flex: 1;
        }

        .main-edits-error button {
          width: 22px;
          height: 22px;

          display: grid;
          place-items: center;

          padding: 0;

          border: 0;

          background: transparent;

          color: #e98b8b;

          cursor: pointer;

          font-size: 17px;
        }

        /* =====================================================
           FOOTER
        ====================================================== */

        .main-edits-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 18px;

          margin-top: 15px;
          padding-top: 2px;
        }

        .footer-info {
          display: flex;
          align-items: center;
          gap: 7px;

          color: #626c87;

          font-size: 9px;
          font-weight: 600;
        }

        .footer-success,
        .footer-ai,
        .footer-muted {
          width: 20px;
          height: 20px;

          display: grid;
          place-items: center;

          border-radius: 6px;
        }

        .footer-success {
          color: #20d86e;
          background: rgba(32, 216, 110, 0.08);
        }

        .footer-ai {
          color: #a66aff;
          background: rgba(124, 58, 237, 0.09);
        }

        .footer-muted {
          color: #66718e;
          background: rgba(255, 255, 255, 0.025);
        }

        .footer-spinner {
          width: 13px;
          height: 13px;

          border-radius: 50%;

          border: 1.5px solid rgba(139, 92, 246, 0.18);
          border-top-color: #a66aff;

          animation:
            spin 700ms linear infinite;
        }

        .main-generate-button {
          position: relative;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-width: 125px;

          padding: 10px 16px;

          border-radius: 10px;

          border: 1px solid rgba(174, 110, 255, 0.3);

          background:
            linear-gradient(
              135deg,
              #7c3aed 0%,
              #8b3df2 50%,
              #5f5cff 100%
            );

          color: #ffffff;

          font-family: inherit;

          font-size: 10px;
          font-weight: 750;

          cursor: pointer;

          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            opacity 180ms ease;
        }

        .main-generate-button:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 15px 36px rgba(103, 55, 215, 0.34);
        }

        .main-generate-button:disabled {
          cursor: not-allowed;

          opacity: 0.4;

          box-shadow: none;

          transform: none;
        }

        .main-generate-button.loading {
          opacity: 0.85;
        }

        .button-spinner {
          width: 12px;
          height: 12px;

          border-radius: 50%;

          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;

          animation:
            spin 700ms linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 800px) {
          .main-edits-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .main-edits-card {
            padding: 16px;
            border-radius: 15px;
          }

          .main-edits-header {
            align-items: flex-start;
          }

          .main-edits-status {
            display: none;
          }

          .main-edits-ready {
            padding: 16px;
          }

          .main-edits-generating {
            padding: 16px;
          }

          .generation-steps {
            flex-wrap: wrap;
          }

          .main-edits-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .main-generate-button {
            width: 100%;
            min-height: 44px;
          }
        }

        @media (max-width: 480px) {
          .main-edits-stats {
            grid-template-columns: 1fr;
          }

          .generated-result-header {
            align-items: flex-start;
          }

          .generated-result-header > div {
            flex-wrap: wrap;
          }

          .main-edits-title-area {
            gap: 9px;
          }

          .main-edits-icon {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
            border-radius: 11px;
          }

          .generated-post {
            padding: 16px;
          }

          .generation-steps {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }
        }
      `}</style>

      <div
        className={`
          main-edits-card
          ${isWaiting ? "waiting" : ""}
          ${showLoading ? "generating" : ""}
          ${showGenerated ? "generated" : ""}
        `}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="main-edits-header">
          <div className="main-edits-title-area">
            <div className="main-edits-icon">
              <Icon
                name="sparkle"
                size={19}
              />
            </div>

            <div>
              <div className="main-edits-title-row">
                <h3>
                  Main Edits
                </h3>

                <span className="main-edits-tag">
                  AI
                </span>
              </div>

              <p>
                Your AI-enhanced version
              </p>
            </div>
          </div>

          <div className="main-edits-status">
            {isWaiting && (
              <>
                <span className="status-dot waiting-dot" />
                Waiting for analysis
              </>
            )}

            {!isWaiting &&
              !showLoading &&
              !showGenerated && (
                <>
                  <span className="status-dot ready-dot" />
                  Ready to generate
                </>
              )}

            {showLoading && (
              <>
                <span className="status-dot generating-dot" />
                AI is working
              </>
            )}

            {showGenerated && (
              <>
                <span className="status-dot generated-dot" />
                Generated
              </>
            )}
          </div>
        </div>

        {/* =====================================================
            WAITING STATE
        ====================================================== */}

        {isWaiting && (
          <div className="main-edits-waiting">
            <div className="waiting-orbit">
              <div className="orbit-ring ring-one" />
              <div className="orbit-ring ring-two" />
              <div className="orbit-ring ring-three" />

              <div className="waiting-core">
                <Icon
                  name="clock"
                  size={24}
                />
              </div>
            </div>

            <div className="waiting-content">
              <h4>
                Waiting for Analysis
              </h4>

              <p>
                Analyze your original post first.
                Once your analysis is ready,
                you can generate the optimized
                version here.
              </p>

              <div className="waiting-line">
                <span />
              </div>

              <div className="waiting-hint">
                <span>
                  <Icon
                    name="sparkle"
                    size={13}
                  />
                </span>

                Waiting for the{" "}
                <strong>
                  Analyzed
                </strong>{" "}
                action
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            READY STATE
        ====================================================== */}

        {!isWaiting &&
          !showLoading &&
          !showGenerated && (
            <div className="main-edits-ready">
              <div className="ready-preview">
                <div className="preview-shimmer one" />
                <div className="preview-shimmer two" />
                <div className="preview-shimmer three" />
                <div className="preview-shimmer four" />
              </div>

              <div className="ready-message">
                <div className="ready-message-icon">
                  <Icon
                    name="zap"
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Ready for AI generation
                  </strong>

                  <span>
                    Your analysis is complete.
                    Generate the optimized post
                    when you're ready.
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* =====================================================
            GENERATING STATE
        ====================================================== */}

        {showLoading && (
          <div className="main-edits-generating">
            <div className="generating-top">
              <div className="ai-processing">
                <div className="processing-orb">
                  <div className="processing-ring" />
                  <div className="processing-ring ring-delay" />

                  <Icon
                    name="sparkle"
                    size={22}
                  />
                </div>

                <div>
                  <strong>
                    Enhancing your post...
                  </strong>

                  <span>
                    AI is rewriting, refining,
                    and optimizing your content
                  </span>
                </div>
              </div>

              <div className="progress-number">
                {generationProgress}%
              </div>
            </div>

            <div className="generation-progress">
              <div
                className="generation-progress-bar"
                style={{
                  width: `${generationProgress}%`,
                }}
              />

              <div className="progress-glow" />
            </div>

            <div className="generation-steps">
              <span className="completed">
                <Icon
                  name="check"
                  size={12}
                />
                Analyzing
              </span>

              <span
                className={
                  generationProgress >= 35
                    ? "completed"
                    : "active-step"
                }
              >
                {generationProgress >= 35 ? (
                  <Icon
                    name="check"
                    size={12}
                  />
                ) : (
                  <span className="mini-spinner" />
                )}

                Improving
              </span>

              <span
                className={
                  generationProgress >= 70
                    ? "completed"
                    : ""
                }
              >
                {generationProgress >= 70 ? (
                  <Icon
                    name="check"
                    size={12}
                  />
                ) : (
                  <span className="step-dot" />
                )}

                Optimizing
              </span>

              <span
                className={
                  generationProgress >= 95
                    ? "completed"
                    : ""
                }
              >
                {generationProgress >= 95 ? (
                  <Icon
                    name="check"
                    size={12}
                  />
                ) : (
                  <span className="step-dot" />
                )}

                Finalizing
              </span>
            </div>

            <div className="generated-skeleton">
              <div className="skeleton-label">
                <span />
                <span />
              </div>

              <div className="skeleton-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="main-edits-stats loading-stats">
              <StatCard
                label="Readability"
                value={null}
                loading
              />

              <StatCard
                label="Engagement"
                value={null}
                loading
              />

              <StatCard
                label="Clarity"
                value={null}
                loading
              />

              <StatCard
                label="Viral Score"
                value={null}
                loading
              />
            </div>
          </div>
        )}

        {/* =====================================================
            GENERATED STATE
        ====================================================== */}

        {showGenerated && (
          <div className="main-edits-result">
            <div className="generated-result-header">
              <div>
                <span className="result-label">
                  AI Enhanced Post
                </span>

                <span className="result-focus">
                  {selectedFocus}
                </span>
              </div>

              <button
                type="button"
                className="copy-button"
                onClick={
                  copyPost
                }
              >
                <Icon
                  name={
                    copied
                      ? "check"
                      : "copy"
                  }
                  size={14}
                />

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <div className="generated-post">
              {generatedPost}
            </div>

            <div className="main-edits-stats">
              <StatCard
                label="Readability"
                value={
                  statistics.readability
                }
                color="#9a42ff"
              />

              <StatCard
                label="Engagement"
                value={
                  statistics.engagement
                }
                color="#20d86e"
              />

              <StatCard
                label="Clarity"
                value={
                  statistics.clarity
                }
                color="#3280ff"
              />

              <StatCard
                label="Viral Score"
                value={
                  statistics.viral
                }
                color="#9d43ff"
              />
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            className="main-edits-error"
            role="alert"
            aria-live="polite"
          >
            <div className="error-icon">
              <Icon
                name="alert"
                size={15}
              />
            </div>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="main-edits-footer">
          <div className="footer-info">
            {showGenerated ? (
              <>
                <span className="footer-success">
                  <Icon
                    name="check"
                    size={12}
                  />
                </span>

                AI optimization complete
              </>
            ) : showLoading ? (
              <>
                <span className="footer-spinner" />

                Processing your content...
              </>
            ) : isWaiting ? (
              <>
                <span className="footer-muted">
                  <Icon
                    name="clock"
                    size={13}
                  />
                </span>

                Analysis required first
              </>
            ) : (
              <>
                <span className="footer-ai">
                  <Icon
                    name="sparkle"
                    size={13}
                  />
                </span>

                AI ready
              </>
            )}
          </div>

          <button
            type="button"
            className={`
              main-generate-button
              ${
                isWaiting
                  ? "disabled"
                  : ""
              }
              ${
                showLoading
                  ? "loading"
                  : ""
              }
            `}
            disabled={
              isWaiting ||
              isGenerating
            }
            onClick={
              generatePost
            }
          >
            {showLoading ? (
              <>
                <span className="button-spinner" />
                Generating...
              </>
            ) : showGenerated ? (
              <>
                <Icon
                  name="refresh"
                  size={16}
                />

                Generate Again
              </>
            ) : (
              <>
                <Icon
                  name="sparkle"
                  size={16}
                />

                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}