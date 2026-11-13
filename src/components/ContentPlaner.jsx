import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Globe2,
  Lightbulb,
  LayoutGrid,
  Pencil,
  PenLine,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Video,
  X,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const CONTENT_STORAGE_KEY = "techook-content-planner-content-v11";
const PLATFORM_STORAGE_KEY = "techook-content-planner-platforms-v11";
const CANCELLED_STORAGE_KEY = "techook-content-planner-cancelled-v1";
const CONTENT_PLANNER_IDEAS_KEY = "techook-content-planner-ideas-v1";

/* =========================================================
   STATUS
========================================================= */

const STATUS_OPTIONS = [
  "Draft",
  "Scheduled",
  "Published",
];

/* =========================================================
   DEFAULT PLATFORMS
========================================================= */

const DEFAULT_PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    iconType: "instagram",
    custom: false,
  },
  {
    id: "tiktok",
    name: "TikTok",
    iconType: "tiktok",
    custom: false,
  },
  {
    id: "youtube",
    name: "YouTube",
    iconType: "youtube",
    custom: false,
  },
  {
    id: "facebook",
    name: "Facebook",
    iconType: "facebook",
    custom: false,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    iconType: "linkedin",
    custom: false,
  },
];

/* =========================================================
   PLATFORM TYPES
========================================================= */

const PLATFORM_TYPES = [
  {
    value: "instagram",
    label: "Instagram",
  },
  {
    value: "tiktok",
    label: "TikTok",
  },
  {
    value: "youtube",
    label: "YouTube",
  },
  {
    value: "facebook",
    label: "Facebook",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
  },
  {
    value: "other",
    label: "Other / Custom",
  },
];

/* =========================================================
   IDEAS
========================================================= */

const IDEAS = [
  {
    title: "AI Tools for Content Creators",
    category: "AI & Tools",
  },
  {
    title: "Morning Routine of a Creator",
    category: "Lifestyle",
  },
  {
    title: "Best Apps for Video Editing",
    category: "Education",
  },
  {
    title: "10 Hooks That Stop The Scroll",
    category: "Growth",
  },
];

/* =========================================================
   SOCIAL ICONS
========================================================= */

const InstagramIcon = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5.2"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <circle
      cx="17.35"
      cy="6.65"
      r="1.05"
      fill="currentColor"
    />
  </svg>
);

const YouTubeIcon = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M21.05 7.12C20.84 6.35 20.25 5.74 19.47 5.52C17.88 5.08 12 5.08 12 5.08C12 5.08 6.12 5.08 4.53 5.52C3.75 5.74 3.16 6.35 2.95 7.12C2.5 8.7 2.5 12 2.5 12C2.5 12 2.5 15.3 2.95 16.88C3.16 17.65 3.75 18.26 4.53 18.48C6.12 18.92 12 18.92 12 18.92C12 18.92 17.88 18.92 19.47 18.48C20.25 18.26 20.84 17.65 21.05 16.88C21.5 15.3 21.5 12 21.5 12C21.5 12 21.5 8.7 21.05 7.12Z"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinejoin="round"
    />
    <path
      d="M10.15 8.9L15.15 12L10.15 15.1V8.9Z"
      fill="currentColor"
    />
  </svg>
);

const FacebookIcon = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M14.1 8.05H16V4.65C15.64 4.6 14.42 4.48 13.05 4.48C10.2 4.48 8.22 6.22 8.22 9.3V12H5.05V15.75H8.22V21H12.08V15.75H14.95L15.4 12H12.08V9.62C12.08 8.53 12.39 8.05 14.1 8.05Z"
      fill="currentColor"
    />
  </svg>
);

const LinkedInIcon = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="3.2"
      y="3.2"
      width="17.6"
      height="17.6"
      rx="2.6"
      stroke="currentColor"
      strokeWidth="1.65"
    />
    <path
      d="M7.3 10.1V17.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <circle
      cx="7.3"
      cy="7.15"
      r="1.05"
      fill="currentColor"
    />
    <path
      d="M11.1 17.2V10.1M11.1 13.15C11.1 11.35 12.15 10.1 13.72 10.1C15.48 10.1 16.7 11.32 16.7 13.48V17.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TikTokIcon = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M15.4 3C15.62 4.62 16.53 5.72 18.42 6.05V9.22C17.18 9.1 16.08 8.67 15.18 7.93V14.1C15.18 17.67 12.88 20 9.68 20C6.74 20 4.5 17.95 4.5 15.12C4.5 12.08 6.95 9.86 10.18 10.1V13.25C8.77 13.08 7.79 13.76 7.79 15.01C7.79 16.08 8.57 16.85 9.64 16.85C10.91 16.85 11.9 15.84 11.9 14.16V3H15.4Z"
      fill="currentColor"
    />
  </svg>
);

const SocialIcon = ({
  platform,
  size = 20,
  className = "",
}) => {
  const icons = {
    instagram: (
      <InstagramIcon
        size={size}
        className={className}
      />
    ),
    youtube: (
      <YouTubeIcon
        size={size}
        className={className}
      />
    ),
    facebook: (
      <FacebookIcon
        size={size}
        className={className}
      />
    ),
    linkedin: (
      <LinkedInIcon
        size={size}
        className={className}
      />
    ),
    tiktok: (
      <TikTokIcon
        size={size}
        className={className}
      />
    ),
  };

  return (
    icons[platform] || (
      <Globe2
        size={size}
        strokeWidth={1.7}
        className={className}
      />
    )
  );
};

/* =========================================================
   DATE HELPERS
========================================================= */

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDateKey = (key) => {
  const [year, month, day] =
    key.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
};

const addDays = (date, amount) => {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
};

const addWeeks = (
  date,
  amount
) =>
  addDays(
    date,
    amount * 7
  );

const startOfWeek = (date) => {
  const result = new Date(date);

  result.setDate(
    result.getDate() -
      result.getDay()
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
};

const formatTime = (time) => {
  if (!time) return "—";

  const [hours, minutes] =
    time.split(":").map(Number);

  const period =
    hours >= 12 ? "PM" : "AM";

  const hour =
    hours % 12 || 12;

  return `${hour}:${String(
    minutes
  ).padStart(
    2,
    "0"
  )} ${period}`;
};

const formatLongDate = (
  key
) => {
  if (!key) return "";

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    parseDateKey(key)
  );
};

const formatDateRange = (
  start
) => {
  const end = addDays(
    start,
    6
  );

  const startMonth =
    start.toLocaleString(
      "en-US",
      {
        month: "short",
      }
    );

  const endMonth =
    end.toLocaleString(
      "en-US",
      {
        month: "short",
      }
    );

  if (
    startMonth ===
    endMonth
  ) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
};

/* =========================================================
   STORAGE
========================================================= */

const readStorage = (
  key,
  fallback
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return fallback;
  }

  try {
    const value =
      localStorage.getItem(
        key
      );

    if (!value) {
      return fallback;
    }

    return JSON.parse(
      value
    );
  } catch {
    return fallback;
  }
};

/* =========================================================
   VISUAL HELPERS
========================================================= */

const getPlatformIconBox = (
  platform
) => {
  const styles = {
    instagram:
      "bg-gradient-to-br from-fuchsia-500/[0.15] via-pink-500/[0.09] to-violet-500/[0.05] text-fuchsia-100 shadow-[0_0_24px_rgba(217,70,239,0.12)]",
    tiktok:
      "bg-gradient-to-br from-cyan-400/[0.12] via-violet-500/[0.08] to-fuchsia-500/[0.05] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.09)]",
    youtube:
      "bg-gradient-to-br from-red-500/[0.14] via-fuchsia-500/[0.08] to-violet-500/[0.05] text-red-50 shadow-[0_0_24px_rgba(248,113,113,0.09)]",
    facebook:
      "bg-gradient-to-br from-blue-500/[0.14] via-indigo-500/[0.09] to-violet-500/[0.05] text-blue-50 shadow-[0_0_24px_rgba(96,165,250,0.09)]",
    linkedin:
      "bg-gradient-to-br from-blue-500/[0.14] via-indigo-500/[0.09] to-violet-500/[0.05] text-blue-50 shadow-[0_0_24px_rgba(96,165,250,0.09)]",
    other:
      "bg-gradient-to-br from-violet-500/[0.14] via-fuchsia-500/[0.08] to-blue-500/[0.05] text-violet-100 shadow-[0_0_24px_rgba(124,58,237,0.10)]",
  };

  return (
    styles[platform] ||
    styles.other
  );
};

const getStatusStyle = (
  status
) => {
  const styles = {
    Draft:
      "bg-slate-500/[0.12] text-slate-100 border-slate-300/15",
    Scheduled:
      "bg-violet-500/[0.14] text-violet-100 border-violet-300/20 shadow-[0_0_16px_rgba(139,92,246,0.10)]",
    Published:
      "bg-emerald-500/[0.13] text-emerald-50 border-emerald-300/20 shadow-[0_0_16px_rgba(16,185,129,0.09)]",
  };

  return (
    styles[status] ||
    styles.Draft
  );
};

const getCardColor = (
  platform,
  status
) => {
  if (
    status ===
    "Published"
  ) {
    return "bg-emerald-500/[0.065] hover:bg-emerald-500/[0.085] hover:shadow-[0_12px_38px_rgba(16,185,129,0.10)]";
  }

  const styles = {
    instagram:
      "bg-fuchsia-500/[0.065] hover:bg-fuchsia-500/[0.09] hover:shadow-[0_12px_38px_rgba(217,70,239,0.11)]",
    tiktok:
      "bg-cyan-500/[0.06] hover:bg-cyan-500/[0.085] hover:shadow-[0_12px_38px_rgba(34,211,238,0.09)]",
    youtube:
      "bg-red-500/[0.06] hover:bg-red-500/[0.085] hover:shadow-[0_12px_38px_rgba(239,68,68,0.10)]",
    facebook:
      "bg-blue-500/[0.06] hover:bg-blue-500/[0.085] hover:shadow-[0_12px_38px_rgba(59,130,246,0.09)]",
    linkedin:
      "bg-blue-500/[0.06] hover:bg-blue-500/[0.085] hover:shadow-[0_12px_38px_rgba(59,130,246,0.09)]",
    other:
      "bg-violet-500/[0.06] hover:bg-violet-500/[0.085] hover:shadow-[0_12px_38px_rgba(124,58,237,0.11)]",
  };

  return (
    styles[platform] ||
    styles.other
  );
};

const panelClass =
  "rounded-2xl border border-white/[0.085] bg-[#070914]/93 shadow-[0_24px_75px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-2xl";

/* =========================================================
   PREMIUM ICON BOX
========================================================= */

function PremiumIconBox({
  children,
  className = "",
}) {
  return (
    <span
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_14%,rgba(255,255,255,0.12),transparent_42%)]" />
      <span className="relative z-10">
        {children}
      </span>
    </span>
  );
}

/* =========================================================
   PREMIUM BUTTON
========================================================= */

function PremiumButton({
  children,
  icon,
  onClick,
  type = "button",
  className = "",
  variant = "ghost",
}) {
  const variants = {
    ghost:
      "bg-white/[0.025] text-slate-400 hover:bg-violet-500/[0.055] hover:text-white hover:shadow-[0_10px_30px_rgba(124,58,237,0.09)]",
    active:
      "bg-gradient-to-r from-violet-500/[0.13] via-fuchsia-500/[0.08] to-blue-500/[0.05] text-violet-100 shadow-[0_10px_32px_rgba(124,58,237,0.12)]",
    primary:
      "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 text-white shadow-[0_14px_38px_rgba(124,58,237,0.28)] hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(124,58,237,0.40)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl px-3.5 py-2.5 text-[9px] font-semibold transition-all duration-300 active:scale-[0.98] ${variants[variant]} ${className}`}
    >
      {variant ===
        "primary" && (
        <span className="pointer-events-none absolute inset-y-0 -left-[90%] w-[60%] rotate-[14deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-all duration-700 group-hover:left-[125%]" />
      )}

      {icon && (
        <span className="relative z-10">
          {icon}
        </span>
      )}

      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  onClick,
}) {
  const iconStyles = {
    purple:
      "bg-violet-500/[0.11] text-violet-100 shadow-[0_0_25px_rgba(139,92,246,0.12)]",
    blue:
      "bg-blue-500/[0.10] text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.10)]",
    green:
      "bg-emerald-500/[0.10] text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.10)]",
    orange:
      "bg-orange-500/[0.10] text-orange-100 shadow-[0_0_25px_rgba(249,115,22,0.10)]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/[0.085] bg-[#080a16]/95 p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/25 hover:shadow-[0_22px_60px_rgba(91,33,182,0.14)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-500/[0.07] blur-3xl transition-all duration-500 group-hover:bg-violet-500/[0.14]" />

      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/28 to-transparent" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-[29px] font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-600">
            {subtitle}
          </p>
        </div>

        <PremiumIconBox className={iconStyles[color]}>
          <Icon
            size={21}
            strokeWidth={1.8}
          />
        </PremiumIconBox>
      </div>
    </button>
  );
}

/* =========================================================
   CONTENT CARD
========================================================= */

function ContentCard({
  item,
  platform,
  onEdit,
  onDelete,
}) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  return (
    <div
      className={`group relative rounded-xl border border-white/[0.065] p-2.5 transition-all duration-300 hover:-translate-y-0.5 ${getCardColor(
        platform?.iconType,
        item.status
      )}`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${getPlatformIconBox(
              platform?.iconType
            )}`}
          >
            <SocialIcon
              platform={
                platform?.iconType
              }
              size={18}
            />
          </span>

          <span className="truncate text-[9px] font-medium text-slate-500">
            {formatTime(
              item.time
            )}
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (prev) =>
                  !prev
              )
            }
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="flex gap-[3px]">
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-50 w-32 rounded-xl border border-white/[0.08] bg-[#0b0d19] p-1 shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(
                    false
                  );
                  onEdit(item);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[9px] text-slate-400 transition hover:bg-violet-500/[0.07] hover:text-white"
              >
                <Pencil
                  size={13}
                />
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(
                    false
                  );
                  onDelete(
                    item.id
                  );
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[9px] text-red-300 transition hover:bg-red-500/[0.08]"
              >
                <Trash2
                  size={13}
                />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="line-clamp-2 text-[10px] font-semibold leading-relaxed text-slate-100">
        {item.title}
      </p>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2 py-1 text-[8px] font-medium ${getStatusStyle(
            item.status
          )}`}
        >
          {item.status}
        </span>

        <span className="truncate text-[8px] text-slate-600">
          {platform?.name}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CALENDAR CELL
========================================================= */

function CalendarCell({
  children,
  active = false,
}) {
  return (
    <div
      className={`min-h-[clamp(98px,8vw,124px)] border-r border-t border-white/[0.055] p-[clamp(6px,0.7vw,10px)] transition-colors ${
        active
          ? "bg-violet-500/[0.035] shadow-[inset_0_0_36px_rgba(124,58,237,0.02)]"
          : "hover:bg-white/[0.012]"
      }`}
    >
      {children}
    </div>
  );
}

/* =========================================================
   PLATFORM ROW
========================================================= */

function PlatformRow({
  platform,
  days,
  items,
  onEdit,
  onDelete,
  onEmptyCell,
}) {
  return (
    <div className="grid grid-cols-[clamp(88px,7vw,110px)_repeat(7,minmax(0,1fr))]">
      <div className="border-r border-t border-white/[0.055] bg-[#070914] p-3.5">
        <div
          className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl ${getPlatformIconBox(
            platform.iconType
          )}`}
        >
          <SocialIcon
            platform={
              platform.iconType
            }
            size={21}
          />
        </div>

        <div className="truncate text-[10px] font-semibold text-slate-200">
          {platform.name}
        </div>
      </div>

      {days.map((day) => {
        const item = items.find(
          (content) =>
            content.date ===
              day.key &&
            content.platform ===
              platform.id
        );

        return (
          <CalendarCell
            key={day.key}
            active={
              day.isSelected ||
              day.isToday
            }
          >
            {item ? (
              <ContentCard
                item={item}
                platform={
                  platform
                }
                onEdit={
                  onEdit
                }
                onDelete={
                  onDelete
                }
              />
            ) : (
              <button
                type="button"
                onClick={() =>
                  onEmptyCell(
                    platform,
                    day.key
                  )
                }
                className="group flex min-h-[82px] w-full cursor-pointer items-center justify-center rounded-xl text-slate-700 transition hover:bg-violet-500/[0.035] hover:text-violet-300"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.02] opacity-0 transition-all duration-300 group-hover:bg-violet-500/[0.07] group-hover:opacity-100 group-hover:shadow-[0_0_18px_rgba(124,58,237,0.10)]">
                  <Plus
                    size={17}
                  />
                </span>
              </button>
            )}
          </CalendarCell>
        );
      })}
    </div>
  );
}

/* =========================================================
   CALENDAR VIEW
========================================================= */

function CalendarView({
  days,
  items,
  platforms,
  onEdit,
  onDelete,
  onAddPlatform,
  onEmptyCell,
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[780px]">
        <div className="grid grid-cols-[clamp(88px,7vw,110px)_repeat(7,minmax(0,1fr))]">
          <div className="border-r border-t border-white/[0.055] bg-[#070914]" />

          {days.map((day) => (
            <div
              key={day.key}
              className={`border-r border-t border-white/[0.055] px-2 py-3.5 text-center ${
                day.isSelected ||
                day.isToday
                  ? "bg-violet-500/[0.04]"
                  : ""
              }`}
            >
              <div
                className={`text-[10px] font-semibold ${
                  day.isSelected ||
                  day.isToday
                    ? "text-violet-100 drop-shadow-[0_0_9px_rgba(167,139,250,0.30)]"
                    : "text-slate-400"
                }`}
              >
                {day.label}{" "}
                {day.dayNumber}
              </div>
            </div>
          ))}
        </div>

        {platforms.map(
          (platform) => (
            <PlatformRow
              key={
                platform.id
              }
              platform={
                platform
              }
              days={days}
              items={items}
              onEdit={onEdit}
              onDelete={
                onDelete
              }
              onEmptyCell={
                onEmptyCell
              }
            />
          )
        )}

        <div className="grid grid-cols-[clamp(88px,7vw,110px)_repeat(7,minmax(0,1fr))]">
          <div className="border-r border-t border-white/[0.055] p-2.5">
            <button
              type="button"
              onClick={
                onAddPlatform
              }
              className="group flex min-h-[74px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.10] bg-gradient-to-b from-white/[0.018] to-transparent px-3 py-3 text-center transition-all duration-300 hover:border-violet-300/25 hover:bg-violet-500/[0.035] hover:shadow-[0_12px_30px_rgba(124,58,237,0.08)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.025] text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-500/[0.08] group-hover:text-violet-200 group-hover:shadow-[0_0_18px_rgba(124,58,237,0.12)]">
                <Plus
                  size={17}
                  strokeWidth={1.8}
                />
              </span>

              <span className="text-[8px] font-medium text-slate-600 transition-colors duration-300 group-hover:text-violet-200">
                Add Platform
              </span>
            </button>
          </div>

          {days.map(
            (day) => (
              <div
                key={day.key}
                className="min-h-[74px] border-r border-t border-white/[0.055]"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOARD ITEM
========================================================= */

function BoardItem({
  item,
  platform,
  onEdit,
  onDelete,
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#090b17] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/22 hover:shadow-[0_18px_45px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${getPlatformIconBox(
            platform?.iconType
          )}`}
        >
          <SocialIcon
            platform={
              platform?.iconType
            }
            size={20}
          />
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              onEdit(item)
            }
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/[0.05] hover:text-violet-200"
          >
            <Pencil
              size={13}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(item.id)
            }
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/[0.08] hover:text-red-200"
          >
            <Trash2
              size={13}
            />
          </button>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-xs font-semibold leading-relaxed text-slate-100">
        {item.title}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="truncate text-[9px] text-slate-500">
          {formatLongDate(
            item.date
          )}
        </span>

        <span className="text-[9px] text-slate-600">
          {formatTime(item.time)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`rounded-full border px-2 py-1 text-[7px] ${getStatusStyle(
            item.status
          )}`}
        >
          {item.status}
        </span>

        <ArrowUpRight
          size={15}
          className="text-slate-700 transition group-hover:text-violet-300"
        />
      </div>
    </div>
  );
}

/* =========================================================
   BOARD VIEW
========================================================= */

function BoardView({
  items,
  platforms,
  onEdit,
  onDelete,
  onOpenCreate,
}) {
  const columns = [
    {
      status: "Draft",
      dot: "bg-slate-400",
    },
    {
      status: "Scheduled",
      dot: "bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.65)]",
    },
    {
      status: "Published",
      dot: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.55)]",
    },
  ];

  return (
    <div className="grid min-h-[520px] gap-4 p-4 md:grid-cols-3">
      {columns.map(
        (column) => {
          const columnItems =
            items
              .filter(
                (item) =>
                  item.status ===
                  column.status
              )
              .sort(
                (a, b) =>
                  `${a.date}T${a.time}`.localeCompare(
                    `${b.date}T${b.time}`
                  )
              );

          return (
            <section
              key={
                column.status
              }
              className="flex min-h-[500px] flex-col rounded-2xl border border-white/[0.065] bg-white/[0.012] p-3 transition hover:border-violet-300/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${column.dot}`}
                  />

                  <span className="text-xs font-semibold text-slate-200">
                    {
                      column.status
                    }
                  </span>
                </div>

                <span className="rounded-full border border-white/[0.05] bg-white/[0.035] px-2 py-1 text-[9px] text-slate-500">
                  {
                    columnItems.length
                  }
                </span>
              </div>

              <div className="mt-4 flex flex-1 flex-col">
                {columnItems.length ===
                0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenCreate(
                        column.status
                      )
                    }
                    className="group flex min-h-[420px] flex-1 cursor-pointer flex-col items-center justify-start rounded-xl border border-dashed border-white/[0.075] bg-gradient-to-b from-white/[0.014] via-violet-500/[0.012] to-transparent pt-10 text-center transition-all duration-300 hover:border-violet-300/22 hover:bg-violet-500/[0.025]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.018] text-slate-700 transition-all duration-300 group-hover:bg-violet-500/[0.07] group-hover:text-violet-200">
                      <Plus
                        size={18}
                      />
                    </span>

                    <span className="mt-3 text-[9px] font-medium text-slate-600 transition group-hover:text-violet-200">
                      Add{" "}
                      {
                        column.status
                      }
                    </span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {columnItems.map(
                      (item) => (
                        <BoardItem
                          key={
                            item.id
                          }
                          item={
                            item
                          }
                          platform={platforms.find(
                            (
                              platform
                            ) =>
                              platform.id ===
                              item.platform
                          )}
                          onEdit={
                            onEdit
                          }
                          onDelete={
                            onDelete
                          }
                        />
                      )
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onOpenCreate(
                          column.status
                        )
                      }
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.06] py-3 text-[8px] text-slate-600 transition-all duration-300 hover:border-violet-300/18 hover:bg-violet-500/[0.025] hover:text-violet-200"
                    >
                      <Plus
                        size={13}
                      />
                      Add{" "}
                      {
                        column.status
                      }
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        }
      )}
    </div>
  );
}

/* =========================================================
   OVERVIEW LEGEND
========================================================= */

function OverviewLegend({
  color,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span
        className={`h-2 w-2 rounded-[3px] ${color}`}
      />

      <span className="text-[8px] text-slate-400">
        {label}
      </span>

      <span className="text-[8px] font-medium text-slate-300">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   CONTENT OVERVIEW DONUT
========================================================= */

function ProgressOverview({
  total,
  drafts,
  scheduled,
  published,
  cancelled,
}) {
  const overviewTotal =
    total + cancelled;

  const safeTotal =
    Math.max(
      overviewTotal,
      1
    );

  const scheduledPercent =
    overviewTotal > 0
      ? Math.round(
          (scheduled /
            overviewTotal) *
            100
        )
      : 0;

  const publishedPercent =
    overviewTotal > 0
      ? Math.round(
          (published /
            overviewTotal) *
            100
        )
      : 0;

  const draftsPercent =
    overviewTotal > 0
      ? Math.round(
          (drafts /
            overviewTotal) *
            100
        )
      : 0;

  const cancelledPercent =
    overviewTotal > 0
      ? Math.round(
          (cancelled /
            overviewTotal) *
            100
        )
      : 0;

  const scheduledDeg =
    (scheduled /
      safeTotal) *
    360;

  const publishedDeg =
    (published /
      safeTotal) *
    360;

  const draftsDeg =
    (drafts /
      safeTotal) *
    360;

  const cancelledDeg =
    (cancelled /
      safeTotal) *
    360;

  const publishedStart =
    scheduledDeg;

  const draftsStart =
    scheduledDeg +
    publishedDeg;

  const draftsEnd =
    draftsStart +
    draftsDeg;

  const cancelledStart =
    draftsEnd;

  const cancelledEnd =
    cancelledStart +
    cancelledDeg;

  const gradient =
    overviewTotal === 0
      ? "conic-gradient(#1b1e2a 0deg 360deg)"
      : `conic-gradient(
          #7c3aed 0deg ${scheduledDeg}deg,
          #22c55e ${publishedStart}deg ${draftsStart}deg,
          #f97316 ${draftsStart}deg ${draftsEnd}deg,
          #ef4444 ${cancelledStart}deg ${cancelledEnd}deg,
          #232636 ${cancelledEnd}deg 360deg
        )`;

  return (
    <div className="mt-4 rounded-2xl bg-[#080a16]/82 p-3.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-white">
            Content Overview
          </p>

          <p className="mt-1 text-[8px] text-slate-600">
            Live planner activity
          </p>
        </div>

        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/[0.07] text-violet-300">
          <BarChart3
            size={14}
          />
        </span>
      </div>

      <div className="mt-5 flex items-center justify-center gap-5">
        <div
          className="relative flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-full shadow-[0_0_28px_rgba(124,58,237,0.12)]"
          style={{
            background:
              gradient,
          }}
        >
          <div className="absolute inset-[10px] rounded-full bg-[#090b17]" />

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[24px] font-bold leading-none text-white">
              {
                overviewTotal
              }
            </span>

            <span className="mt-1 text-[8px] text-slate-600">
              Total
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <OverviewLegend
            color="bg-violet-500"
            label="Scheduled"
            value={`${scheduled} (${scheduledPercent}%)`}
          />

          <OverviewLegend
            color="bg-emerald-500"
            label="Published"
            value={`${published} (${publishedPercent}%)`}
          />

          <OverviewLegend
            color="bg-orange-500"
            label="Drafts"
            value={`${drafts} (${draftsPercent}%)`}
          />

          <OverviewLegend
            color="bg-red-500"
            label="Cancelled"
            value={`${cancelled} (${cancelledPercent}%)`}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI CALENDAR
========================================================= */

function MiniCalendar({
  selectedDate,
  onSelect,
  contentDates,
}) {
  const selected =
    parseDateKey(
      selectedDate
    );

  const firstMonth =
    new Date(
      selected.getFullYear(),
      selected.getMonth(),
      1
    );

  const gridStart =
    startOfWeek(
      firstMonth
    );

  const days =
    Array.from(
      {
        length: 42,
      },
      (_, index) =>
        addDays(
          gridStart,
          index
        )
    );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            onSelect(
              formatDateKey(
                new Date(
                  selected.getFullYear(),
                  selected.getMonth() -
                    1,
                  1
                )
              )
            )
          }
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.025] text-slate-500 transition hover:bg-violet-500/[0.05] hover:text-white"
        >
          <ChevronLeft
            size={16}
          />
        </button>

        <span className="text-xs font-semibold text-white">
          {selected.toLocaleString(
            "en-US",
            {
              month:
                "long",
              year: "numeric",
            }
          )}
        </span>

        <button
          type="button"
          onClick={() =>
            onSelect(
              formatDateKey(
                new Date(
                  selected.getFullYear(),
                  selected.getMonth() +
                    1,
                  1
                )
              )
            )
          }
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.025] text-slate-500 transition hover:bg-violet-500/[0.05] hover:text-white"
        >
          <ChevronRight
            size={16}
          />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-[8px] font-medium text-slate-600">
        {[
          "Su",
          "Mo",
          "Tu",
          "We",
          "Th",
          "Fr",
          "Sa",
        ].map((day) => (
          <span key={day}>
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key =
            formatDateKey(day);

          const isSelected =
            key ===
            selectedDate;

          const sameMonth =
            day.getMonth() ===
            selected.getMonth();

          const hasContent =
            contentDates.has(key);

          return (
            <div
              key={key}
              className="flex justify-center"
            >
              <button
                type="button"
                onClick={() =>
                  onSelect(key)
                }
                className={`relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[9px] transition ${
                  isSelected
                    ? "bg-violet-600 text-white shadow-[0_0_18px_rgba(139,92,246,0.45)]"
                    : sameMonth
                    ? "text-slate-500 hover:bg-white/[0.05] hover:text-white"
                    : "text-slate-800"
                }`}
              >
                {day.getDate()}

                {hasContent &&
                  !isSelected && (
                    <span className="absolute bottom-[2px] h-1 w-1 rounded-full bg-violet-300 shadow-[0_0_6px_rgba(167,139,250,0.65)]" />
                  )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS FILTER
========================================================= */

function StatusFilter({
  value,
  onChange,
}) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (prev) =>
              !prev
          )
        }
        className={`group inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-xl px-3.5 text-[9px] font-semibold transition-all duration-300 ${
          open
            ? "bg-gradient-to-r from-violet-500/[0.11] via-fuchsia-500/[0.06] to-blue-500/[0.04] text-violet-100 shadow-[0_10px_30px_rgba(124,58,237,0.10)]"
            : "bg-white/[0.025] text-slate-400 hover:bg-violet-500/[0.04] hover:text-white"
        }`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.025]">
          <CheckCircle2
            size={14}
          />
        </span>

        <span>{value}</span>

        <ChevronDown
          size={12}
          className={`transition-transform duration-300 ${
            open
              ? "rotate-180 text-violet-200"
              : "text-slate-600"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 min-w-[190px] overflow-hidden rounded-2xl border border-violet-300/12 bg-[#0a0c18]/98 p-1.5 shadow-[0_28px_70px_rgba(0,0,0,0.62),0_0_30px_rgba(124,58,237,0.08)] backdrop-blur-2xl">
          {STATUS_OPTIONS.map(
            (status) => {
              const selected =
                status === value;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    onChange(
                      status
                    );
                    setOpen(
                      false
                    );
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-[9px] font-medium transition ${
                    selected
                      ? "bg-violet-500/[0.12] text-violet-100"
                      : "text-slate-500 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span>
                    {status}
                  </span>

                  {selected && (
                    <Check
                      size={13}
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PLATFORM FILTER
========================================================= */

function PlatformFilter({
  value,
  options,
  onChange,
}) {
  const [open, setOpen] =
    useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (prev) =>
              !prev
          )
        }
        className="group inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-xl bg-white/[0.025] px-3.5 text-[9px] font-semibold text-slate-400 transition hover:bg-violet-500/[0.04] hover:text-white"
      >
        <Globe2 size={14} />

        <span>
          {value}
        </span>

        <ChevronDown
          size={12}
          className={`transition-transform ${
            open
              ? "rotate-180 text-violet-200"
              : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 min-w-[195px] overflow-hidden rounded-2xl border border-violet-300/12 bg-[#0a0c18]/98 p-1.5 shadow-[0_28px_70px_rgba(0,0,0,0.62),0_0_30px_rgba(124,58,237,0.08)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => {
              onChange(
                "All Platforms"
              );
              setOpen(
                false
              );
            }}
            className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-[9px] ${
              value ===
              "All Platforms"
                ? "bg-violet-500/[0.10] text-violet-100"
                : "text-slate-500 hover:bg-white/[0.035] hover:text-white"
            }`}
          >
            <span>
              All Platforms
            </span>

            {value ===
              "All Platforms" && (
              <Check size={13} />
            )}
          </button>

          {options.map(
            (platform) => {
              const selected =
                value ===
                platform.name;

              return (
                <button
                  key={
                    platform.id
                  }
                  type="button"
                  onClick={() => {
                    onChange(
                      platform.name
                    );
                    setOpen(
                      false
                    );
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-[9px] ${
                    selected
                      ? "bg-violet-500/[0.10] text-violet-100"
                      : "text-slate-500 hover:bg-white/[0.035] hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <SocialIcon
                      platform={
                        platform.iconType
                      }
                      size={13}
                    />
                    {
                      platform.name
                    }
                  </span>

                  {selected && (
                    <Check
                      size={13}
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CREATE / EDIT MODAL
========================================================= */

function CreateContentModal({
  initialData,
  defaultDate,
  platforms,
  onClose,
  onSave,
}) {
  const [form, setForm] =
    useState({
      title:
        initialData?.title ||
        "",
      platform:
        initialData?.platform ||
        platforms[0]?.id,
      status:
        initialData?.status ||
        "Draft",
      date:
        initialData?.date ||
        defaultDate,
      time:
        initialData?.time ||
        "09:00",
    });

  const isEditing =
    Boolean(
      initialData?.id
    );

  const selectedPlatform =
    platforms.find(
      (platform) =>
        platform.id ===
        form.platform
    );

  const updateField = (
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      !form.title.trim()
    ) {
      return;
    }

    onSave({
      ...form,
      title:
        form.title.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/72 p-4 backdrop-blur-md">
      <form
        onSubmit={
          handleSubmit
        }
        className="relative w-full max-w-lg overflow-hidden rounded-[24px] bg-[#090b17] shadow-[0_35px_110px_rgba(0,0,0,0.72),0_0_50px_rgba(124,58,237,0.10)]"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-600/[0.16] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-blue-600/[0.08] blur-3xl" />

        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />

        <div className="relative border-b border-white/[0.05] p-5">
          <button
            type="button"
            onClick={onClose}
            className="group absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/[0.025] text-slate-500 transition-all duration-300 hover:bg-violet-500/[0.07] hover:text-white"
          >
            <X
              size={16}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
          </button>

          <PremiumIconBox className="mb-3 bg-gradient-to-br from-violet-500/[0.13] to-blue-500/[0.05] text-violet-100 shadow-[0_0_25px_rgba(124,58,237,0.11)]">
            {isEditing ? (
              <Pencil size={20} />
            ) : (
              <PenLine
                size={20}
              />
            )}
          </PremiumIconBox>

          <h2 className="text-lg font-bold tracking-tight text-white">
            {isEditing
              ? "Edit Content"
              : "Create New Content"}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {isEditing
              ? "Update your content details."
              : "Add a new piece to your planner."}
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-2 block text-[10px] font-medium text-slate-400">
              Content title
            </label>

            <input
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              placeholder="e.g. New content idea"
              className="h-11 w-full rounded-xl bg-white/[0.025] px-3 text-xs text-white outline-none transition-all duration-300 placeholder:text-slate-700 focus:bg-violet-500/[0.035] focus:shadow-[0_0_25px_rgba(124,58,237,0.08)]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-medium text-slate-400">
                Platform
              </label>

              <div className="relative">
                <select
                  value={
                    form.platform
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "platform",
                      event
                        .target
                        .value
                    )
                  }
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl bg-[#0c0e1b] px-3 pr-10 text-xs text-slate-300 outline-none transition focus:bg-violet-500/[0.025]"
                >
                  {platforms.map(
                    (
                      platform
                    ) => (
                      <option
                        key={
                          platform.id
                        }
                        value={
                          platform.id
                        }
                      >
                        {
                          platform.name
                        }
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${getPlatformIconBox(
                    selectedPlatform?.iconType
                  )}`}
                >
                  <SocialIcon
                    platform={
                      selectedPlatform?.iconType
                    }
                    size={15}
                  />
                </span>

                <span className="text-[8px] text-slate-600">
                  {
                    selectedPlatform?.name
                  }
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-medium text-slate-400">
                Status
              </label>

              <div className="relative">
                <select
                  value={
                    form.status
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "status",
                      event
                        .target
                        .value
                    )
                  }
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl bg-[#0c0e1b] px-3 pr-10 text-xs text-slate-300 outline-none transition focus:bg-violet-500/[0.025]"
                >
                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {
                          status
                        }
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>

              <div className="mt-2">
                <span
                  className={`rounded-full border px-2 py-1 text-[7px] ${getStatusStyle(
                    form.status
                  )}`}
                >
                  {
                    form.status
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-medium text-slate-400">
                Date
              </label>

              <input
                type="date"
                value={
                  form.date
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "date",
                    event
                      .target
                      .value
                  )
                }
                className="h-11 w-full cursor-pointer rounded-xl bg-[#0c0e1b] px-3 text-xs text-slate-400 outline-none transition focus:bg-violet-500/[0.025]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-medium text-slate-400">
                Time
              </label>

              <input
                type="time"
                value={
                  form.time
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "time",
                    event
                      .target
                      .value
                  )
                }
                className="h-11 w-full cursor-pointer rounded-xl bg-[#0c0e1b] px-3 text-xs text-slate-400 outline-none transition focus:bg-violet-500/[0.025]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <PremiumButton
              type="button"
              onClick={
                onClose
              }
            >
              Cancel
            </PremiumButton>

            <PremiumButton
              type="submit"
              variant="primary"
              icon={
                isEditing ? (
                  <Check
                    size={14}
                  />
                ) : (
                  <Plus
                    size={14}
                  />
                )
              }
            >
              {isEditing
                ? "Save Changes"
                : "Add to Planner"}
            </PremiumButton>
          </div>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   DELETE MODAL
========================================================= */

function ConfirmDeleteModal({
  item,
  platform,
  onCancel,
  onConfirm,
}) {
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-[420px] overflow-hidden rounded-[24px] bg-[#090b17] shadow-[0_35px_110px_rgba(0,0,0,0.72)]">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/[0.08] text-red-200">
              <Trash2
                size={21}
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-white">
                Delete this content?
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                The item will be removed permanently.
              </p>
            </div>

            <button
              type="button"
              onClick={
                onCancel
              }
              className="ml-auto cursor-pointer text-slate-600 transition hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-white/[0.02] p-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${getPlatformIconBox(
                  platform?.iconType
                )}`}
              >
                <SocialIcon
                  platform={
                    platform?.iconType
                  }
                  size={19}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-slate-200">
                  {item.title}
                </p>

                <p className="mt-1 text-[8px] text-slate-600">
                  {formatLongDate(
                    item.date
                  )}{" "}
                  ·{" "}
                  {formatTime(
                    item.time
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <PremiumButton
              type="button"
              onClick={
                onCancel
              }
            >
              Cancel
            </PremiumButton>

            <button
              type="button"
              onClick={
                onConfirm
              }
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-2.5 text-[10px] font-semibold text-white shadow-[0_10px_30px_rgba(239,68,68,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_15px_36px_rgba(239,68,68,0.28)]"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 rotate-[14deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[115%]" />

              <span className="relative z-10">
                Delete
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADD PLATFORM MODAL
========================================================= */

function AddPlatformModal({
  onClose,
  onAdd,
}) {
  const [name, setName] =
    useState("");

  const [iconType, setIconType] =
    useState("instagram");

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    onAdd({
      name,
      iconType,
    });
  };

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <form
        onSubmit={
          handleSubmit
        }
        className="relative w-full max-w-[440px] overflow-hidden rounded-[24px] bg-[#090b17] p-6 shadow-[0_35px_110px_rgba(0,0,0,0.72)]"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-600/[0.13] blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          className="group absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/[0.025] text-slate-600 transition hover:bg-violet-500/[0.07] hover:text-white"
        >
          <X
            size={16}
            className="transition-transform duration-300 group-hover:rotate-90"
          />
        </button>

        <PremiumIconBox className="bg-violet-500/[0.08] text-violet-100">
          <Globe2 size={21} />
        </PremiumIconBox>

        <h2 className="mt-4 text-lg font-bold text-white">
          Add Platform
        </h2>

        <p className="mt-1 text-[10px] text-slate-600">
          Add another content channel to your planner.
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-[10px] font-medium text-slate-400">
            Platform name
          </label>

          <input
            autoFocus
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="e.g. Threads"
            className="h-11 w-full rounded-xl bg-white/[0.025] px-3 text-xs text-white outline-none placeholder:text-slate-700 focus:bg-violet-500/[0.03]"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-[10px] font-medium text-slate-400">
            Icon type
          </label>

          <div className="relative">
            <select
              value={iconType}
              onChange={(event) =>
                setIconType(
                  event.target.value
                )
              }
              className="h-11 w-full cursor-pointer appearance-none rounded-xl bg-[#0c0e1b] px-3 pr-10 text-xs text-slate-300 outline-none"
            >
              {PLATFORM_TYPES.map(
                (type) => (
                  <option
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
            />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/[0.018] p-4">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-700">
            Preview
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getPlatformIconBox(
                iconType
              )}`}
            >
              <SocialIcon
                platform={
                  iconType
                }
                size={22}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                {name ||
                  "Your Platform"}
              </p>

              <p className="mt-1 text-[8px] text-slate-600">
                This platform will appear across the planner.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <PremiumButton
            type="button"
            onClick={
              onClose
            }
          >
            Cancel
          </PremiumButton>

          <PremiumButton
            type="submit"
            variant="primary"
            icon={
              <Plus size={14} />
            }
          >
            Add Platform
          </PremiumButton>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ContentPlanner() {
  
  const [items, setItems] =
    useState(() =>
      readStorage(
        CONTENT_STORAGE_KEY,
        []
      )
    );

  const [platforms, setPlatforms] =
    useState(() =>
      readStorage(
        PLATFORM_STORAGE_KEY,
        DEFAULT_PLATFORMS
      )
    );

  const [plannerIdeas, setPlannerIdeas] = useState([]);

  const [
    cancelledCount,
    setCancelledCount,
  ] = useState(() =>
    readStorage(
      CANCELLED_STORAGE_KEY,
      0
    )
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("Draft");

  const [
    platformFilter,
    setPlatformFilter,
  ] = useState(
    "All Platforms"
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [view, setView] =
    useState("calendar");

  const [weekStart, setWeekStart] =
    useState(
      startOfWeek(
        new Date()
      )
    );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    formatDateKey(
      new Date()
    )
  );

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    editingItem,
    setEditingItem,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    showDelete,
    setShowDelete,
  ] = useState(false);

  const [
    showAddPlatform,
    setShowAddPlatform,
  ] = useState(false);

  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      CONTENT_STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      PLATFORM_STORAGE_KEY,
      JSON.stringify(
        platforms
      )
    );
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem(
      CANCELLED_STORAGE_KEY,
      JSON.stringify(
        cancelledCount
      )
    );
  }, [
    cancelledCount,
  ]);

  useEffect(() => {
    const loadPlannerIdeas = () => {
        try {
            const saved = JSON.parse(
                localStorage.getItem(
                    CONTENT_PLANNER_IDEAS_KEY
                )
            );

            setPlannerIdeas(
                Array.isArray(saved)
                    ? saved
                    : []
            );
        } catch {
            setPlannerIdeas([]);
        }
    };

    loadPlannerIdeas();

    const handlePlannerIdeasChange = () => {
        loadPlannerIdeas();
    };

    window.addEventListener(
        "content-planner-ideas-changed",
        handlePlannerIdeasChange
    );

    window.addEventListener(
        "storage",
        handlePlannerIdeasChange
    );

    return () => {
        window.removeEventListener(
            "content-planner-ideas-changed",
            handlePlannerIdeasChange
        );

        window.removeEventListener(
            "storage",
            handlePlannerIdeasChange
        );
    };
}, []);

  /* =======================================================
     WEEK DAYS
  ======================================================= */

  const weekDays = useMemo(
    () => {
      return Array.from(
        {
          length: 7,
        },
        (_, index) => {
          const date =
            addDays(
              weekStart,
              index
            );

          const key =
            formatDateKey(
              date
            );

          return {
            key,
            date,
            label:
              date.toLocaleDateString(
                "en-US",
                {
                  weekday:
                    "short",
                }
              ),
            dayNumber:
              date.getDate(),
            isToday:
              key ===
              formatDateKey(
                new Date()
              ),
            isSelected:
              key ===
              selectedDate,
          };
        }
      );
    },
    [
      weekStart,
      selectedDate,
    ]
  );

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(
    () => ({
      total:
        items.length,

      drafts: items.filter(
        (item) =>
          item.status ===
          "Draft"
      ).length,

      scheduled:
        items.filter(
          (item) =>
            item.status ===
            "Scheduled"
        ).length,

      published:
        items.filter(
          (item) =>
            item.status ===
            "Published"
        ).length,
    }),
    [items]
  );

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredItems =
    useMemo(
      () => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        return items.filter(
          (item) => {
            const platform =
              platforms.find(
                (p) =>
                  p.id ===
                  item.platform
              );

            const statusMatch =
              item.status ===
              statusFilter;

            const platformMatch =
              platformFilter ===
                "All Platforms" ||
              platform?.name ===
                platformFilter;

            const searchMatch =
              !query ||
              item.title
                .toLowerCase()
                .includes(
                  query
                );

            return (
              statusMatch &&
              platformMatch &&
              searchMatch
            );
          }
        );
      },
      [
        items,
        platforms,
        statusFilter,
        platformFilter,
        searchQuery,
      ]
    );

  /* =======================================================
     CREATE
  ======================================================= */

  const openCreate = (
    status = statusFilter,
    date = selectedDate,
    platformId =
      platforms[0]?.id
  ) => {
    setEditingItem({
      _new: true,
      title: "",
      platform:
        platformId,
      status,
      date,
      time: "09:00",
    });

    setShowModal(
      true
    );
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const openEdit = (
    item
  ) => {
    setEditingItem(
      item
    );

    setShowModal(
      true
    );
  };

  /* =======================================================
     SAVE CONTENT
  ======================================================= */

  const saveContent = (
    form
  ) => {
    if (
      !form.title.trim()
    ) {
      return;
    }

    const cleanItem = {
      title:
        form.title.trim(),
      platform:
        form.platform,
      status:
        form.status,
      date:
        form.date,
      time:
        form.time ||
        "09:00",
    };

    if (
      editingItem?._new
    ) {
      const id =
        typeof crypto !==
          "undefined" &&
        crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setItems(
        (prev) => [
          ...prev,
          {
            id,
            ...cleanItem,
          },
        ]
      );
    } else {
      setItems(
        (prev) =>
          prev.map(
            (item) =>
              item.id ===
              editingItem.id
                ? {
                    ...item,
                    ...cleanItem,
                  }
                : item
          )
      );
    }

    const savedDate =
      parseDateKey(
        form.date
      );

    setSelectedDate(
      form.date
    );

    setWeekStart(
      startOfWeek(
        savedDate
      )
    );

    setStatusFilter(
      form.status
    );

    setPlatformFilter(
      "All Platforms"
    );

    setShowModal(
      false
    );

    setEditingItem(
      null
    );
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const requestDelete = (
    id
  ) => {
    const target =
      items.find(
        (item) =>
          item.id ===
          id
      );

    if (!target) {
      return;
    }

    setDeleteTarget(
      target
    );

    setShowDelete(
      true
    );
  };

  const confirmDelete =
    () => {
      if (
        !deleteTarget
      ) {
        return;
      }

      setItems(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !==
              deleteTarget.id
          )
      );

      setCancelledCount(
        (prev) =>
          prev + 1
      );

      setDeleteTarget(
        null
      );

      setShowDelete(
        false
      );
    };

  /* =======================================================
     ADD PLATFORM
  ======================================================= */

  const addPlatform = ({
    name,
    iconType,
  }) => {
    const cleanName =
      name.trim();

    if (!cleanName) {
      return;
    }

    const exists =
      platforms.some(
        (platform) =>
          platform.name
            .toLowerCase() ===
          cleanName.toLowerCase()
      );

    if (exists) {
      return;
    }

    setPlatforms(
      (prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          name: cleanName,
          iconType:
            iconType ||
            "other",
          custom: true,
        },
      ]
    );

    setShowAddPlatform(
      false
    );
  };

  /* =======================================================
     WEEK NAVIGATION
  ======================================================= */

  const previousWeek =
    () => {
      const next =
        addWeeks(
          weekStart,
          -1
        );

      setWeekStart(
        next
      );

      setSelectedDate(
        formatDateKey(
          next
        )
      );
    };

  const nextWeek = () => {
    const next =
      addWeeks(
        weekStart,
        1
      );

    setWeekStart(
      next
    );

    setSelectedDate(
      formatDateKey(
        next
      )
    );
  };

  const goToday = () => {
    const today =
      new Date();

    setSelectedDate(
      formatDateKey(
        today
      )
    );

    setWeekStart(
      startOfWeek(
        today
      )
    );
  };
  const contentDates =
    useMemo(
      () =>
        new Set(
          items.map(
            (item) =>
              item.date
          )
        ),
      [items]
    );

  return (
    <main className="relative min-h-screen py-15 w-full overflow-x-hidden bg-[#02030a] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[3%] top-[-7%] h-[590px] w-[590px] rounded-full bg-violet-600/[0.15] blur-[145px]" />
        <div className="absolute left-[28%] top-[4%] h-[470px] w-[470px] rounded-full bg-fuchsia-500/[0.09] blur-[135px]" />
        <div className="absolute right-[-7%] top-[14%] h-[690px] w-[690px] rounded-full bg-indigo-600/[0.075] blur-[165px]" />
        <div className="absolute bottom-[-12%] left-[36%] h-[540px] w-[540px] rounded-full bg-purple-700/[0.07] blur-[155px]" />
        <div className="absolute left-[54%] top-[58%] h-[350px] w-[350px] rounded-full bg-violet-500/[0.045] blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_17%_0%,rgba(139,92,246,0.10),transparent_32%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_38%,rgba(99,102,241,0.065),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:82px_82px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1750px] px-[clamp(16px,3vw,52px)] pb-[clamp(32px,5vw,72px)] pt-[clamp(28px,4vw,56px)]">
        <section className="mb-[clamp(22px,2.5vw,34px)] flex w-full flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <div className="relative flex h-[clamp(54px,4vw,66px)] w-[clamp(54px,4vw,66px)] shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-violet-500/24 via-fuchsia-500/12 to-blue-500/11 shadow-[0_0_42px_rgba(124,58,237,0.24)]">
                <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.20),transparent_40%)]" />

                <div className="pointer-events-none absolute inset-[-18px] rounded-full bg-violet-500/[0.12] blur-xl" />

                <CalendarDays
                  size={33}
                  strokeWidth={1.8}
                  className="relative z-10 text-violet-50 drop-shadow-[0_0_13px_rgba(196,181,253,0.70)]"
                />
              </div>

              <div className="min-w-0">
                <h1 className="whitespace-nowrap text-[clamp(31px,4vw,48px)] font-bold leading-[0.98] tracking-[-0.0em]">
                  <span className="bg-gradient-to-r from-fuchsia-700 via-violet-630 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(139,92,246,0.28)]">
                    Content Planner
                  </span>
                </h1>

                <p className="mt-2 text-[clamp(12px,1vw,15px)] text-slate-400">
                  Plan, organize &
                  schedule your
                  content strategy
                </p>
              </div>
            </div>
          </div>

          <PremiumButton
            variant="primary"
            icon={
              <Plus size={18} />
            }
            onClick={() =>
              openCreate()
            }
            className="px-5 py-3"
          >
            Create Content
          </PremiumButton>
        </section>

        <section className="mb-[clamp(16px,2vw,24px)] grid grid-cols-1 gap-[clamp(10px,1.1vw,16px)] sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Content Pieces"
            value={
              stats.total
            }
            subtitle="All Time"
            icon={FileText}
            color="purple"
            onClick={() =>
              setStatusFilter(
                "Draft"
              )
            }
          />

          <StatCard
            title="Scheduled"
            value={
              stats.scheduled
            }
            subtitle="Planned Posts"
            icon={Clock3}
            color="blue"
            onClick={() =>
              setStatusFilter(
                "Scheduled"
              )
            }
          />

          <StatCard
            title="Published"
            value={
              stats.published
            }
            subtitle="Completed Posts"
            icon={
              CheckCircle2
            }
            color="green"
            onClick={() =>
              setStatusFilter(
                "Published"
              )
            }
          />

          <StatCard
            title="Drafts"
            value={
              stats.drafts
            }
            subtitle="Needs Attention"
            icon={PenLine}
            color="orange"
            onClick={() =>
              setStatusFilter(
                "Draft"
              )
            }
          />
        </section>

        <section className="grid w-full gap-[clamp(14px,1.5vw,24px)] 2xl:grid-cols-[minmax(0,1fr)_clamp(275px,19vw,330px)]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#070914]/93 shadow-[0_28px_90px_rgba(0,0,0,0.36)]">
            <div className="border-b border-white/[0.06] p-[clamp(14px,1.4vw,22px)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="inline-flex w-fit rounded-xl bg-white/[0.018] p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setView(
                        "calendar"
                      )
                    }
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[9px] font-semibold transition-all duration-300 ${
                      view ===
                      "calendar"
                        ? "bg-gradient-to-r from-violet-500/[0.16] to-fuchsia-500/[0.08] text-violet-100 shadow-[0_0_20px_rgba(124,58,237,0.10)]"
                        : "text-slate-600 hover:bg-white/[0.035] hover:text-white"
                    }`}
                  >
                    <CalendarDays
                      size={14}
                    />
                    Calendar
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setView(
                        "board"
                      )
                    }
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[9px] font-semibold transition-all duration-300 ${
                      view ===
                      "board"
                        ? "bg-gradient-to-r from-violet-500/[0.16] to-fuchsia-500/[0.08] text-violet-100 shadow-[0_0_20px_rgba(124,58,237,0.10)]"
                        : "text-slate-600 hover:bg-white/[0.035] hover:text-white"
                    }`}
                  >
                    <LayoutGrid
                      size={14}
                    />
                    Board
                    View
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <PlatformFilter
                    value={
                      platformFilter
                    }
                    options={
                      platforms
                    }
                    onChange={
                      setPlatformFilter
                    }
                  />

                  <StatusFilter
                    value={
                      statusFilter
                    }
                    onChange={
                      setStatusFilter
                    }
                  />

                  <div className="hidden items-center gap-2 rounded-xl bg-white/[0.02] px-3 transition-all focus-within:bg-violet-500/[0.025] sm:flex">
                    <Search
                      size={14}
                      className="text-slate-600"
                    />

                    <input
                      value={
                        searchQuery
                      }
                      onChange={(
                        event
                      ) =>
                        setSearchQuery(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Search..."
                      className="h-10 w-[130px] bg-transparent text-[9px] text-white outline-none placeholder:text-slate-700"
                    />
                  </div>

                  <PremiumButton
                    onClick={
                      goToday
                    }
                  >
                    Today
                  </PremiumButton>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={
                      previousWeek
                    }
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.02] text-slate-500 transition-all duration-300 hover:bg-violet-500/[0.05] hover:text-white"
                  >
                    <ChevronLeft
                      size={16}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      nextWeek
                    }
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.02] text-slate-500 transition-all duration-300 hover:bg-violet-500/[0.05] hover:text-white"
                  >
                    <ChevronRight
                      size={16}
                    />
                  </button>

                  <h2 className="ml-1 text-xs font-semibold text-white sm:text-sm">
                    {formatDateRange(
                      weekStart
                    )}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-violet-500/[0.055] px-2.5 py-1 text-[7px] text-violet-100">
                    {
                      statusFilter
                    }
                  </span>

                  <span className="text-[9px] text-slate-600">
                    {
                      filteredItems.length
                    }{" "}
                    visible
                  </span>
                </div>
              </div>
            </div>

            {view ===
            "calendar" ? (
              <CalendarView
                days={
                  weekDays
                }
                items={
                  filteredItems
                }
                platforms={
                  platforms
                }
                onEdit={
                  openEdit
                }
                onDelete={
                  requestDelete
                }
                onAddPlatform={() =>
                  setShowAddPlatform(
                    true
                  )
                }
                onEmptyCell={(
                  platform,
                  date
                ) =>
                  openCreate(
                    statusFilter,
                    date,
                    platform.id
                  )
                }
              />
            ) : (
              <BoardView
                items={
                  filteredItems
                }
                platforms={
                  platforms
                }
                onEdit={
                  openEdit
                }
                onDelete={
                  requestDelete
                }
                onOpenCreate={(
                  status
                ) =>
                  openCreate(
                    status,
                    selectedDate
                  )
                }
              />
            )}
          </div>

          <aside className="min-w-0 space-y-[clamp(14px,1.5vw,22px)]">
            <div
              className={`${panelClass} p-[clamp(15px,1.3vw,20px)]`}
            >
              <MiniCalendar
                selectedDate={
                  selectedDate
                }
                onSelect={(
                  date
                ) => {
                  setSelectedDate(
                    date
                  );

                  setWeekStart(
                    startOfWeek(
                      parseDateKey(
                        date
                      )
                    )
                  );
                }}
                contentDates={
                  contentDates
                }
              />
            </div>

            <div
              className={`${panelClass} p-[clamp(15px,1.3vw,20px)]`}
            >
              <ProgressOverview
                total={
                  stats.total
                }
                drafts={
                  stats.drafts
                }
                scheduled={
                  stats.scheduled
                }
                published={
                  stats.published
                }
                cancelled={
                  cancelledCount
                }
              />
            </div>

            <div
              className={`${panelClass} p-[clamp(15px,1.3vw,20px)]`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    {
                      statusFilter
                    }{" "}
                    Content
                  </h3>

                  <p className="mt-1 text-[8px] text-slate-600">
                    Your active
                    content
                  </p>
                </div>

                <span className="rounded-lg bg-violet-500/[0.055] px-2 py-1 text-[7px] text-violet-100">
                  {
                    filteredItems.length
                  }
                </span>
              </div>

              {filteredItems.length ===
              0 ? (
                <div className="flex min-h-[135px] flex-col items-center justify-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] text-slate-700">
                    <Clock3
                      size={19}
                    />
                  </div>

                  <p className="mt-3 text-[9px] text-slate-600">
                    No{" "}
                    {statusFilter.toLowerCase()}{" "}
                    content
                  </p>

                  <PremiumButton
                    variant="active"
                    onClick={() =>
                      openCreate(
                        statusFilter
                      )
                    }
                    className="mt-3"
                  >
                    Add{" "}
                    {
                      statusFilter
                    }
                  </PremiumButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems
                    .slice(0, 5)
                    .map(
                      (
                        item
                      ) => {
                        const platform =
                          platforms.find(
                            (
                              p
                            ) =>
                              p.id ===
                              item.platform
                          );

                        return (
                          <button
                            type="button"
                            key={
                              item.id
                            }
                            onClick={() =>
                              openEdit(
                                item
                              )
                            }
                            className="group flex w-full cursor-pointer items-center gap-3 text-left"
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getPlatformIconBox(
                                platform?.iconType
                              )}`}
                            >
                              <SocialIcon
                                platform={
                                  platform?.iconType
                                }
                                size={
                                  17
                                }
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[9px] font-semibold text-slate-200 transition group-hover:text-white">
                                {
                                  item.title
                                }
                              </p>

                              <p className="mt-1 text-[7px] text-slate-600">
                                {formatLongDate(
                                  item.date
                                )}{" "}
                                ·{" "}
                                {formatTime(
                                  item.time
                                )}
                              </p>
                            </div>
                          </button>
                        );
                      }
                    )}
                </div>
              )}
            </div>

            <div className={`${panelClass} p-[clamp(15px,1.3vw,20px)]`}>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-white">
                            Content Ideas Bank
                        </h3>

                        <p className="mt-1 text-[8px] text-slate-600">
                            Turn ideas into drafts
                        </p>
                    </div>

                    <Lightbulb
                        size={16}
                        className="text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]"
                    />
                </div>

                <div className="space-y-2.5">
                    {plannerIdeas.length === 0 ? (
                        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-white/[0.012] px-4 text-center">
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/[0.06] text-violet-300">
                                <Lightbulb size={17} />
                            </div>

                            <p className="text-[9px] font-medium text-slate-500">
                                No imported ideas yet
                            </p>

                            <p className="mt-1 text-[7px] text-slate-700">
                                Add ideas from Idea Generator
                            </p>
                        </div>
                    ) : (
                        plannerIdeas.map((idea) => {
                            let Icon = Sparkles;

                            const value = (
                                idea.title || ""
                            ).toLowerCase();

                            if (value.includes("ai")) {
                                Icon = Target;
                            } else if (value.includes("morning")) {
                                Icon = Clock3;
                            } else if (value.includes("apps")) {
                                Icon = Video;
                            } else if (value.includes("hooks")) {
                                Icon = Lightbulb;
                            }

                            return (
                                <button
                                    key={idea.id}
                                    type="button"
                                    onClick={() =>
                                        openCreate(
                                            "Draft",
                                            idea
                                        )
                                    }
                                    className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl bg-white/[0.018] p-2.5 text-left transition-all duration-300 hover:bg-violet-500/[0.035] hover:shadow-[0_10px_26px_rgba(124,58,237,0.07)]"
                                >
                                    <PremiumIconBox className="bg-violet-500/[0.08] text-violet-100 shadow-[0_0_18px_rgba(124,58,237,0.08)]">
                                        <Icon size={18} />
                                    </PremiumIconBox>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[9px] font-semibold text-slate-200 transition group-hover:text-white">
                                            {idea.title}
                                        </p>

                                        <p className="mt-1 text-[7px] text-slate-700">
                                            {idea.category ||
                                                idea.contentStyle ||
                                                "AI Generated Idea"}
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-lg bg-violet-500/[0.08] px-2 py-1 text-[7px] font-medium text-violet-300 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                        Use
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
            <div
              className={`${panelClass} p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Platforms
                  </h3>

                  <p className="mt-1 text-[8px] text-slate-600">
                    {
                      platforms.length
                    }{" "}
                    connected
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddPlatform(
                      true
                    )
                  }
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.018] text-slate-500 transition-all duration-300 hover:bg-violet-500/[0.06] hover:text-violet-200"
                >
                  <Plus
                    size={14}
                  />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {platforms.map(
                  (
                    platform
                  ) => (
                    <button
                      key={
                        platform.id
                      }
                      type="button"
                      onClick={() =>
                        setPlatformFilter(
                          platform.name
                        )
                      }
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[7px] transition-all duration-300 ${getPlatformIconBox(
                        platform.iconType
                      )} ${
                        platformFilter ===
                        platform.name
                          ? "ring-1 ring-violet-300/25"
                          : ""
                      }`}
                    >
                      <SocialIcon
                        platform={
                          platform.iconType
                        }
                        size={
                          11
                        }
                      />

                      {
                        platform.name
                      }
                    </button>
                  )
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>

      {showModal && (
        <CreateContentModal
          initialData={
            editingItem
          }
          defaultDate={
            selectedDate
          }
          platforms={
            platforms
          }
          onClose={() => {
            setShowModal(
              false
            );
            setEditingItem(
              null
            );
          }}
          onSave={
            saveContent
          }
        />
      )}

      {showDelete && (
        <ConfirmDeleteModal
          item={
            deleteTarget
          }
          platform={platforms.find(
            (
              platform
            ) =>
              platform.id ===
              deleteTarget?.platform
          )}
          onCancel={() => {
            setShowDelete(
              false
            );
            setDeleteTarget(
              null
            );
          }}
          onConfirm={
            confirmDelete
          }
        />
      )}

      {showAddPlatform && (
        <AddPlatformModal
          onClose={() =>
            setShowAddPlatform(
              false
            )
          }
          onAdd={
            addPlatform
          }
        />
      )}
    </main>
  );
}