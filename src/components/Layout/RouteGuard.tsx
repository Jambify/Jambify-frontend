// src/components/Layout/RouteGuard.tsx
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../../Store/useUserStore";
import { supabase } from "../../lib/supabase";

// ── Route categories ──────────────────────────────────────────────────────────
// Public: no auth needed at all
const PUBLIC_ROUTES = ["/signin", "/signup", "/verify", "/guest"];

// Semi-protected: auth required but onboarding check is SKIPPED.
// /onboarding and /welcome MUST be here — they render between
// "just signed up" and "fully onboarded" states.
// If they're NOT here, the guard creates a redirect loop:
//   isAuthenticated=true + onboardingComplete=false → redirect to /onboarding
//   /onboarding renders → guard fires again → redirect to /onboarding → ∞
const SEMI_PROTECTED = ["/onboarding", "/welcome"];

const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  const hasSeenWelcome = useUserStore((s) => s.hasSeenWelcome);
  const syncProfile = useUserStore((s) => s.syncProfile);

  // isInitialising starts TRUE so we NEVER render a redirect before we've
  // confirmed the Supabase session. Without this, a page refresh on /dashboard
  // shows isAuthenticated=false for one frame and flashes the signin page.
  const [isInitialising, setIsInitialising] = useState(true);
  const hasSynced = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (hasSynced.current) return;
      hasSynced.current = true;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Restore identity BEFORE syncProfile so syncProfile can read the id
          useUserStore.setState({
            isAuthenticated: true,
            id: session.user.id,
            email: session.user.email ?? "",
          });

          // force=true bypasses the 5-second cache so we always get fresh
          // onboarding_complete from DB, even if the user just signed out
          // and signed back in (signOut resets Zustand to DEFAULTS)
          await syncProfile(true);
        }
      } catch (err) {
        console.error("[RouteGuard] init error:", err);
      } finally {
        // Only NOW allow the guard to make redirect decisions
        setIsInitialising(false);
      }
    };

    init();
  }, []); // runs exactly once per mount

  // ── Spinner while initialising ────────────────────────────────────────────
  // Typically 200–500 ms (one Supabase round-trip + one DB query).
  // Keeps ANY redirect decision from firing until we have real state.
  if (isInitialising) {
    return (
      <div className="bg-bgMain flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-brand mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-textDim text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Routing decisions (sync is complete, state is authoritative) ──────────

  // 1. Public routes — always accessible, no auth check
  // EXCEPT: If user is fully onboarded and has seen welcome, redirect away from signin/signup
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (
      isAuthenticated &&
      onboardingComplete &&
      hasSeenWelcome &&
      (pathname === "/signin" || pathname === "/signup")
    ) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // 2. Not authenticated → send to sign-in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // 3. Onboarding & welcome — auth required but onboarding/welcome check skipped
  if (SEMI_PROTECTED.some((r) => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // 4. Authenticated but onboarding not finished → send to onboarding
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // 5. Authenticated and onboarding finished but haven't seen welcome → send to welcome
  if (!hasSeenWelcome) {
    return <Navigate to="/welcome" replace />;
  }

  // 6. Fully authenticated, onboarded, and seen welcome — allow
  return <>{children}</>;
};

export default RouteGuard;
