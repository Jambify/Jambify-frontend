import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../../Store/UseUserStore";
import Sidebar from "./Sidebar";
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
} from "lucide-react";
import { cn } from "../../lib/utils";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const IconMap: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  file: FileText,
  book: BookOpen,
  activity: Activity,
  clock: Clock,
  users: Users,
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
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const name = useUserStore((state) => state.name);
  const targetScore = useUserStore((state) => state.targetScore);

  const displayName = name || "Guest User";
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-bgMain text-white font-sans selection:bg-brand/30">
      {/* MOBILE SIDEBAR (Drawer) - Dark Theme */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* DESKTOP SIDEBAR - Inline with separate color theme */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-bgSurface border-r border-borderMuted flex-col z-100 hidden lg:flex">
        <div className="p-6 pb-4 flex items-center gap-3 border-b border-borderMuted">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-display font-extrabold shadow-[0_8px_40px_rgba(91,59,255,0.3)]">
            J
          </div>
          <div className="font-display font-bold text-[17px] tracking-tight">
            JAMB<span className="text-brand-light">IFY</span>
          </div>
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
            <NavItem label="Practice Quiz" badge={3} icon="file" path="/quiz" />
            <NavItem label="Subjects" icon="book" path="/subjects" />
            <NavItem label="Performance" icon="activity" path="/performance" />
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
        </nav>

        <div className="p-4 border-t border-borderMuted">
          <Link
            to="/settings"
            className="flex items-center gap-3 p-2 hover:bg-bgCard rounded-brand cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-display text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate">{displayName}</div>
              <div className="text-[11px] text-textDim">
                {targetScore
                  ? `Target: ${targetScore}`
                  : "Pro Plan · 🔥 14 days"}
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-60 pb-24 lg:pb-0">
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
            <div className="bg-warn-dim text-warn border border-warn/20 px-2.5 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium">
              🔥 14d
            </div>
            <div className="bg-brand-dim text-brand-light border border-brand/20 px-2.5 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium">
              ⏳ 47d
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION - Professional App Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-100 bg-bgSurface/98 backdrop-blur-2xl border-t border-white/5 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
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
            aria-label="Settings"
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
    </div>
  );
};

export default AppLayout;
