/**
 * src/admin/AdminLayout.tsx
 * ──────────────────────────
 * Shell layout for the admin panel.
 * Completely separate from AppLayout — no student UI bleeds in.
 *
 * NAV order changed to priority: things that need frequent/urgent attention
 * first, sensitive/occasional admin housekeeping last.
 *   1. Overview          — daily glance, entry point
 *   2. Flagged Reports    — time-sensitive, students are waiting
 *   3. Users              — day-to-day account management
 *   4. Question Bank      — content management
 *   5. AdminBroadcast     — occasional campaigns
 *   6. Admin Roles        — sensitive, infrequent
 *   7. Audit Log          — infrequent review/oversight
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { cn } from '../lib/utils/utils';
import {
  Users, BarChart2, ShieldAlert,
  Menu, X, Home, Clock, Megaphone,
  Database, AlertTriangle, UserCog,
} from 'lucide-react';
import schooldraLogo from "../assets/schooldraLogo.webp"

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const NAV = [
  { path: '/admin',                 label: 'Overview',        icon: BarChart2,     end: true },
  { path: '/admin/reports',         label: 'FlaggedReports',   icon: AlertTriangle, end: false },
  { path: '/admin/users',           label: 'Users',            icon: Users,         end: false },
  { path: '/admin/Adminquestions',  label: 'AdminQuestions',   icon: Database,      end: false },
  { path: '/admin/AdminBroadcast',  label: 'AdminBroadcast',   icon: Megaphone,     end: false },
  { path: '/admin/roles',           label: 'Admin Roles',      icon: UserCog,       end: false },
  { path: '/admin/audit-log',       label: 'Audit Log',        icon: Clock,         end: false },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navigate    = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bgMain text-textMain flex">

      {/* ── Mobile overlay ──────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={cn(
        'fixed top-0 left-0 bottom-0 z-50 w-60 flex flex-col',
        'bg-bgSurface border-r border-borderMuted',
        'transition-transform duration-300 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-borderMuted shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex cursor-pointer items-center gap-1">
                <img
                  src={schooldraLogo}
                  alt="Schooldra Logo"
                  className="h-8 w-8"
                />
                </div>
            <div className="font-display font-bold text-sm tracking-tight">
              Schooldra <span className="text-brand text-[10px] font-bold uppercase tracking-widest ml-1">Admin</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-textDim hover:text-textMain">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(({ path, label, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-brand text-sm transition-all',
                isActive
                  ? 'bg-brand/10 text-brand-light font-semibold'
                  : 'text-textMuted hover:bg-bgCard hover:text-textMain',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-borderMuted space-y-1 shrink-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-brand text-sm text-textMuted hover:bg-bgCard hover:text-textMain transition-all"
          >
            <Home className="w-4 h-4 shrink-0" />
            Back to App
          </button>
          <div className="flex items-center gap-2 px-3 py-2 text-[10px] text-textDim">
            <ShieldAlert className="w-3 h-3 shrink-0 text-warn" />
            Admin access only
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 bg-bgMain/90 backdrop-blur-md border-b border-borderMuted flex items-center px-4 lg:px-7 gap-3">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-brand hover:bg-bgSurface text-textMuted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-base tracking-tight flex-1">{title}</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-light" />
            <span className="text-[11px] font-bold text-brand-light uppercase tracking-widest">Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;