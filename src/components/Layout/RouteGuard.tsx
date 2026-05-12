// RouteGuard.tsx - Fixed version
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../Store/UseUserStore';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  const isLoading = useUserStore((s) => s.isLoading);
  const id = useUserStore((s) => s.id);
  const syncProfile = useUserStore((s) => s.syncProfile);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasSynced = useRef(false);
  
  const { pathname } = useLocation();
  const PUBLIC_ROUTES = ['/signin', '/signup', '/verify'];
  const ONBOARDING_ROUTES = ['/onboarding', '/welcome'];

  // FIX: Only sync once when authenticated and profile not loaded
  useEffect(() => {
    if (isAuthenticated && id && !hasSynced.current && !onboardingComplete) {
      hasSynced.current = true;
      setIsSyncing(true);
      syncProfile().finally(() => setIsSyncing(false));
    }
  }, [isAuthenticated, id, onboardingComplete, syncProfile]);

  // Show loader during initial sync or loading
  if (isLoading || isSyncing) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes - allow access
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // Not authenticated → sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Onboarding/welcome routes - allow access
  if (ONBOARDING_ROUTES.some(r => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // Authenticated but onboarding not complete → onboarding
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // Fully authenticated and onboarded
  return <>{children}</>;
};

export default RouteGuard;