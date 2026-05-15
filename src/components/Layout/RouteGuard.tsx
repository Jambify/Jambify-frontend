/**
 * THE FLASH BUG EXPLAINED:
 *
 * After signOut(), DEFAULTS resets onboardingComplete → false.
 * When the user signs back in and navigates to '/', RouteGuard
 * renders BEFORE syncProfile() finishes. It sees:
 *   isAuthenticated = true
 *   onboardingComplete = false   ← still DEFAULTS
 * So it redirects → /onboarding for one frame. That's the flash.
 *
 * THE FIX:
 * Add an `isInitialising` state that is true while we're syncing
 * on first auth. Show a spinner during that window. Once sync
 * resolves, the correct onboardingComplete value is in Zustand
 * and the guard makes the right decision with no flash.
 *
 * KEY CHANGE vs your current code:
 * Your current guard only syncs when !onboardingComplete.
 * We must ALWAYS sync on first auth (just once), regardless
 * of what onboardingComplete currently says in Zustand —
 * because it might be stale from the previous signOut reset.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation }                from 'react-router-dom';
import { useUserStore }                          from '../../Store/UseUserStore';
import { supabase }                              from '../../lib/supabase';

const PUBLIC_ROUTES     = ['/signin', '/signup', '/verify', '/guest'];
const ONBOARDING_ROUTES = ['/onboarding', '/welcome'];

const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname }       = useLocation();
  const isAuthenticated    = useUserStore(s => s.isAuthenticated);
  const onboardingComplete = useUserStore(s => s.onboardingComplete);
  // const id                 = useUserStore(s => s.id);
  const syncProfile        = useUserStore(s => s.syncProfile);

  // True while we're doing the FIRST sync after auth.
  // Starts true so we NEVER render a redirect before sync completes.
  const [isInitialising, setIsInitialising] = useState(true);
  const hasSynced = useRef(false);

  useEffect(() => {
    // Always run once on mount to check the Supabase session.
    const init = async () => {
      if (hasSynced.current) return;
      hasSynced.current = true;

      try {
        // 1. Check if Supabase has a live session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // 2. Restore auth identity into Zustand
          useUserStore.setState({
            isAuthenticated: true,
            id:    session.user.id,
            email: session.user.email || '',
          });

          // 3. Force-sync profile so onboardingComplete is fresh from DB
          //    This is what prevents the flash — we wait for this
          //    before allowing any redirect decision.
          await syncProfile(true);
        }
      } finally {
        // 4. Only NOW let the guard make routing decisions
        setIsInitialising(false);
      }
    };

    init();
  }, []); // runs exactly once on app start / page refresh

  // ── Show spinner while initialising ─────────────────────────────────
  // This window is typically 200–500ms (one Supabase round-trip).
  // During this time we render NOTHING that could cause a flash redirect.
  if (isInitialising) {
    return (
      <div className="min-h-screen bg-bgMain flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-textDim text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Routing decisions (only reached after sync is done) ──────────────

  // 1. Public routes — always allow
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // 2. Not logged in → signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // 3. Onboarding / welcome — logged in is enough
  if (ONBOARDING_ROUTES.some(r => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // 4. Logged in but onboarding not done → onboarding
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // 5. All good
  return <>{children}</>;
};

export default RouteGuard;