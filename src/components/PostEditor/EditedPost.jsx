import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

const API_CONFIG = {
  EDIT_POST:
    "/api/posteditor/improve",
};

const EDIT_FOCUS_OPTIONS = [
  {
    id: "tone",
    title: "Tone of Voice",
    description:
      "Adjust the mood and personality",
    icon: "✦",
  },
  {
    id: "storytelling",
    title: "Storytelling Style",
    description:
      "Make the story flow naturally",
    icon: "◫",
  },
  {
    id: "structure",
    title: "Structure",
    description:
      "Improve flow and organization",
    icon: "☷",
  },
  {
    id: "hook",
    title: "Hook",
    description:
      "Create a stronger opening",
    icon: "◎",
  },
  {
    id: "cta",
    title: "Call To Action",
    description:
      "Create a stronger CTA",
    icon: "⌁",
  },
  {
    id: "general",
    title: "General Enhancement",
    description:
      "AI optimizes the complete post",
    icon: "✧",
  },
];

const TONE_OPTIONS = [
  {
    id: "friendly",
    label: "Friendly",
    emoji: "🙂",
    description:
      "Warm & approachable",
  },
  {
    id: "professional",
    label: "Professional",
    emoji: "💼",
    description:
      "Polished & credible",
  },
  {
    id: "casual",
    label: "Casual",
    emoji: "😎",
    description:
      "Relaxed & natural",
  },
  {
    id: "confident",
    label: "Confident",
    emoji: "💪",
    description:
      "Bold & authoritative",
  },
  {
    id: "persuasive",
    label: "Persuasive",
    emoji: "🔥",
    description:
      "Action-oriented",
  },
  {
    id: "engaging",
    label: "Engaging",
    emoji: "⚡",
    description:
      "Energetic & interactive",
  },
];

const MAX_CUSTOM_INSTRUCTIONS = 300;

function EditFocus({
  originalPost = "",
  onEditSuccess,
  onLoadingChange,
  apiUrl = API_CONFIG.EDIT_POST,
  token,
}) {
  const [
    selectedFocus,
    setSelectedFocus,
  ] = useState("general");

  const [
    selectedTone,
    setSelectedTone,
  ] = useState("friendly");

  const [
    customInstructions,
    setCustomInstructions,
  ] = useState("");

  const [
    isToneDropdownOpen,
    setIsToneDropdownOpen,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const selectedToneOption =
    useMemo(() => {
      return TONE_OPTIONS.find(
        (tone) =>
          tone.id ===
          selectedTone
      );
    }, [selectedTone]);

  useEffect(() => {
    onLoadingChange?.(
      isLoading
    );
  }, [
    isLoading,
    onLoadingChange,
  ]);

  const handleFocusChange =
    (focus) => {
      if (isLoading) return;

      setSelectedFocus(
        focus
      );

      setError("");
    };

  const handleToneChange =
    (tone) => {
      if (isLoading) return;

      setSelectedTone(
        tone
      );

      setIsToneDropdownOpen(
        false
      );

      setError("");
    };

  const handleCustomInstructionsChange =
    (event) => {
      const value =
        event.target.value;

      if (
        value.length <=
        MAX_CUSTOM_INSTRUCTIONS
      ) {
        setCustomInstructions(
          value
        );

        setError("");
      }
    };

  /**
   * =========================================================
   * EXTRACT EDITED POST
   * =========================================================
   */

  const extractEditedPost =
    (response) => {
      const candidates = [
        response?.editedPost,
        response?.edited_post,

        response?.data
          ?.editedPost,

        response?.data
          ?.edited_post,

        response?.editedPost
          ?.content,

        response?.data
          ?.editedPost
          ?.content,

        response?.post,
        response?.data?.post,

        response?.content,
        response?.data?.content,

        response?.result
          ?.editedPost,

        response?.data
          ?.result
          ?.editedPost,

        response?.result
          ?.edited_post,

        response?.data
          ?.result
          ?.edited_post,

        response?.result
          ?.content,

        response?.data
          ?.result
          ?.content,

        response?.result
          ?.post,

        response?.data
          ?.result
          ?.post,
      ];

      const value =
        candidates.find(
          (item) =>
            typeof item ===
              "string" &&
            item.trim()
              .length > 0
        );

      return value || "";
    };

  /**
   * =========================================================
   * APPLY CHANGES
   * =========================================================
   */

  const handleApplyChanges =
    async () => {
      const post =
        typeof originalPost ===
        "string"
          ? originalPost.trim()
          : "";

      if (!post) {
        setError(
          "Please write a post in the Original Post section first."
        );

        return;
      }

      if (isLoading) {
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        /**
         * IMPORTANT:
         *
         * This payload matches the same API
         * used by OriginalPost.
         */

        const payload = {
          post,

          editFocus:
            selectedFocus,

          tone:
            selectedTone,

          customInstructions:
            customInstructions.trim(),
        };

        console.log(
          "================================="
        );

        console.log(
          "EDIT POST REQUEST"
        );

        console.log(
          "URL:",
          apiUrl
        );

        console.log(
          "Payload:",
          payload
        );

        console.log(
          "================================="
        );

        const headers = {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(
            apiUrl,
            {
              method: "POST",

              headers,

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const responseText =
          await response.text();

        console.log(
          "================================="
        );

        console.log(
          "EDIT POST RESPONSE"
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
          responseText
        );

        console.log(
          "================================="
        );

        let result = null;

        if (
          responseText
        ) {
          try {
            result =
              JSON.parse(
                responseText
              );
          } catch {
            throw new Error(
              `Server returned an invalid response. Status: ${response.status}`
            );
          }
        }

        /**
         * HTTP errors.
         */

        if (!response.ok) {
          if (
            response.status ===
            404
          ) {
            throw new Error(
              `API endpoint not found: POST ${apiUrl}. Check that your backend route is mounted correctly.`
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
              "You are not authorized to edit this post."
            );
          }

          if (
            response.status ===
            403
          ) {
            throw new Error(
              "You do not have permission to edit this post."
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
            result?.message ||
              result?.error ||
              `Failed to edit the post. Server returned ${response.status}.`
          );
        }

        /**
         * Backend-level failure.
         */

        if (
          result?.success ===
          false
        ) {
          throw new Error(
            result?.message ||
              result?.error ||
              "The server could not process the post."
          );
        }

        /**
         * Extract edited post.
         */

        const editedPost =
          extractEditedPost(
            result
          );

        if (!editedPost) {
          console.error(
            "No edited post found in response:",
            result
          );

          throw new Error(
            "The server responded successfully, but no edited content was returned."
          );
        }

        console.log(
          "Edited Post:",
          editedPost
        );

        onEditSuccess?.(
          editedPost.trim()
        );

        setError("");
      } catch (err) {
        console.error(
          "================================="
        );

        console.error(
          "EDIT FOCUS API ERROR"
        );

        console.error(err);

        console.error(
          "================================="
        );

        let message =
          "Something went wrong while editing the post.";

        if (
          err instanceof
            TypeError &&
          err.message
            ?.toLowerCase()
            .includes(
              "fetch"
            )
        ) {
          message =
            "Unable to connect to the backend server. Make sure the backend is running.";
        } else if (
          err instanceof
            Error &&
          err.message
        ) {
          message =
            err.message;
        }

        setError(
          message
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };

  return (
    <aside className="relative w-full overflow-visible rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#11142c]/95 via-[#090c1f]/95 to-[#050713]/95 shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-[70px]" />

      <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-blue-600/[0.07] blur-[70px]" />

      <div className="relative z-10 p-4">
        <div className="mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-8 w-8 place-items-center rounded-xl border border-purple-400/15 bg-purple-500/[0.12] text-purple-300 shadow-[0_0_20px_rgba(139,92,246,0.12)]">
              <span className="absolute inset-0 rounded-xl bg-purple-500/10 blur-md" />

              <span className="relative text-sm">
                ✦
              </span>
            </div>

            <div>
              <h2 className="m-0 text-[13px] font-bold tracking-tight text-white">
                <span className="mr-1 text-purple-400">
                  1.
                </span>

                Edit Focus
              </h2>

              <p className="m-0 mt-0.5 text-[9px] text-slate-500">
                Tell the AI exactly what to improve.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {EDIT_FOCUS_OPTIONS.map(
            (option) => {
              const active =
                selectedFocus ===
                option.id;

              return (
                <button
                  key={
                    option.id
                  }
                  type="button"
                  disabled={
                    isLoading
                  }
                  aria-pressed={
                    active
                  }
                  onClick={() =>
                    handleFocusChange(
                      option.id
                    )
                  }
                  className={`group relative flex min-h-[54px] w-full items-center justify-between gap-3 overflow-hidden rounded-xl px-3 py-2 text-left transition-all duration-200 ${
                    active
                      ? "border border-purple-500/40 bg-gradient-to-r from-purple-500/[0.12] via-purple-500/[0.06] to-transparent shadow-[0_8px_30px_rgba(124,58,237,0.08)]"
                      : "border border-white/[0.05] bg-white/[0.015] hover:-translate-y-[1px] hover:border-purple-500/20 hover:bg-white/[0.03]"
                  } ${
                    isLoading
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-purple-300 via-purple-500 to-indigo-500" />
                  )}

                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm transition-all duration-200 ${
                        active
                          ? "bg-purple-500/15 text-purple-300 shadow-[0_0_16px_rgba(139,92,246,0.12)]"
                          : "bg-white/[0.03] text-slate-500 group-hover:scale-105 group-hover:text-purple-300"
                      }`}
                    >
                      {
                        option.icon
                      }
                    </span>

                    <div className="min-w-0">
                      <h3 className="m-0 text-[10.5px] font-bold text-slate-100">
                        {
                          option.title
                        }
                      </h3>

                      <p className="m-0 mt-0.5 text-[8.5px] leading-tight text-slate-500">
                        {
                          option.description
                        }
                      </p>
                    </div>
                  </div>

                  {active && (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 text-[9px] text-white shadow-[0_0_18px_rgba(139,54,255,0.4)]">
                      ✓
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />

        <section>
          <div className="mb-2">
            <h2 className="m-0 text-[11.5px] font-bold text-slate-100">
              <span className="mr-1 text-purple-400">
                2.
              </span>

              Tone of Voice
            </h2>

            <p className="m-0 mt-0.5 text-[8.5px] text-slate-500">
              Choose the personality of your content.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              disabled={
                isLoading
              }
              aria-expanded={
                isToneDropdownOpen
              }
              onClick={() =>
                setIsToneDropdownOpen(
                  (value) =>
                    !value
                )
              }
              className="flex min-h-[46px] w-full items-center justify-between rounded-xl border border-white/[0.06] bg-slate-950/60 px-3 text-left text-white transition-all duration-200 hover:border-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500/10 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/[0.07] text-[15px]">
                  {
                    selectedToneOption?.emoji
                  }
                </span>

                <span className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold">
                    {
                      selectedToneOption?.label
                    }
                  </span>

                  <span className="text-[8px] text-slate-500">
                    {
                      selectedToneOption?.description
                    }
                  </span>
                </span>
              </div>

              <span
                className={`grid h-7 w-7 place-items-center rounded-lg bg-white/[0.025] text-slate-500 transition duration-200 ${
                  isToneDropdownOpen
                    ? "rotate-180 text-purple-300"
                    : ""
                }`}
              >
                ↓
              </span>
            </button>

            {isToneDropdownOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+7px)] z-50 overflow-hidden rounded-xl border border-purple-500/20 bg-[#0c1024]/95 p-1.5 shadow-[0_25px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                {TONE_OPTIONS.map(
                  (tone) => {
                    const active =
                      selectedTone ===
                      tone.id;

                    return (
                      <button
                        key={
                          tone.id
                        }
                        type="button"
                        disabled={
                          isLoading
                        }
                        onClick={() =>
                          handleToneChange(
                            tone.id
                          )
                        }
                        className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition duration-150 ${
                          active
                            ? "bg-purple-500/10"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.03] text-[14px]">
                          {
                            tone.emoji
                          }
                        </span>

                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-[9.5px] font-semibold text-slate-100">
                            {
                              tone.label
                            }
                          </span>

                          <span className="text-[7.5px] text-slate-500">
                            {
                              tone.description
                            }
                          </span>
                        </span>

                        {active && (
                          <span className="grid h-4 w-4 place-items-center rounded-full bg-purple-600 text-[8px] text-white">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-purple-400/10 to-transparent" />

        <section>
          <div className="mb-2">
            <h2 className="m-0 text-[11.5px] font-bold text-slate-100">
              <span className="mr-1 text-purple-400">
                3.
              </span>

              Custom Instructions

              <span className="ml-1 text-[8px] font-medium text-slate-600">
                Optional
              </span>
            </h2>

            <p className="m-0 mt-0.5 text-[8.5px] text-slate-500">
              Add extra instructions for the AI.
            </p>
          </div>

          <div className="relative">
            <textarea
              value={
                customInstructions
              }
              onChange={
                handleCustomInstructionsChange
              }
              disabled={
                isLoading
              }
              maxLength={
                MAX_CUSTOM_INSTRUCTIONS
              }
              placeholder="Example: Make it more exciting, use short sentences, and add emojis..."
              className="min-h-[105px] w-full resize-y rounded-xl border border-white/[0.06] bg-slate-950/60 px-3 pb-7 pt-3 text-[9.5px] leading-[1.6] text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-500/20 focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <span className="pointer-events-none absolute bottom-2.5 right-3 text-[8px] text-slate-600">
              {
                customInstructions.length
              }
              /
              {
                MAX_CUSTOM_INSTRUCTIONS
              }
            </span>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/10 bg-red-500/[0.06] px-3 py-2 text-[9px] leading-relaxed text-red-300"
          >
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-red-400/10 text-[9px] font-bold text-red-400">
              !
            </span>

            <span>
              {error}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={
            handleApplyChanges
          }
          disabled={
            isLoading ||
            !originalPost?.trim()
          }
          className="group relative mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500 text-[11px] font-bold text-white shadow-[0_12px_30px_rgba(105,40,255,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_35px_rgba(105,40,255,0.28)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <span className="pointer-events-none absolute inset-y-0 -left-[120%] w-3/4 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[140%]" />

          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />

              <span>
                Applying AI Changes...
              </span>
            </>
          ) : (
            <>
              <span className="text-[14px] transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110">
                ✦
              </span>

              <span>
                Apply Changes
              </span>

              <span className="text-[13px] opacity-80 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </>
          )}
        </button>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[7.5px] text-slate-600">
          <span className="h-1 w-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />

          AI-powered editing based on your selected preferences
        </div>
      </div>
    </aside>
  );
}

export default EditFocus;