import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../Store/UseUserStore';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps any page that requires onboarding to be complete.
 * If the user hasn't onboarded yet, redirects to /onboarding.
 * Once onboarding is done (persisted in localStorage),
 * this guard is transparent — never shown again.
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;