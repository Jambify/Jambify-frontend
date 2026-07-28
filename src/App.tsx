/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   src/App.tsx — added dynamic /guest/past-questions/:subject and
   /guest/past-questions/:subject/:year routes for SEO (see comment below).
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import React from "react";
import { Routes, Route, Navigate } from "react-router";
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
import GuestPastQuestions from "./Pages/GuestUser/GuestPastQuestions";
import TermsOfService from "./Pages/TermsOfService";
import { supabase } from "./lib/supabase";
import ScrollToTop from "./components/Scrolltotop";
import FrozenAccountGuard from "./components/auth/FrozenAccountGuard";
import ProRevokedModal from "./components/auth/ProRevokedModal";
import type { SupabaseClient } from "@supabase/supabase-js";

// ── Admin imports ─────────────────────────────────────────────────────────────
import AdminGuard from "./admin/AdminGuard";
import AdminLayout from "./admin/AdminLayout";
import AdminOverview from "./admin/pages/AdminOverview";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminAuditLog from "./admin/pages/AdminAuditLog";
import AdminBroadcast from "./admin/pages/AdminBroadcast";
import Adminquestions from "./admin/pages/Adminquestions";
import AdminReports from "./admin/pages/AdminReports";
import AdminRoles from "./admin/pages/Adminroles";

declare global {
  interface Window {
    supabase?: SupabaseClient;
  }
}

if (typeof window !== "undefined") {
  window.supabase = supabase;
}

const App: React.FC = () => {
  return (
    <AuthErrorBoundary>
      <FrozenAccountGuard>
        <ProRevokedModal />
        <ScrollToTop />
        <StudyTimeTracker />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/guest" element={<GuestLanding />} />
          <Route path="/guest/quiz" element={<GuestQuiz />} />
          <Route path="/guest/mock" element={<GuestMock />} />

          {/* SEO routes — one component (GuestPastQuestions) reads subject/year
              from the URL via useParams instead of local filter state, so each
              subject/year combination is its own crawlable, prerenderable URL.
              Order matters: react-router matches top-down, but since these are
              nested static -> dynamic -> dynamic, no ambiguity here. */}
          <Route
            path="/guest/past-questions"
            element={<GuestPastQuestions />}
          />
          <Route
            path="/guest/past-questions/:subject"
            element={<GuestPastQuestions />}
          />
          <Route
            path="/guest/past-questions/:subject/:year"
            element={<GuestPastQuestions />}
          />

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
              // title="Terms of Service"
              // effectiveDate="July 14, 2026"
              // blocks={[]}
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

          {/* ── Admin routes ── guarded by email allowlist ── */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout title="Overview">
                  <AdminOverview />
                </AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminGuard>
                <AdminLayout title="Users">
                  <AdminUsers />
                </AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/audit-log"
            element={
              <AdminGuard>
                <AdminLayout title="Audit Log">
                  <AdminAuditLog />
                </AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/AdminBroadcast"
            element={
              <AdminGuard>
                <AdminLayout title="AdminBroadcast">
                  <AdminBroadcast />
                </AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/Adminquestions"
            element={
              <AdminGuard>
                <AdminLayout title="Adminquestions">
                  <Adminquestions />
                </AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminGuard>
                <AdminLayout title="AdminReports">
                  <AdminReports />
                </AdminLayout>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <AdminGuard>
                <AdminLayout title="AdminRoles">
                  <AdminRoles />
                </AdminLayout>
              </AdminGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FrozenAccountGuard>
    </AuthErrorBoundary>
  );
};

export default App;
