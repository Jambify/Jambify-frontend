import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../Store/UseUserStore';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps any page that requires authentication and onboarding to be complete.
 * User flow:
 * 1. New user -> /signup (no email in store)
 * 2. After signup -> /onboarding (email exists but onboarding not complete)
 * 3. After onboarding -> protected routes
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const email = useUserStore((s) => s.email);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);

  // If no email, user needs to sign up first
  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  // If email exists but onboarding not complete, redirect to onboarding
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // User is fully authenticated and onboarded
  return <>{children}</>;
};

export default RouteGuard;