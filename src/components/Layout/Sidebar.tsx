import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils/utils";
import { useUserStore } from "../../Store/useUserStore";
import { MessageSquare, Trophy, Sparkles, ArrowRight } from "lucide-react";
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const MAIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Practice Quiz",
    path: "/quiz",
    badge: 3,
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: "Subjects",
    path: "/subjects",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: "Performance",
    path: "/performance",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/settings",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const STUDY_NAV: NavItem[] = [
  {
    label: "Mock Exams",
    path: "/mock-exams",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Past Questions",
    path: "/past-questions",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "Study Groups",
    path: "/study-groups",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },

  {
    label: "Chat with Mentor",
    path: "/mentor", // New Link added here
    icon: <MessageSquare size={16} strokeWidth={1.8} />,
    badge: 1,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { name, streak, isPro } = useUserStore();
  const navigate = useNavigate();
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-110 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-120 w-64 h-full lg:hidden",
          "bg-bgDeep border-r border-borderMuted",
          "flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-borderMuted">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-display font-black text-white text-base shadow-lg shadow-brand/40 shrink-0">
              J
            </div>
            <span className="font-display font-bold text-[17px] tracking-tight">
              JAMB<span className="text-brand-light">ify</span>
            </span>
          </div>
          {isPro && (
            <div className="bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-brand/20">
              Pro
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <NavSection label="Main" items={MAIN_NAV} onNavigate={onClose} />
          <NavSection label="Study" items={STUDY_NAV} onNavigate={onClose} />

          {/* Pro Section Link */}
          <div className="mt-6 pt-4 border-t border-borderMuted/30">
            {!isPro ? (
              <NavLink
                to="/pro"
                onClick={onClose}
                className="flex flex-col gap-2 p-3.5 rounded-2xl bg-linear-to-br from-brand/10 to-brand/5 border border-brand/20 text-brand-light hover:border-brand/40 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform text-brand" />
                  <span className="text-[13px] font-black uppercase tracking-wider">
                    JAMBIFY Pro
                  </span>
                </div>
                <p className="text-[11px] text-textDim leading-tight">
                  Unlock AI Tutor, offline mode, and professional mock review.
                </p>
                <div className="mt-1 text-[10px] font-bold text-brand-light flex items-center gap-1">
                  Upgrade Now <ArrowRight size={10} />
                </div>
              </NavLink>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-success/5 border border-success/10 text-success shadow-inner">
                <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[12px] font-black uppercase tracking-wider block">
                    Pro Member
                  </span>
                  <span className="text-[10px] text-success/70 font-medium italic">
                    Premium access active
                  </span>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-borderMuted p-3">
          <button
            onClick={() => {
              navigate("/settings");
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-brand hover:bg-bgSurface transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-display text-xs font-bold text-white shrink-0 relative">
              {initials}
              {isPro && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand border-2 border-bgDeep rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-[11px] text-textDim">
                {isPro ? "Pro Member" : "Free Tier"} · 🔥 {streak} day streak
              </p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-textDim shrink-0"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};

/** Reusable nav section with label + items */
const NavSection: React.FC<{
  label: string;
  items: NavItem[];
  onNavigate: () => void;
}> = ({ label, items, onNavigate }) => (
  <div>
    <p className="text-[10px] uppercase tracking-widest text-textDim font-medium px-3 mb-1.5">
      {label}
    </p>
    {items.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/"}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-brand text-sm mb-0.5 transition-all",
            isActive
              ? "bg-brand/10 text-brand-light font-medium"
              : "text-textMuted hover:bg-bgSurface hover:text-textMain",
          )
        }
      >
        <span className="shrink-0">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.badge != null && (
          <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
            {/* {item.badge} */}
          </span>
        )}
      </NavLink>
    ))}
  </div>
);

export default Sidebar;
