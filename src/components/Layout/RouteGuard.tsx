import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../Store/UseUserStore';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  const isLoading = useUserStore((s) => s.isLoading);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgMain flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, go to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If authenticated but onboarding not complete, go to onboarding
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // User is fully authenticated and onboarded
  return <>{children}</>;
};

export default RouteGuard;