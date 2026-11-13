import React from "react";
import { motion } from "framer-motion";

// ============================================================
// SOCIAL ICONS
// ============================================================

const YoutubeIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
        <polygon
            points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"
            fill="currentColor"
        />
    </svg>
);

const InstagramIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const TiktokIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const FacebookIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const LinkedinIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TwitterIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const WhatsappIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.611-.916-2.206-.242-.579-.487-.501-.67-.51l-.57-.01c-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.437-9.884 9.89-9.884 2.64.001 5.122 1.03 6.988 2.897a9.825 9.825 0 012.89 6.994c-.003 5.45-4.437 9.885-9.886 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.893c0 2.096.548 4.142 1.588 5.946L.057 24l6.307-1.654a11.875 11.875 0 005.683 1.448h.005c6.553 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.481-8.413" />
    </svg>
);

const GlobeIcon = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

// ============================================================
// PLATFORM CONFIG
// ============================================================

const PLATFORM_CONFIGS = {
    youtube: {
        icon: YoutubeIcon,
        color: "text-red-400",
        glow: "rgba(239,68,68,0.48)",
        border: "rgba(239,68,68,0.58)",
        tint: "rgba(239,68,68,0.15)",
    },

    instagram: {
        icon: InstagramIcon,
        color: "text-pink-400",
        glow: "rgba(236,72,153,0.50)",
        border: "rgba(236,72,153,0.58)",
        tint: "rgba(236,72,153,0.15)",
    },

    tiktok: {
        icon: TiktokIcon,
        color: "text-cyan-300",
        glow: "rgba(34,211,238,0.48)",
        border: "rgba(34,211,238,0.58)",
        tint: "rgba(34,211,238,0.14)",
    },

    facebook: {
        icon: FacebookIcon,
        color: "text-blue-400",
        glow: "rgba(59,130,246,0.48)",
        border: "rgba(59,130,246,0.58)",
        tint: "rgba(59,130,246,0.15)",
    },

    linkedin: {
        icon: LinkedinIcon,
        color: "text-blue-300",
        glow: "rgba(37,99,235,0.48)",
        border: "rgba(37,99,235,0.58)",
        tint: "rgba(37,99,235,0.15)",
    },

    twitter: {
        icon: TwitterIcon,
        color: "text-sky-300",
        glow: "rgba(56,189,248,0.48)",
        border: "rgba(56,189,248,0.58)",
        tint: "rgba(56,189,248,0.14)",
    },

    whatsapp: {
        icon: WhatsappIcon,
        color: "text-green-400",
        glow: "rgba(34,197,94,0.52)",
        border: "rgba(34,197,94,0.62)",
        tint: "rgba(34,197,94,0.16)",
    },

    default: {
        icon: GlobeIcon,
        color: "text-purple-300",
        glow: "rgba(168,85,247,0.50)",
        border: "rgba(168,85,247,0.60)",
        tint: "rgba(168,85,247,0.15)",
    },
};

// ============================================================
// BUBBLE NODE
// ============================================================

function BubbleNode({
    idea,
    index,
    position,
    center,
    selectedIdea,
    setSelectedIdea,
}) {
    const platformKey =
        idea.platform?.toLowerCase() ||
        "default";

    const config =
        PLATFORM_CONFIGS[platformKey] ||
        PLATFORM_CONFIGS.default;

    const PlatformIcon = config.icon;

    const isSelected =
        selectedIdea?.id === idea.id;

    const displayNumber = String(
        index + 1
    ).padStart(2, "0");

    return (
        <motion.div
            className="absolute top-0 left-0 z-20 origin-center"
            initial={{
                x: center.x,
                y: center.y,
                scale: 0.2,
                opacity: 0,
            }}
            animate={{
                x: position.x,
                y: position.y,
                scale: 1,
                opacity: 1,
            }}
            exit={{
                scale: 0.2,
                opacity: 0,
            }}
            transition={{
                type: "spring",
                stiffness: 72,
                damping: 16,
                mass: 1.05,
                delay: index * 0.045,
            }}
        >
            <div className="-translate-x-1/2 -translate-y-1/2 select-none">
                {/* Outer glow */}

                <motion.div
                    className="pointer-events-none absolute -inset-5 rounded-full blur-2xl"
                    style={{
                        background:
                            config.glow,
                    }}
                    animate={{
                        opacity: isSelected
                            ? [0.7, 1, 0.7]
                            : [0.28, 0.52, 0.28],

                        scale: isSelected
                            ? [0.92, 1.08, 0.92]
                            : [0.96, 1.03, 0.96],
                    }}
                    transition={{
                        duration:
                            isSelected
                                ? 2
                                : 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Soft outer ring */}

                <motion.div
                    className="pointer-events-none absolute -inset-1 rounded-full"
                    style={{
                        border: `1px solid ${config.border}`,
                        boxShadow: `0 0 20px ${config.glow}`,
                    }}
                    animate={{
                        opacity: isSelected
                            ? [0.7, 1, 0.7]
                            : [0.45, 0.72, 0.45],
                    }}
                    transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Bubble */}

                <motion.div
                    onClick={() =>
                        setSelectedIdea(
                            isSelected
                                ? null
                                : idea
                        )
                    }
                    className={`relative cursor-pointer flex flex-col items-center justify-center text-center rounded-full w-[108px] h-[108px] sm:w-[120px] sm:h-[120px] lg:w-[132px] lg:h-[132px] p-3 sm:p-3.5 lg:p-4 aspect-square backdrop-blur-2xl overflow-hidden border ${
                        isSelected
                            ? "ring-2 ring-white/15"
                            : ""
                    }`}
                    style={{
                        background: `radial-gradient(circle at 50% 30%, ${config.tint}, rgba(4,7,18,0.94) 68%)`,
                        borderColor:
                            isSelected
                                ? config.border
                                : "rgba(255,255,255,0.10)",
                        boxShadow:
                            isSelected
                                ? `0 0 35px ${config.glow}, 0 0 65px ${config.glow}, inset 0 0 30px rgba(255,255,255,0.035)`
                                : `0 0 25px ${config.glow}, inset 0 0 26px rgba(255,255,255,0.025)`,
                    }}
                    animate={
                        isSelected
                            ? {
                                  boxShadow: [
                                      `0 0 25px ${config.glow}, 0 0 50px ${config.glow}`,
                                      `0 0 42px ${config.glow}, 0 0 75px ${config.glow}`,
                                      `0 0 25px ${config.glow}, 0 0 50px ${config.glow}`,
                                  ],
                              }
                            : {}
                    }
                    whileHover={{
                        scale: 1.07,
                        y: -3,
                    }}
                    whileTap={{
                        scale: 1.03,
                    }}
                    transition={{
                        boxShadow: {
                            repeat: Infinity,
                            duration: 2.4,
                            ease: "easeInOut",
                        },
                        default: {
                            type: "spring",
                            stiffness: 280,
                            damping: 20,
                        },
                    }}
                >
                    {/* Soft inner light */}

                    <div
                        className="absolute inset-0 pointer-events-none rounded-full"
                        style={{
                            background: `radial-gradient(circle at 50% 10%, rgba(255,255,255,0.11), ${config.tint}, transparent 58%)`,
                        }}
                    />

                    {/* Platform icon */}

                    <motion.div
                        className="relative z-10 flex items-center justify-center mb-2"
                        animate={{
                            filter: [
                                `drop-shadow(0 0 5px ${config.glow})`,
                                `drop-shadow(0 0 13px ${config.glow})`,
                                `drop-shadow(0 0 5px ${config.glow})`,
                            ],
                        }}
                        transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <PlatformIcon
                            className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${config.color}`}
                        />
                    </motion.div>

                    {/* Number */}

                    <div className="relative z-10 leading-none mb-1">
                        <span className="text-[15px] sm:text-lg lg:text-xl font-bold tracking-wide text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.22)]">
                            {displayNumber}
                        </span>
                    </div>

                    {/* Title */}

                    <div className="relative z-10 w-full flex items-center justify-center px-2">
                        <p className="text-[9px] sm:text-[10px] lg:text-[12px] font-semibold text-white/90 leading-[1.28] line-clamp-3 overflow-hidden">
                            {idea.title}
                        </p>
                    </div>
                </motion.div>

                {/* Selected pulse */}

                {isSelected && (
                    <motion.div
                        className="pointer-events-none absolute -inset-1 rounded-full border border-white/30 z-[-1]"
                        animate={{
                            scale: [
                                1,
                                1.16,
                                1,
                            ],
                            opacity: [
                                0.8,
                                0,
                                0.8,
                            ],
                        }}
                        transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
}

export default React.memo(BubbleNode);