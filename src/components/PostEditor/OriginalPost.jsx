import React, { useEffect, useState } from "react";

const DEFAULT_ENDPOINT =
  "https://cont-creator-3uvg.vercel.app/";

export default function OriginalPostCard({
  initialValue = "",
  onSubmit,
  onTextChange,
  apiEndpoint = DEFAULT_ENDPOINT,
}) {
  const [text, setText] = useState(initialValue);
  const [summary, setSummary] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const characterCount = text.length;

  const wordCount = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  /* =========================================================
     SYNC WITH PARENT
     ========================================================= */

  useEffect(() => {
    setText(initialValue || "");
  }, [initialValue]);

  /* =========================================================
     LIVE SUMMARY
     ========================================================= */

  useEffect(() => {
    if (!text.trim()) {
      setSummary("");
      return;
    }

    const timer = setTimeout(() => {
      const cleanText = text.trim();

      const words = cleanText.split(/\s+/).length;

      if (cleanText.length < 40) {
        setSummary(
          "Good start. Add more context so AI can create a stronger refinement."
        );
      } else if (words < 25) {
        setSummary(
          `${words} words detected. Your draft has a solid start, but more detail can improve the final result.`
        );
      } else {
        setSummary(
          `${words} words detected. Your content is ready for AI analysis and refinement.`
        );
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [text]);

  /* =========================================================
     RESPONSE PARSER
     ========================================================= */

  async function readResponse(response) {
    const contentType =
      response.headers.get("content-type") || "";

    const responseText = await response.text();

    if (!responseText) {
      return null;
    }

    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(responseText);
      } catch {
        throw new Error("Server returned invalid JSON.");
      }
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        success: response.ok,
        message: responseText,
        data: null,
      };
    }
  }

  /* =========================================================
     ERROR MESSAGE
     ========================================================= */

  function getBackendError(payload, response) {
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

  function extractEditedPost(payload) {
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

      payload.result?.editedPost,
      payload.result?.edited_post,
      payload.result?.improvedPost,
      payload.result?.improved_post,
      payload.result?.content,
      payload.result?.post,

      payload.data?.editedPost,
      payload.data?.edited_post,
      payload.data?.improvedPost,
      payload.data?.improved_post,
      payload.data?.generatedPost,
      payload.data?.generated_post,
      payload.data?.content,
      payload.data?.post,

      payload.data?.result?.editedPost,
      payload.data?.result?.edited_post,
      payload.data?.result?.content,
    ];

    for (const candidate of candidates) {
      if (
        typeof candidate === "string" &&
        candidate.trim()
      ) {
        return candidate.trim();
      }
    }

    return "";
  }

  /* =========================================================
     ANALYZE
     ========================================================= */

  async function handleAnalyze() {
    const cleanText = text.trim();

    if (!cleanText) {
      setError("Please write or paste your post first.");
      return;
    }

    if (isAnalyzing) {
      return;
    }

    setError("");
    setIsAnalyzing(true);

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 120000);

    try {
      const payload = {
        post: cleanText,
        editFocus: "general",
        tone: "friendly",
        customInstructions: "",
      };

      console.log("=================================");
      console.log("ORIGINAL POST ANALYZE REQUEST");
      console.log("URL:", apiEndpoint);
      console.log("Payload:", payload);
      console.log("=================================");

      const response = await fetch(apiEndpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(payload),

        signal: controller.signal,
      });

      const result = await readResponse(response);

      console.log("=================================");
      console.log("ORIGINAL POST ANALYZE RESPONSE");
      console.log("Status:", response.status);
      console.log("OK:", response.ok);
      console.log("Response:", result);
      console.log("=================================");

      /* HTTP errors */

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `API endpoint not found: POST ${apiEndpoint}.`
          );
        }

        if (response.status === 400) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Invalid post data sent to the server."
          );
        }

        if (response.status === 401) {
          throw new Error(
            "You are not authorized to analyze this post."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to analyze this post."
          );
        }

        if (response.status >= 500) {
          throw new Error(
            result?.message ||
              result?.error ||
              "The AI service encountered a server error."
          );
        }

        throw new Error(
          getBackendError(result, response)
        );
      }

      /* Backend-level error */

      if (result?.success === false) {
        throw new Error(
          result?.message ||
            result?.error ||
            "The server could not process the post."
        );
      }

      /* Extract result */

      const data =
        result?.data ??
        result?.result ??
        result?.output ??
        result;

      onSubmit?.({
        originalText: cleanText,
        result: data,
        response: result,
      });

      onTextChange?.(cleanText);

      setError("");

      setSummary(
        "Your post has been analyzed successfully. AI improvements are ready."
      );
    } catch (err) {
      console.error("=================================");
      console.error("ORIGINAL POST ANALYSIS ERROR");
      console.error(err);
      console.error("=================================");

      let message =
        "We couldn't connect to the AI service. Please try again.";

      if (err?.name === "AbortError") {
        message =
          "The AI request took too long. Please check your backend and try again.";
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);

      onSubmit?.({
        originalText: cleanText,
        result: null,
        error: message,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
    }
  }

  /* =========================================================
     KEYBOARD
     ========================================================= */

  function handleKeyDown(event) {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "Enter"
    ) {
      event.preventDefault();
      handleAnalyze();
    }
  }

  /* =========================================================
     ICONS
     ========================================================= */

  function PostIcon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="postIconGradient"
            x1="3"
            y1="3"
            x2="21"
            y2="21"
          >
            <stop stopColor="#C084FC" />
            <stop
              offset="0.5"
              stopColor="#8B5CF6"
            />
            <stop
              offset="1"
              stopColor="#4F8CFF"
            />
          </linearGradient>
        </defs>

        <path
          d="M7 4.5H15.5C17.433 4.5 19 6.067 19 8V16"
          stroke="url(#postIconGradient)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M7 4.5C5.067 4.5 3.5 6.067 3.5 8V17.5C3.5 18.605 4.395 19.5 5.5 19.5H15.5"
          stroke="url(#postIconGradient)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M7.5 9H15.5"
          stroke="url(#postIconGradient)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M7.5 13H12.5"
          stroke="url(#postIconGradient)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <circle
          cx="18"
          cy="17.5"
          r="3"
          fill="#10152B"
          stroke="url(#postIconGradient)"
          strokeWidth="1.4"
        />

        <path
          d="M18 16V19"
          stroke="url(#postIconGradient)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <path
          d="M16.5 17.5H19.5"
          stroke="url(#postIconGradient)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  function SparkleIcon() {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2L13.7 8.3L20 10L13.7 11.7L12 18L10.3 11.7L4 10L10.3 8.3L12 2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M19 15L19.7 17.3L22 18L19.7 18.7L19 21L18.3 18.7L16 18L18.3 17.3L19 15Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      <style>{`
        .original-post-card {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 20px;
          border-radius: 18px;
          border: 1px solid rgba(124, 92, 246, 0.18);
          background:
            radial-gradient(
              circle at 12% 0%,
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
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
        }

        .original-post-card * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .original-post-card *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .original-post-inner {
          position: relative;
          z-index: 1;
        }

        .original-post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .original-post-title-area {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .original-post-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #b56cff;
          border: 1px solid rgba(160, 110, 255, 0.26);
          background: linear-gradient(145deg, rgba(139, 92, 246, 0.2), rgba(67, 35, 130, 0.08));
        }

        .original-post-title {
          margin: 0;
          color: #f5f4ff;
          font-size: 15px;
          font-weight: 750;
        }

        .original-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 7px;
          border-radius: 6px;
          border: 1px solid rgba(139, 92, 246, 0.22);
          background: rgba(124, 58, 237, 0.1);
          color: #b98cff;
          font-size: 9px;
          font-weight: 700;
        }

        .original-post-subtitle {
          margin: 5px 0 0;
          color: #737d9d;
          font-size: 10px;
        }

        .editor-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7d86a4;
          font-size: 10px;
        }

        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px;
          border-radius: 7px;
          border: 1px solid rgba(120, 131, 170, 0.1);
          background: rgba(255, 255, 255, 0.015);
        }

        .stat-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .post-editor {
          position: relative;
          min-height: 280px;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid rgba(82, 96, 140, 0.2);
          background: linear-gradient(145deg, rgba(8, 13, 30, 0.98), rgba(5, 9, 23, 0.98));
        }

        .editor-top-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.45), transparent);
        }

        .post-editor textarea {
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          min-height: 280px;
          padding: 24px 20px 28px;
          resize: none;
          overflow-y: auto;
          border: 0;
          outline: 0;
          background: transparent;
          color: #e8ebf7;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.85;
          caret-color: #b16cff;
        }

        .editor-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 1;
          width: min(420px, calc(100% - 50px));
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          pointer-events: none;
        }

        .placeholder-icon-wrap {
          position: relative;
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
          border-radius: 20px;
          border: 1px solid rgba(153, 102, 255, 0.28);
          background: linear-gradient(145deg, rgba(108, 47, 210, 0.18), rgba(25, 22, 58, 0.6));
          color: #ae70ff;
        }

        .editor-placeholder strong {
          margin: 0 0 7px;
          color: #aeb6ce;
          font-size: 14px;
        }

        .editor-placeholder span {
          max-width: 310px;
          color: #59637f;
          font-size: 11px;
        }

        .ai-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 11px;
          min-height: 64px;
          padding: 10px 13px;
          border-radius: 11px;
          border: 1px solid rgba(124, 92, 246, 0.16);
          background: linear-gradient(100deg, rgba(108, 48, 220, 0.1), rgba(28, 34, 72, 0.22));
        }

        .summary-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #b56cff;
          background: rgba(124, 58, 237, 0.12);
        }

        .summary-content p {
          margin: 0;
          color: #8a94b0;
          font-size: 11px;
        }

        .post-error {
          display: flex;
          align-items: center;
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 9px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.06);
          color: #f48d8d;
          font-size: 11px;
        }

        .original-post-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 15px;
        }

        .footer-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #66708e;
          font-size: 10px;
        }

        .analyze-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-width: 145px;
          padding: 11px 17px;
          border: 1px solid rgba(174, 110, 255, 0.3);
          border-radius: 10px;
          cursor: pointer;
          color: #ffffff;
          font-family: inherit;
          font-size: 11px;
          font-weight: 750;
          background: linear-gradient(135deg, #7c3aed 0%, #8b3df2 50%, #5f5cff 100%);
        }

        .analyze-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 36px rgba(103, 55, 215, 0.34);
        }

        .analyze-button:disabled {
          cursor: not-allowed;
          opacity: 0.42;
        }

        .button-spinner {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          animation: spin 700ms linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <section className="original-post-card">
        <div className="original-post-inner">
          <div className="original-post-header">
            <div className="original-post-title-area">
              <div className="original-post-icon">
                <PostIcon />
              </div>
              <div className="original-post-heading">
                <div className="original-post-title-row">
                  <h2 className="original-post-title">Original Post</h2>
                  <span className="original-badge">ORIGINAL</span>
                </div>
                <p className="original-post-subtitle">
                  Start with your original idea and let AI refine it.
                </p>
              </div>
            </div>

            <div className="editor-stats">
              <span className="stat-pill">
                <span className="stat-dot" />
                {characterCount} chars
              </span>
              {wordCount > 0 && (
                <span className="stat-pill">{wordCount} words</span>
              )}
            </div>
          </div>

          <div className="post-editor">
            <div className="editor-top-line" />
            {!text && (
              <div className="editor-placeholder">
                <div className="placeholder-icon-wrap">
                  <PostIcon />
                </div>
                <strong>Write your original post</strong>
                <span>Paste your text, social post, caption, or any copy you'd like AI to improve.</span>
              </div>
            )}
            <textarea
              value={text}
              onChange={(event) => {
                const value = event.target.value;
                setText(value);
                onTextChange?.(value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              aria-label="Original post"
              spellCheck="true"
              disabled={isAnalyzing}
              placeholder=""
            />
          </div>

          <div className="ai-summary">
            <div className="summary-icon">
              <SparkleIcon />
            </div>
            <div className="summary-content">
              <span className="summary-label">
                <SparkleIcon /> AI Live Summary
              </span>
              <p>
                {isAnalyzing
                  ? "Analyzing your content and preparing improvements..."
                  : summary || "Your AI summary will appear here."}
              </p>
            </div>
          </div>

          {error && (
            <div className="post-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <div className="original-post-footer">
            <div className="footer-hint">
              <div className="hint-icon">
                <SparkleIcon />
              </div>
              <span>AI will analyze your content and generate smarter improvements.</span>
            </div>

            <button
              type="button"
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              aria-busy={isAnalyzing}
            >
              <span className="button-content">
                {isAnalyzing ? (
                  <>
                    <span className="button-spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze with AI
                    <span className="button-arrow">→</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}