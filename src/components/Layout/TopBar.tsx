import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUserStore } from '../../Store/UseUserStore';

const PAGE_TITLES: Record<string, string> = {
  '/':               'Dashboard',
  '/quiz':           'Practice Quiz',
  '/subjects':       'Subjects',
  '/performance':    'Performance',
  '/mock':           'Mock Exams',
  '/past-questions': 'Past Questions',
  '/groups':         'Study Groups',
  '/settings':       'Settings',
};

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const { streak, daysToExam, examDate } = useUserStore();
  const title = PAGE_TITLES[pathname] ?? 'JAMBReady';

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-5 border-b border-borderMuted bg-bg/80 backdrop-blur-md">

      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-brand hover:bg-bgSurface transition-colors text-textMuted"
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <h1 className="font-display font-semibold text-[15px] tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Streak pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-warn/10 border border-warn/20 text-warn text-xs font-medium px-3 py-1.5 rounded-full">
          🔥 {streak}-day streak
        </div>

        {/* Exam countdown pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand-light text-xs font-medium px-3 py-1.5 rounded-full">
          ⏳ {daysToExam} days · {examDate}
        </div>

        {/* Notifications */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-brand border border-borderMuted hover:bg-bgSurface transition-colors text-textMuted hover:text-textMain"
          aria-label="Notifications"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>

    </header>
  );
};

export default Topbar;