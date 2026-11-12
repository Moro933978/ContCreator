import React, { useState } from 'react';
import { motion } from 'framer-motion';

import {
    FaYoutube,
    FaInstagram,
    FaTiktok,
    FaFacebook,
    FaLinkedin,
    FaWhatsapp,
    FaLayerGroup
} from 'react-icons/fa';

const PLATFORM_CONFIG = {
    All: {
        label: 'All Platforms',
        icon: FaLayerGroup,
        iconColor: 'text-white'
    },
    YouTube: {
        label: 'YouTube',
        icon: FaYoutube,
        iconColor: 'text-[#FF0000]'
    },
    Instagram: {
        label: 'Instagram',
        icon: FaInstagram,
        iconColor: 'text-[#E1306C]'
    },
    TikTok: {
        label: 'TikTok',
        icon: FaTiktok,
        iconColor: 'text-white'
    },
    Facebook: {
        label: 'Facebook',
        icon: FaFacebook,
        iconColor: 'text-[#1877F2]'
    },
    LinkedIn: {
        label: 'LinkedIn',
        icon: FaLinkedin,
        iconColor: 'text-[#0A66C2]'
    },
    WhatsApp: {
        label: 'WhatsApp',
        icon: FaWhatsapp,
        iconColor: 'text-[#25D366]'
    }
};

const PlatformFilter = ({
    platforms = [],
    selectedPlatform,
    setSelectedPlatform
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const filterOptions = [
        'All',
        ...platforms.filter(
            (platform, index, array) =>
                array.indexOf(platform) === index
        )
    ];

    return (
        <div
            className="relative w-full min-w-0 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <style>{`
                .platform-filter-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: ${
                        isHovered
                            ? 'rgba(148,163,184,0.42) transparent'
                            : 'transparent transparent'
                    };
                }

                .platform-filter-scroll::-webkit-scrollbar {
                    height: 5px;
                }

                .platform-filter-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .platform-filter-scroll::-webkit-scrollbar-thumb {
                    background: ${
                        isHovered
                            ? 'rgba(148,163,184,0.42)'
                            : 'transparent'
                    };
                    border-radius: 999px;
                    transition: background 0.25s ease;
                }

                .platform-filter-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(203,213,225,0.68);
                }

                @media (max-width: 767px) {
                    .platform-filter-scroll {
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    .platform-filter-scroll::-webkit-scrollbar {
                        display: none;
                        width: 0;
                        height: 0;
                    }
                }
            `}</style>

            <div className="platform-filter-scroll flex flex-nowrap items-center gap-3 w-full min-w-0 overflow-x-auto overflow-y-hidden py-1 pr-1">
                <div className="flex flex-nowrap items-center gap-3 min-w-max">
                    {filterOptions.map((platformKey) => {
                        const config =
                            PLATFORM_CONFIG[platformKey] || {
                                label: platformKey,
                                icon: FaLayerGroup,
                                iconColor: 'text-gray-400'
                            };

                        const Icon = config.icon;
                        const isSelected =
                            selectedPlatform === platformKey;

                        return (
                            <motion.button
                                key={platformKey}
                                type="button"
                                onClick={() =>
                                    setSelectedPlatform(
                                        platformKey
                                    )
                                }
                                onMouseEnter={() => {}}
                                whileHover={{
                                    y: -1,
                                    scale: 1.025
                                }}
                                whileTap={{
                                    scale: 0.985
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 350,
                                    damping: 24
                                }}
                                className={`group relative shrink-0 flex items-center justify-center gap-2.5 h-[48px] px-[24px] rounded-full text-sm font-medium whitespace-nowrap overflow-hidden border outline-none transition-all duration-500 ${
                                    isSelected
                                        ? 'text-white border-purple-300/30 focus-visible:ring-2 focus-visible:ring-purple-400/40'
                                        : 'bg-[#0B0914]/95 text-white/65 border-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-purple-400/35 focus-visible:border-purple-400/40'
                                }`}
                                style={{
                                    boxShadow: isSelected
                                        ? '0 0 18px rgba(139,92,246,0.35), 0 0 35px rgba(139,92,246,0.10), inset 0 1px 0 rgba(255,255,255,0.10)'
                                        : undefined
                                }}
                            >
                                {/* =================================================
                                    ACTIVE BACKGROUND
                                ================================================= */}

                                {isSelected && (
                                    <>
                                        <motion.div
                                            layoutId="active-platform-pill"
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9]"
                                            initial={false}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 350,
                                                damping: 26
                                            }}
                                        />

                                        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_55%)]" />

                                        <motion.div
                                            className="absolute -inset-[1px] rounded-full pointer-events-none"
                                            animate={{
                                                opacity: [0.25, 0.5, 0.25]
                                            }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                                ease: 'easeInOut'
                                            }}
                                            style={{
                                                boxShadow:
                                                    'inset 0 0 0 1px rgba(255,255,255,0.12)'
                                            }}
                                        />
                                    </>
                                )}

                                {/* =================================================
                                    PREMIUM HOVER SHEEN
                                ================================================= */}

                                {!isSelected && (
                                    <>
                                        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_-20%,rgba(168,85,247,0.16),transparent_58%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                        <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-[120%] transition-transform duration-700 ease-out group-hover:translate-x-[120%]" />

                                        <span className="pointer-events-none absolute inset-[1px] rounded-full border border-transparent transition-all duration-500 group-hover:border-purple-400/20 group-focus-visible:border-purple-300/35" />
                                    </>
                                )}

                                {/* =================================================
                                    ICON GLOW
                                ================================================= */}

                                <motion.span
                                    className="relative z-10 flex items-center justify-center"
                                    animate={
                                        isSelected
                                            ? {
                                                  scale: [1, 1.08, 1]
                                              }
                                            : undefined
                                    }
                                    transition={{
                                        duration: 2.2,
                                        repeat: isSelected
                                            ? Infinity
                                            : 0,
                                        ease: 'easeInOut'
                                    }}
                                >
                                    <Icon
                                        className={`text-[18px] shrink-0 transition-all duration-500 ${
                                            isSelected
                                                ? 'text-white drop-shadow-[0_0_7px_rgba(255,255,255,0.45)]'
                                                : `${config.iconColor} group-hover:drop-shadow-[0_0_8px_currentColor]`
                                        }`}
                                    />
                                </motion.span>

                                {/* =================================================
                                    LABEL
                                ================================================= */}

                                <span
                                    className={`relative z-10 tracking-wide leading-none transition-all duration-500 ${
                                        isSelected
                                            ? 'text-white'
                                            : 'text-white/65 group-hover:text-white'
                                    }`}
                                >
                                    {config.label}
                                </span>

                                {/* =================================================
                                    SELECTED INDICATOR
                                ================================================= */}

                                {isSelected && (
                                    <motion.span
                                        layoutId="platform-active-dot"
                                        className="relative z-10 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 25
                                        }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Edge fade */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#05010d] to-transparent opacity-70" />
        </div>
    );
};

export default PlatformFilter;