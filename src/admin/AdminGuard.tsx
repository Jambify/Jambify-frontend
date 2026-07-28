/**
 * src/admin/AdminGuard.tsx
 * ─────────────────────────
 * Hard security gate for all /admin routes.
 *
 * CHANGED: previously checked the session email against a single
 * VITE_ADMIN_EMAIL env var — meaning only one person could ever be admin,
 * no matter what the `admin_users` table said. This version checks
 * `admin_users` directly (by the live session's user_id), so it agrees
 * with the RLS policies on `questions` / `question_reports` that already
 * gate on `public.is_admin(auth.uid())`.
 *
 * Requires admin_users_policies.sql to have been run — otherwise the
 * lookup query below will fail (blocked by RLS with no policies).
 *
 * Strategy:
 *   1. Read the Supabase session directly (never trusts Zustand / localStorage)
 *   2. Look up the session's user_id in admin_users
 *   3. If no row found → silent redirect to / (no error message that reveals
 *      the route exists)
 */

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "../lib/supabase";

type Status = "checking" | "authorised" | "denied";

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // Fetch the live session from Supabase — bypasses any client-side spoofing
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (sessionError || !session?.user) {
        setStatus("denied");
        return;
      }

      // Look the user up in admin_users. maybeSingle() returns null (not an
      // error) when no row matches, which is the expected case for non-admins.
      const { data: adminRow, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id, role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (adminError) {
        console.error("[AdminGuard] Error checking admin_users:", adminError);
        setStatus("denied");
        return;
      }

      setStatus(adminRow ? "authorised" : "denied");
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