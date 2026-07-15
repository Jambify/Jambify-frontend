/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   src/App.tsx — fixed duplicate /privacy-policy route conflict
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Landing from "./Pages/LandingPage";
import Quiz from "./Pages/Quiz";
import Performance from "./Pages/Performance";
import Subjects from "./Pages/Subjects";
import MockExam from "./Pages/MockExam/MockExam";
import Onboarding from "./Pages/OnBoarding";
import SignUp from "./Pages/Authentication/SignUp";
import SignIn from "./Pages/Authentication/SignIn";
import Welcome from "./Pages/Welcome";
import Settings from "./Pages/Settings";
import RouteGuard from "./components/Layout/RouteGuard";
import StudyGroups from "./Pages/StudyGroups";
import MentorChat from "./Pages/MentorChat";
import PastQuestions from "./Pages/PastQuestions";
import ReviewScreen from "./Pages/MockExam/ReviewExam";
import ProPage from "./Pages/Pro";
import AuthCallback from "./components/auth/AuthCallback";
import GuestLanding from "./Pages/GuestUser/GuestLanding";
import GuestQuiz from "./Pages/GuestUser/GuestQuiz";
import GuestMock from "./Pages/GuestUser/GuestExam";
import StudyTimeTracker from "./components/StudyTimeTracker";
import AuthErrorBoundary from "./components/ui/AuthErrorBoundary";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import GuestPrivacyPolicy from "./Pages/GuestUser/GuestPrivacy";
import GuestTermsOfService from "./Pages/GuestUser/GuestLegal";
import TermsOfService from "./Pages/TermsOfService";
import { supabase } from "./lib/supabase";

// Make supabase available in console for debugging
if (typeof window !== "undefined") {
  (window as any).supabase = supabase;
}

const App: React.FC = () => {
  return (
    <AuthErrorBoundary>
      <StudyTimeTracker />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/guest" element={<GuestLanding />} />
        <Route path="/guest/quiz" element={<GuestQuiz />} />
        <Route path="/guest/mock" element={<GuestMock />} />
        <Route path="/guest/past-questions" element={<GuestQuiz />} />

        {/* Public, unauthenticated legal pages — used by Landing/Guest footers */}
        <Route
          path="/guest/privacy-policy"
          element={
            <GuestPrivacyPolicy
              // // title="Privacy Policy"
              // effectiveDate="July 14, 2026"
              // blocks={[]}
            />
          }
        />
        <Route
          path="/guest/terms-of-service"
          element={
            <GuestTermsOfService
              title="Terms of Service"
              effectiveDate="July 14, 2026"
              blocks={[]}
            />
          }
        />

        <Route
          path="/onboarding"
          element={
            <RouteGuard>
              <Onboarding />
            </RouteGuard>
          }
        />
        <Route
          path="/welcome"
          element={
            <RouteGuard>
              <Welcome />
            </RouteGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RouteGuard>
              <Dashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/quiz"
          element={
            <RouteGuard>
              <Quiz />
            </RouteGuard>
          }
        />
        <Route
          path="/performance"
          element={
            <RouteGuard>
              <Performance />
            </RouteGuard>
          }
        />
        <Route
          path="/subjects"
          element={
            <RouteGuard>
              <Subjects />
            </RouteGuard>
          }
        />
        <Route
          path="/mock-exams"
          element={
            <RouteGuard>
              <MockExam />
            </RouteGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <RouteGuard>
              <Settings />
            </RouteGuard>
          }
        />
        <Route
          path="/study-groups"
          element={
            <RouteGuard>
              <StudyGroups />
            </RouteGuard>
          }
        />
        {/* chat with our mentor */}
        <Route
          path="/mentor"
          element={
            <RouteGuard>
              <MentorChat />
            </RouteGuard>
          }
        />
        <Route
          path="/past-questions"
          element={
            <RouteGuard>
              <PastQuestions />
            </RouteGuard>
          }
        />

        {/* Authenticated-only legal pages (logged-in account area) */}
        <Route
          path="/privacy-policy"
          element={
            <RouteGuard>
              <PrivacyPolicy />
            </RouteGuard>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <RouteGuard>
              <TermsOfService />
            </RouteGuard>
          }
        />

        <Route
          path="/pro"
          element={
            <RouteGuard>
              <ProPage />
            </RouteGuard>
          }
        />
        <Route
          path="/review"
          element={
            <RouteGuard>
              <ReviewScreen onBack={() => window.history.back()} />
            </RouteGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthErrorBoundary>
  );
};

export default App;