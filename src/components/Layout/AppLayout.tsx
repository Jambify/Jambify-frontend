import React, { type ReactNode } from "react";
import { Link } from "react-router";
import { useUserStore } from "../../Store/useUserStore";
import { useExamCountdown } from "../../hooks/useExamCountdown";
import Sidebar from "./Sidebar";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import schooldraLogo from "../../assets/schooldraLogo.webp";
import AnnouncementBanner from "../ui/AnnouncementBanner";
import {
  LayoutGrid,
  FileText,
  BookOpen,
  Activity,
  Clock,
  Users,
  Menu,
  type LucideIcon,
  Settings,
  WifiOff,
  Wifi,
  Trophy,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils/utils";
import ThemeToggle from "../ui/ThemeToggle";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
  hideSidebar?: boolean;
  className?: string;
}

const IconMap: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  file: FileText,
  book: BookOpen,
  activity: Activity,
  clock: Clock,
  users: Users,
  settings: Settings,
};

const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const NavItem = ({ label, active, badge, icon, path }: any) => {
  const IconComponent = IconMap[icon] || LayoutGrid;
  return (
    <Link
      to={path}
      className={`rounded-brand group mb-0.5 flex cursor-pointer items-center gap-3 p-2.5 text-[13.5px] transition-all ${
        active
          ? "bg-brand-dim text-brand-light font-medium"
          : "text-textMuted hover:bg-bgCard hover:text-textMain"
      }`}
    >
      <IconComponent
        size={18}
        className={`opacity-70 group-hover:opacity-100 ${active ? "opacity-100" : ""}`}
      />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-brand min-w-4.5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
};

const AppLayout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  isSidebarOpen = false,
  setIsSidebarOpen = () => {},
  hideSidebar = false,
  className,
}) => {
  const name = useUserStore((state) => state.name);
  const targetScore = useUserStore((state) => state.targetScore);
  const streak = useUserStore((state) => state.streak);
  const isPro = useUserStore((state) => state.isPro);
  const { daysLeft } = useExamCountdown(); // ← Dynamic countdown
  const { isOnline, wasOffline } = useNetworkStatus();

  const displayName = name || "Guest User";
  const initials = getInitials(displayName);

  return (
    <div className="bg-bgMain text-textMain selection:bg-brand/30 min-h-screen font-sans">
      <div className=" lg:pt-5 lg:pl-64">
        <AnnouncementBanner />
      </div>

      {/* Network Status Toast */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-999 flex justify-center p-4"
          >
            <div className="network-banner-offline flex items-center gap-3 rounded-full border border-white/20 px-6 py-2.5 shadow-2xl backdrop-blur-md">
              <WifiOff size={18} className="animate-pulse text-white" />
              <span className="text-sm font-bold tracking-tight text-white">
                You are offline. Some features may be limited.
              </span>
            </div>
          </motion.div>
        )}
        {wasOffline && isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-999 flex justify-center p-4"
          >
            <div className="network-banner-online flex items-center gap-3 rounded-full border border-white/20 px-6 py-2.5 shadow-2xl backdrop-blur-md">
              <Wifi size={18} className="text-white" />
              <span className="text-sm font-bold tracking-tight text-white">
                Back online! Syncing your progress...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* MOBILE SIDEBAR (Drawer) */}
      {!hideSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      {!hideSidebar && (
        <aside className="bg-bgSurface border-borderMuted fixed top-0 bottom-0 left-0 z-100 hidden w-60 flex-col border-r lg:flex">
          <div className="border-borderMuted flex items-center justify-between border-b p-6 pb-4">
            <a href="/dashboard">
              <div className="flex cursor-pointer items-center gap-1">
                <img
                  src={schooldraLogo}
                  alt="Schooldra Logo"
                  className="h-8 w-8"
                />
                <span className="text-brand-light text-lg font-black tracking-wider">
                  Schooldra
                </span>
              </div>
            </a>
            {isPro && (
              <div className="bg-brand/10 text-brand border-brand/20 rounded border px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase">
                Pro
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto p-3">
            <section>
              <p className="text-textDim mb-2 px-2 text-[10px] font-medium tracking-widest uppercase">
                Main
              </p>
              <NavItem
                label="Dashboard"
                active={currentPage === "dashboard"}
                icon="grid"
                path="/dashboard"
              />
              <NavItem
                label="Practice Quiz"
                badge={3}
                icon="file"
                path="/quiz"
              />
              <NavItem label="Subjects" icon="book" path="/subjects" />
              <NavItem
                label="Performance"
                icon="activity"
                path="/performance"
              />
              <NavItem label="Settings" icon="settings" path="/settings" />
            </section>

            <section>
              <p className="text-textDim mb-2 px-2 text-[10px] font-medium tracking-widest uppercase">
                Study
              </p>
              <NavItem label="Mock Exams" icon="clock" path="/mock-exams" />
              <NavItem label="Study Groups" icon="users" path="/study-groups" />
              <NavItem
                label="Past Questions"
                icon="settings"
                path="/past-questions"
              />
            </section>

            {/* Pro Upgrade / Status Card */}
            <section className="px-2 pt-2">
              {!isPro ? (
                <Link
                  to="/pro"
                  className="from-brand/10 to-brand/5 border-brand/20 text-brand-light hover:border-brand/40 group flex flex-col gap-2 rounded-2xl border bg-linear-to-br p-3.5 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-brand h-4 w-4 transition-transform group-hover:rotate-12" />
                    <span className="text-[12px] font-black tracking-wider uppercase">
                      Schooldra Pro
                    </span>
                  </div>
                  <p className="text-textDim text-[10px] leading-tight">
                    Unlock AI Tutor, offline mode, and professional mock review.
                  </p>
                </Link>
              ) : (
                <div className="bg-success/5 border-success/10 text-success flex items-center gap-3 rounded-2xl border p-3.5">
                  <div className="bg-success/10 flex h-8 w-8 items-center justify-center rounded-xl">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-black tracking-wider uppercase">
                      Pro Member
                    </span>
                    <span className="text-success/70 text-[9px] font-medium italic">
                      Premium access active
                    </span>
                  </div>
                </div>
              )}
            </section>
          </nav>

          <div className="border-borderMuted border-t p-4">
            <Link
              to="/settings"
              className="hover:bg-bgCard rounded-brand flex cursor-pointer items-center gap-3 p-2 transition-colors"
            >
              <div className="bg-brand font-display relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm">
                {initials}
                {isPro && (
                  <div className="bg-brand border-bgSurface absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2">
                    <div className="h-1 w-1 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <div className="truncate text-sm font-medium">
                  {displayName}
                </div>
                <div className="text-textDim text-[11px]">
                  {isPro
                    ? "Pro Active"
                    : targetScore
                      ? `Target: ${targetScore}`
                      : `${streak} day streak`}
                </div>
              </div>
            </Link>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={cn("flex-1 pb-24 lg:pb-0", !hideSidebar && "lg:ml-60")}>
        {!hideSidebar && (
          <header className="bg-bgMain/85 border-borderMuted safe-area-top fixed-ios sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md lg:px-7">
            <div className="flex items-center gap-3">
              {/* HAMBURGER (ONLY MOBILE) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hover:bg-bgCard touch-target no-double-tap rounded-md p-2 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <h1 className="font-display text-base font-semibold">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h1>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <span className="text-textDim hidden text-xs sm:inline">
                Hi, {displayName.split(" ")[0]}!
              </span>
              {/* Dynamic Streak Badge */}
              <div className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-medium text-orange-400 lg:px-3 lg:text-xs">
                🔥 {streak} day{streak !== 1 ? "s" : ""}
              </div>
              {/* Dynamic Countdown Badge - No more hardcoded 47d! */}
              <div className="bg-brand-dim text-brand-light border-brand/20 rounded-full border px-2.5 py-1 text-[10px] font-medium lg:px-3 lg:text-xs">
                ⏳ {daysLeft} day{daysLeft !== 1 ? "s" : ""}
              </div>
              <ThemeToggle />
            </div>
          </header>
        )}

        <div
          className={cn(
            "animate-in fade-in slide-in-from-bottom-2 duration-300",
            !hideSidebar ? "p-4 lg:p-7" : "p-0",
            className,
          )}
        >
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      {!hideSidebar && (
        <div className="bg-bgSurface/98 border-borderMuted/30 safe-area-bottom shadow-nav fixed right-0 bottom-0 left-0 z-100 border-t backdrop-blur-2xl lg:hidden">
          <nav className="relative flex h-18 items-center justify-around px-1">
            <Link
              to="/dashboard"
              className="touch-target no-double-tap flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label="Dashboard"
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-colors",
                  currentPage === "dashboard" ? "bg-brand/10" : "",
                )}
              >
                <LayoutGrid
                  size={24}
                  strokeWidth={currentPage === "dashboard" ? 2.5 : 2}
                  className={
                    currentPage === "dashboard"
                      ? "text-brand-light"
                      : "text-textDim"
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  currentPage === "dashboard"
                    ? "text-brand-light"
                    : "text-textDim/70",
                )}
              >
                Home
              </span>
            </Link>

            <Link
              to="/subjects"
              className="touch-target no-double-tap flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label="Subjects"
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-colors",
                  currentPage === "subjects" ? "bg-brand/10" : "",
                )}
              >
                <BookOpen
                  size={24}
                  strokeWidth={currentPage === "subjects" ? 2.5 : 2}
                  className={
                    currentPage === "subjects"
                      ? "text-brand-light"
                      : "text-textDim"
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  currentPage === "subjects"
                    ? "text-brand-light"
                    : "text-textDim/70",
                )}
              >
                Subjects
              </span>
            </Link>

            {/* Prominent Center Action */}
            <div className="relative flex h-full flex-1 justify-center">
              <Link
                to="/quiz"
                className="group absolute -top-6 flex flex-col items-center gap-1"
                aria-label="Quiz"
              >
                <div className="bg-brand border-bgCard dark:border-bgMain flex h-15 w-15 rotate-45 items-center justify-center rounded-2xl border-2 shadow-[0_12px_30px_rgba(91,59,255,0.4)] transition-all group-hover:scale-105 group-active:scale-95">
                  <FileText size={26} className="-rotate-45 text-white" />
                </div>
                <span className="text-brand-light mt-14 text-[10px] font-black tracking-tighter uppercase">
                  Practice
                </span>
              </Link>
            </div>

            <Link
              to="/performance"
              className="touch-target no-double-tap flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label="Performance"
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-colors",
                  currentPage === "performance" ? "bg-brand/10" : "",
                )}
              >
                <Activity
                  size={24}
                  strokeWidth={currentPage === "performance" ? 2.5 : 2}
                  className={
                    currentPage === "performance"
                      ? "text-brand-light"
                      : "text-textDim"
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  currentPage === "performance"
                    ? "text-brand-light"
                    : "text-textDim/70",
                )}
              >
                Stats
              </span>
            </Link>

            <Link
              to="/settings"
              className="touch-target no-double-tap flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label="Profile"
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-colors",
                  currentPage === "settings" ? "bg-brand/10" : "",
                )}
              >
                <Settings
                  size={24}
                  strokeWidth={currentPage === "settings" ? 2.5 : 2}
                  className={
                    currentPage === "settings"
                      ? "text-brand-light"
                      : "text-textDim"
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  currentPage === "settings"
                    ? "text-brand-light"
                    : "text-textDim/70",
                )}
              >
                Profile
              </span>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
