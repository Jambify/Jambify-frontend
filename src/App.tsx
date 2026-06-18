/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. src/App.tsx — add /settings route and global network status
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
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
// In App.tsx, add this near the top
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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/guest" element={<GuestLanding />} />
        <Route path="/guest/quiz" element={<GuestQuiz />} />
        <Route path="/guest/mock" element={<GuestMock />} />
        <Route path="/guest/past-questions" element={<GuestQuiz />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route
          path="/"
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
