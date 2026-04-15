import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../../Store/UseUserStore";
import {
  LayoutGrid,
  FileText,
  BookOpen,
  Activity,
  Clock,
  Users,
  type LucideIcon,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
}

const IconMap: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  file: FileText,
  book: BookOpen,
  activity: Activity,
  clock: Clock,
  users: Users,
};

// Helper to get initials from name
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

const AppLayout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  // Accessing flat state properties directly from useUserStore
  const name = useUserStore((state) => state.name);
  const targetScore = useUserStore((state) => state.targetScore);
  
  const displayName = name || "Guest User";
  const initials = getInitials(displayName);

  return (
    <div className="flex min-h-screen bg-bgMain text-textMain font-body">
      {/* SIDEBAR */}
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
            <p className="text-[10px] tracking-widest uppercase text-textDim px-2 mb-2 font-medium">Main</p>
            <NavItem label="Dashboard" active={currentPage === "dashboard"} icon="grid" path="/" />
            <NavItem label="Practice Quiz" badge={3} icon="file" path="/quiz" />
            <NavItem label="Subjects" icon="book" path="/subjects" />
            <NavItem label="Performance" icon="activity" path="/performance" />
          </section>

          <section>
            <p className="text-[10px] tracking-widest uppercase text-textDim px-2 mb-2 font-medium">Study</p>
            <NavItem label="Mock Exams" icon="clock" path="/mock-exams" />
            <NavItem label="Study Groups" icon="users" path="/study-groups" />
          </section>
        </nav>

        {/* Dynamic User Profile Section */}
        <div className="p-4 border-t border-borderMuted">
          <div className="flex items-center gap-3 p-2 hover:bg-bgCard rounded-brand cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-display text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate">{displayName}</div>
              <div className="text-[11px] text-textDim">
                {targetScore ? `Target: ${targetScore}` : "Pro Plan · 🔥 14 days"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-50 h-14 bg-bgMain/85 backdrop-blur-md border-b border-borderMuted px-7 flex items-center justify-between">
          <h1 className="font-display font-semibold text-base">
            {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
          </h1>
          <div className="flex items-center gap-3">
             <span className="text-xs text-textDim hidden sm:inline">Hi, {displayName.split(' ')[0]}!</span>
            <div className="bg-warn-dim text-warn border border-warn/20 px-3 py-1 rounded-full text-xs font-medium">
              🔥 14-day streak
            </div>
            <div className="bg-brand-dim text-brand-light border border-brand/20 px-3 py-1 rounded-full text-xs font-medium">
              ⏳ 47 days to exam
            </div>
          </div>
        </header>

        <div className="p-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bgSurface border-t border-borderMuted px-6 py-3 flex items-center justify-between lg:hidden z-100">
        <Link to="/" className="flex flex-col items-center gap-1">
          <LayoutGrid
            size={30}
            className={currentPage === "dashboard" ? "text-brand-light" : "text-textDim"}
          />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        <Link to="/subjects" className="flex flex-col items-center gap-1">
          <BookOpen
            size={30}
            className={currentPage === "subjects" ? "text-brand-light" : "text-textDim"}
          />
          <span className="text-[10px] font-medium">Subjects</span>
        </Link>

        <Link to="/quiz" className="flex flex-col items-center gap-1">
          <div className="bg-brand p-2 rounded-full -mt-8 shadow-lg">
            <FileText size={30} className="text-white" />
          </div>
          <span className="text-[10px] font-medium">Quiz</span>
        </Link>

        <Link to="/performance" className="flex flex-col items-center gap-1">
          <Activity
            size={30}
            className={currentPage === "performance" ? "text-brand-light" : "text-textDim"}
          />
          <span className="text-[10px] font-medium">Stats</span>
        </Link>

        <Link to="/mock-exams" className="flex flex-col items-center gap-1">
          <Clock
            size={30}
            className={currentPage === "mock-exams" ? "text-brand-light" : "text-textDim"}
          />
          <span className="text-[10px] font-medium">Mocks</span>
        </Link>
      </nav>
    </div>
  );
};

export default AppLayout;