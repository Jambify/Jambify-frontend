import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../../Store/useUserStore";
import { useExamCountdown } from "../../hooks/useExamCountdown";
import Sidebar from "./Sidebar";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
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
      className={`flex items-center gap-3 p-2.5 rounded-brand cursor-pointer text-[13.5px] transition-all mb-0.5 group ${
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
        <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
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
    <div className="min-h-screen bg-bgMain text-textMain font-sans selection:bg-brand/30">
      {/* Network Status Toast */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-999 flex justify-center p-4 pointer-events-none"
          >
            <div className="network-banner-offline backdrop-blur-md px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-white/20">
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
            className="fixed top-0 inset-x-0 z-999 flex justify-center p-4 pointer-events-none"
          >
            <div className="network-banner-online backdrop-blur-md px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-white/20">
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
        <aside className="fixed left-0 top-0 bottom-0 w-60 bg-bgSurface border-r border-borderMuted flex-col z-100 hidden lg:flex">
          <div className="p-6 pb-4 flex items-center justify-between border-b border-borderMuted">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-display font-extrabold shadow-[0_8px_40px_rgba(91,59,255,0.3)]">
                J
              </div>
              <div className="font-display font-bold text-[17px] tracking-tight">
                JAMB<span className="text-brand-light">IFY</span>
              </div>
            </div>
            {isPro && (
              <div className="bg-brand/10 text-brand text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-brand/20">
                Pro
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            <section>
              <p className="text-[10px] tracking-widest uppercase text-textDim px-2 mb-2 font-medium">
                Main
              </p>
              <NavItem
                label="Dashboard"
                active={currentPage === "dashboard"}
                icon="grid"
                path="/"
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
              <p className="text-[10px] tracking-widest uppercase text-textDim px-2 mb-2 font-medium">
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
                  className="flex flex-col gap-2 p-3.5 rounded-2xl bg-linear-to-br from-brand/10 to-brand/5 border border-brand/20 text-brand-light hover:border-brand/40 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform text-brand" />
                    <span className="text-[12px] font-black uppercase tracking-wider">
                      JAMBIFY Pro
                    </span>
                  </div>
                  <p className="text-[10px] text-textDim leading-tight">
                    Unlock AI Tutor, offline mode, and professional mock review.
                  </p>
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-success/5 border border-success/10 text-success">
                  <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider block">
                      Pro Member
                    </span>
                    <span className="text-[9px] text-success/70 font-medium italic">
                      Premium access active
                    </span>
                  </div>
                </div>
              )}
            </section>
          </nav>

          <div className="p-4 border-t border-borderMuted">
            <Link
              to="/settings"
              className="flex items-center gap-3 p-2 hover:bg-bgCard rounded-brand cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-display text-xs font-bold text-white shadow-sm relative">
                {initials}
                {isPro && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand border-2 border-bgSurface rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-textDim">
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
          <header className="sticky top-0 z-50 h-14 bg-bgMain/85 backdrop-blur-md border-b border-borderMuted px-4 lg:px-7 flex items-center justify-between safe-area-top fixed-ios">
            <div className="flex items-center gap-3">
              {/* HAMBURGER (ONLY MOBILE) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-bgCard touch-target no-double-tap"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <h1 className="font-display font-semibold text-base">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h1>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <span className="text-xs text-textDim hidden sm:inline">
                Hi, {displayName.split(" ")[0]}!
              </span>
              {/* Dynamic Streak Badge */}
              <div className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium">
                🔥 {streak} day{streak !== 1 ? "s" : ""}
              </div>
              {/* Dynamic Countdown Badge - No more hardcoded 47d! */}
              <div className="bg-brand-dim text-brand-light border border-brand/20 px-2.5 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium">
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
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-100 bg-bgSurface/98 backdrop-blur-2xl border-t border-borderMuted/30 safe-area-bottom shadow-nav">
          <nav className="flex items-center justify-around h-18 px-1 relative">
            <Link
              to="/"
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-90 touch-target no-double-tap"
              aria-label="Dashboard"
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-colors",
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
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-90 touch-target no-double-tap"
              aria-label="Subjects"
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-colors",
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
            <div className="flex-1 flex justify-center h-full relative">
              <Link
                to="/quiz"
                className="absolute -top-6 flex flex-col items-center gap-1 group"
                aria-label="Quiz"
              >
                <div className="bg-brand w-15 h-15 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_12px_30px_rgba(91,59,255,0.4)] transition-all group-hover:scale-105 group-active:scale-95 border-2 border-bgMain">
                  <FileText size={26} className="text-white -rotate-45" />
                </div>
                <span className="text-[10px] font-black text-brand-light mt-14 uppercase tracking-tighter">
                  Practice
                </span>
              </Link>
            </div>

            <Link
              to="/performance"
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-90 touch-target no-double-tap"
              aria-label="Performance"
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-colors",
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
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-90 touch-target no-double-tap"
              aria-label="Profile"
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-colors",
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
