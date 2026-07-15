/**
 * src/admin/AdminGuard.tsx
 * ─────────────────────────
 * Hard security gate for all /admin routes.
 *
 * Strategy:
 *   1. Read the Supabase session directly (never trusts Zustand / localStorage)
 *   2. Compare the session email against VITE_ADMIN_EMAIL env var
 *   3. If no match → silent redirect to / (no error message that reveals the route exists)
 *
 * To set your admin email:
 *   Add VITE_ADMIN_EMAIL=your@email.com to your .env file
 *   Restart the dev server
 *
 * NEVER hardcode an email here. Always use the env var.
 */

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Status = 'checking' | 'authorised' | 'denied';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // No admin email configured → deny immediately
      if (!ADMIN_EMAIL) {
        if (!cancelled) setStatus('denied');
        return;
      }

      // Fetch the live session from Supabase — bypasses any client-side spoofing
      const { data: { session }, error } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error || !session?.user) {
        setStatus('denied');
        return;
      }

      // Case-insensitive email comparison
      const match = session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      setStatus(match ? 'authorised' : 'denied');
    }

    check();
    return () => { cancelled = true; };
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-bgMain flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status === 'denied') {
    // Silent redirect — don't reveal that an admin panel exists
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
