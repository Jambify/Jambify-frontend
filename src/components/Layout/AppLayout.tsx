import React, { type ReactNode } from "react";
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

// 1. Move the Icon Map to the top level
const IconMap: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  file: FileText,
  book: BookOpen,
  activity: Activity,
  clock: Clock,
  users: Users,
};

// 2. Standalone NavItem Component
const NavItem = ({
  label,
  active,
  badge,
  icon,
}: {
  label: string;
  active?: boolean;
  badge?: number;
  icon: string;
}) => {
  const IconComponent = IconMap[icon] || LayoutGrid;

  return (
    <div
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
        <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </div>
  );
};

// 3. Main Layout Component
const AppLayout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  return (
    <div className="flex min-h-screen bg-bgMain text-textMain font-body">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-bgSurface border-r border-borderMuted flex flex-col z-[100] hidden lg:flex">
        <div className="p-6 pb-4 flex items-center gap-3 border-b border-borderMuted">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-display font-extrabold shadow-[0_8px_40px_rgba(91,59,255,0.3)]">
            J
          </div>
          <div className="font-display font-bold text-[17px] tracking-tight">
            JAMB<span className="text-brand-light">Ready</span>
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
            />
            <NavItem label="Practice Quiz" badge={3} icon="file" />
            <NavItem label="Subjects" icon="book" />
            <NavItem label="Performance" icon="activity" />
          </section>

          <section>
            <p className="text-[10px] tracking-widest uppercase text-textDim px-2 mb-2 font-medium">
              Study
            </p>
            <NavItem label="Mock Exams" icon="clock" />
            <NavItem label="Study Groups" icon="users" />
          </section>
        </nav>

        <div className="p-4 border-t border-borderMuted">
          <div className="flex items-center gap-3 p-2 hover:bg-bgCard rounded-brand cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-display text-xs font-bold">
              AO
            </div>
            <div>
              <div className="text-sm font-medium">Adeola Okafor</div>
              <div className="text-[11px] text-textDim">
                Pro Plan · 🔥 14 days
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
    </div>
  );
};

export default AppLayout;
