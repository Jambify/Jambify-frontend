import React from "react";
import { useLocation } from "react-router";
import { useUserStore } from "../../Store/useUserStore";
import { useExamCountdown } from "../../hooks/useExamCountdown";
import ThemeToggle from "../ui/ThemeToggle";
import { Flame, Clock, Bell } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/quiz": "Practice Quiz",
  "/subjects": "Subjects",
  "/performance": "Performance",
  "/mock-exams": "Mock Exams",
  "/past-questions": "Past Questions",
  "/study-groups": "Study Groups",
  "/settings": "Settings",
};

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const { streak } = useUserStore();
  const { daysLeft } = useExamCountdown();

  const title = PAGE_TITLES[pathname] ?? "JAMBReady";

  return (
    <header className="border-borderMuted bg-bgCard/80 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="rounded-brand hover:bg-bgSurface text-textMuted flex h-10 w-10 items-center justify-center transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="16" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="font-display hidden text-[16px] font-bold tracking-tight sm:block md:text-[18px]">
          {title}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
        {/* Streak pill */}
        <div className="bg-warn/12 border-warn/20 group hover:bg-warn/20 flex shrink-0 items-center gap-1.5 rounded-2xl border px-2 py-1 transition-all sm:px-3 sm:py-1.5">
          <div className="bg-warn/20 flex h-7 w-7 items-center justify-center rounded-xl shadow-inner sm:h-8 sm:w-8">
            <Flame className="text-warn h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-textMain text-[12px] font-black tracking-tight sm:text-[14px]">
              {streak}
            </span>
            <span className="text-textDim text-[8px] font-bold tracking-wider uppercase">
              Streak
            </span>
          </div>
        </div>

        {/* Exam countdown pill */}
        <div className="bg-brand/14 border-brand/20 group hover:bg-brand/20 flex shrink-0 items-center gap-1.5 rounded-2xl border px-2 py-1 transition-all sm:px-3 sm:py-1.5">
          <div className="bg-brand/20 flex h-7 w-7 items-center justify-center rounded-xl shadow-inner sm:h-8 sm:w-8">
            <Clock className="text-brand-light h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-textMain text-[12px] font-black tracking-tight sm:text-[14px]">
              {daysLeft}
            </span>
            <span className="text-textDim text-[8px] font-bold tracking-wider uppercase">
              Days
            </span>
          </div>
        </div>

        <div className="bg-borderMuted/40 mx-0.5 h-8 w-px sm:mx-1" />

        {/* Notifications */}
        <button
          className="rounded-brand border-borderMuted hover:bg-bgSurface text-textMuted hover:text-textMain flex h-9 w-9 items-center justify-center border transition-colors sm:h-10 sm:w-10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Theme toggle */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
