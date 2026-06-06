// src/components/Layout/WelcomeGuard.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../../Store/useUserStore";

interface WelcomeGuardProps {
  children: React.ReactNode;
}

const WelcomeGuard: React.FC<WelcomeGuardProps> = ({ children }) => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  const isLoading = useUserStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="bg-bgMain flex min-h-screen items-center justify-center">
        <div className="text-center text-white">
          <div className="border-brand mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → go to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // User has already completed onboarding → welcome page not needed
  if (onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  // New user who just completed onboarding → show welcome page
  return <>{children}</>;
};

export default WelcomeGuard;
