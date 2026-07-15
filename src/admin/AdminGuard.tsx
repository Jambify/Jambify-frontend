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

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Status = "checking" | "authorised" | "denied";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      console.log("[AdminGuard] Checking admin access...");
      console.log("[AdminGuard] VITE_ADMIN_EMAIL from env:", ADMIN_EMAIL);

      // No admin email configured → deny immediately
      if (!ADMIN_EMAIL) {
        console.warn("[AdminGuard] No VITE_ADMIN_EMAIL set in env");
        if (!cancelled) setStatus("denied");
        return;
      }

      // Fetch the live session from Supabase — bypasses any client-side spoofing
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log("[AdminGuard] Session:", session);
      console.log("[AdminGuard] Session user:", session?.user);
      console.log("[AdminGuard] Session user email:", session?.user?.email);

      if (cancelled) return;

      if (error || !session?.user) {
        console.warn("[AdminGuard] No session or error:", error);
        setStatus("denied");
        return;
      }

      // Case-insensitive email comparison
      const match =
        session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      console.log("[AdminGuard] Email match:", match);
      setStatus(match ? "authorised" : "denied");
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="bg-bgMain flex min-h-screen items-center justify-center">
        <div className="border-brand h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (status === "denied") {
    // Silent redirect — don't reveal that an admin panel exists
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
