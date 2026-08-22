/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   src/App.tsx — added dynamic /guest/past-questions/:subject and
   /guest/past-questions/:subject/:year routes for SEO (see comment below).
   Also added the public /about route.

   AUTH FIX: "/", "/signin", and "/signup" used to render OUTSIDE
   <RouteGuard>, which meant the supabase.auth.getSession() check inside
   RouteGuard never ran on those routes. Landing would render blind to
   auth state, and only "became aware" once RouteGuard mounted for the
   first time on some other route. Now all three are wrapped in
   RouteGuard, which resolves the session first (showing a loading
   spinner), then redirects an already-authenticated + fully-onboarded
   user straight to /dashboard instead of showing Landing/SignIn/SignUp.

   PERF FIX (v2): First-paint / direct-landing routes are now EAGER
   (Landing, SignIn, SignUp, Onboarding, Dashboard, Welcome, About,
   Privacy/Terms pages, AuthCallback, all Guest landing/legal pages) so
   those pages never flash a skeleton — they ship in the main bundle and
   render instantly. Only genuinely heavy, deeper-in-the-app routes stay
   lazy-loaded with per-page Suspense skeletons that visually mirror the
   real page layout to avoid any jarring layout shift on swap-in.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import RouteGuard from "./components/Layout/RouteGuard";
import StudyTimeTracker from "./components/StudyTimeTracker";
import AuthErrorBoundary from "./components/ui/AuthErrorBoundary";
import ChunkErrorBoundary from "./components/ChunkErrorBoundary";
import { supabase } from "./lib/supabase";
import ScrollToTop from "./components/Scrolltotop";
import FrozenAccountGuard from "./components/auth/FrozenAccountGuard";
import ProRevokedModal from "./components/auth/ProRevokedModal";
import type { SupabaseClient } from "@supabase/supabase-js";

// ── Skeletons (one per lazy route, each shaped like the real page) ──────
import ReviewExamSkeleton from "./components/skeletons/ReviewExamSkeleton";
import MockExamSkeleton from "./components/skeletons/MockExamSkeleton";
import StudyGroupsSkeleton from "./components/skeletons/StudyGroupsSkeleton";
import QuizSkeleton from "./components/skeletons/QuizSkeleton";
import ChatSkeleton from "./components/skeletons/ChatSkeleton";
import SettingsSkeleton from "./components/skeletons/SettingsSkeleton";
import SubjectGridSkeleton from "./components/skeletons/SubjectGridSkeleton";
import ListSkeleton from "./components/skeletons/ListSkeleton";
import ProSkeleton from "./components/skeletons/ProSkeleton";
import AdminSkeleton from "./components/skeletons/AdminSkeleton";
import PastQuestionsSkeleton from "./components/skeletons/PastQuestionsSkeleton";

// ── Admin layout/guard — kept eager, small, needed on every /admin/* route ──
import AdminGuard from "./admin/AdminGuard";
import AdminLayout from "./admin/AdminLayout";

// ── EAGER: first-paint / direct-landing pages. Ship in the main bundle,
//    render instantly, NEVER show a Suspense skeleton. ───────────────────
import Dashboard from "./Pages/Dashboard";
import Landing from "./Pages/LandingPage";
import AboutPage from "./Pages/Aboutpage";
import Onboarding from "./Pages/OnBoarding";
import SignUp from "./Pages/Authentication/SignUp";
import SignIn from "./Pages/Authentication/SignIn";
import Welcome from "./Pages/Welcome";
import AuthCallback from "./components/auth/AuthCallback";
import GuestLanding from "./Pages/GuestUser/GuestLanding";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import GuestPrivacyPolicy from "./Pages/GuestUser/GuestPrivacy";
import GuestTermsOfService from "./Pages/GuestUser/GuestLegal";
import TermsOfService from "./Pages/TermsOfService";

// ── LAZY: heavy / deeper-in-the-app routes. Each gets its own chunk and
//    its own matching Suspense skeleton (see per-route wrappers below). ──
const Quiz = lazy(() => import("./Pages/Quiz"));
const AllSessions = lazy(() => import("./Pages/AllSessions"));
const Performance = lazy(() => import("./Pages/Performance"));
const Subjects = lazy(() => import("./Pages/Subjects"));
const MockExam = lazy(() => import("./Pages/MockExam/MockExam"));
const Settings = lazy(() => import("./Pages/Settings"));
const StudyGroups = lazy(() => import("./Pages/StudyGroups"));
const MentorChat = lazy(() => import("./Pages/MentorChat"));
const PastQuestions = lazy(() => import("./Pages/PastQuestions"));
const ReviewScreen = lazy(() => import("./Pages/MockExam/ReviewExam"));
const ProPage = lazy(() => import("./Pages/Pro"));
const GuestQuiz = lazy(() => import("./Pages/GuestUser/GuestQuiz"));
const GuestMock = lazy(() => import("./Pages/GuestUser/GuestExam"));
const GuestPastQuestions = lazy(
  () => import("./Pages/GuestUser/GuestPastQuestions"),
);

// ── Admin pages — always lazy so admin JS never ships to regular students.
//    All share the AdminSkeleton layout (stats rows + data table). ───────
const AdminOverview = lazy(() => import("./admin/pages/AdminOverview"));
const AdminTopicOverview = lazy(
  () => import("./admin/pages/AdminTopicOverview"),
);
const AdminUsers = lazy(() => import("./admin/pages/AdminUsers"));
const AdminAuditLog = lazy(
  () =>
    import("./admin/pages/AdminAuditLog") as Promise<{
      default: React.ComponentType<any>;
    }>,
);
const AdminBroadcast = lazy(() => import("./admin/pages/AdminBroadcast"));
const Adminquestions = lazy(() => import("./admin/pages/Adminquestions"));
const AdminReports = lazy(() => import("./admin/pages/AdminReports"));
const AdminRoles = lazy(() => import("./admin/pages/Adminroles"));

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

        <ChunkErrorBoundary>
          <Routes>
            {/* ── EAGER routes — no Suspense, render instantly ──────── */}
            <Route
              path="/"
              element={
                <RouteGuard>
                  <Landing />
                </RouteGuard>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/signup"
              element={
                <RouteGuard>
                  <SignUp />
                </RouteGuard>
              }
            />
            <Route
              path="/signin"
              element={
                <RouteGuard>
                  <SignIn />
                </RouteGuard>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/guest" element={<GuestLanding />} />
            <Route
              path="/guest/privacy-policy"
              element={<GuestPrivacyPolicy />}
            />
            <Route
              path="/guest/terms-of-service"
              element={<GuestTermsOfService />}
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

            {/* ── LAZY routes — each wrapped with its own matching skeleton ── */}
            <Route
              path="/guest/quiz"
              element={
                <Suspense fallback={<QuizSkeleton />}>
                  <GuestQuiz />
                </Suspense>
              }
            />
            <Route
              path="/guest/mock"
              element={
                <Suspense fallback={<MockExamSkeleton />}>
                  <GuestMock />
                </Suspense>
              }
            />
            <Route
              path="/guest/past-questions"
              element={
                <Suspense fallback={<SubjectGridSkeleton />}>
                  <GuestPastQuestions />
                </Suspense>
              }
            />
            <Route
              path="/guest/past-questions/:subject"
              element={
                <Suspense fallback={<QuizSkeleton />}>
                  <GuestPastQuestions />
                </Suspense>
              }
            />
            <Route
              path="/guest/past-questions/:subject/:year"
              element={
                <Suspense fallback={<QuizSkeleton />}>
                  <GuestPastQuestions />
                </Suspense>
              }
            />

            <Route
              path="/quiz"
              element={
                <RouteGuard>
                  <Suspense fallback={<QuizSkeleton />}>
                    <Quiz />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/performance"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={<div className="bg-bgMain min-h-[60vh]" />}
                  >
                    <Performance />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/subjects"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={<div className="bg-bgMain min-h-[60vh]" />}
                  >
                    <Subjects />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/sessions"
              element={
                <RouteGuard>
                  <Suspense fallback={<ListSkeleton />}>
                    <AllSessions />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/mock-exams"
              element={
                <RouteGuard>
                  <Suspense fallback={<MockExamSkeleton />}>
                    <MockExam />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <RouteGuard>
                  <Suspense fallback={<SettingsSkeleton />}>
                    <Settings />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/study-groups"
              element={
                <RouteGuard>
                  <Suspense fallback={<StudyGroupsSkeleton />}>
                    <StudyGroups />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/mentor"
              element={
                <RouteGuard>
                  <Suspense fallback={<ChatSkeleton />}>
                    <MentorChat />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/past-questions"
              element={
                <RouteGuard>
                  <Suspense fallback={<PastQuestionsSkeleton />}>
                    <PastQuestions />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/pro"
              element={
                <RouteGuard>
                  <Suspense fallback={<ProSkeleton />}>
                    <ProPage />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/review"
              element={
                <RouteGuard>
                  <Suspense fallback={<ReviewExamSkeleton />}>
                    <ReviewScreen onBack={() => window.history.back()} />
                  </Suspense>
                </RouteGuard>
              }
            />

            {/* ── LAZY Admin routes — share AdminSkeleton layout ── */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminSkeleton />}>
                  <AdminGuard>
                    <AdminLayout title="Overview">
                      <AdminOverview />
                    </AdminLayout>
                  </AdminGuard>
                </Suspense>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Suspense fallback={<AdminSkeleton />}>
                  <AdminGuard>
                    <AdminLayout title="Users">
                      <AdminUsers />
                    </AdminLayout>
                  </AdminGuard>
                </Suspense>
              }
            />
            <Route
              path="/admin/audit-log"
              element={
                <Suspense fallback={<AdminSkeleton />}>
                  <AdminGuard>
                    <AdminLayout title="Audit Log">
                      <AdminAuditLog />
                    </AdminLayout>
                  </AdminGuard>
                </Suspense>
              }
            />
            <Route
              path="/admin/AdminBroadcast"
              element={
                <Suspense fallback={<AdminSkeleton />}>
                  <AdminGuard>
                    <AdminLayout title="AdminBroadcast">
                      <AdminBroadcast />
                    </AdminLayout>
                  </AdminGuard>
                </Suspense>
              }
            />
            <Route
              path="/admin/Adminquestions"
              element={
                <Suspense fallback={<AdminSkeleton />}>
                  <AdminGuard>
                    <AdminLayout title="Adminquestions">
                      <Adminquestions />
                    </AdminLayout>
                  </AdminGuard>
                </Suspense>
              }
            />
            <Route
              path="/admin/topics"
              element={
                <Suspense fallback={<AdminSkeleton />}>
                  <AdminGuard>
                    <AdminLayout title="Topic Overview">
                      <AdminTopicOverview />
                    </AdminLayout>
                  </AdminGuard>
                </Suspense>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <Suspense fallback={<AdminSkeleton />}>
                  <AdminGuard>
                    <AdminLayout title="AdminReports">
                      <AdminReports />
                    </AdminLayout>
                  </AdminGuard>
                </Suspense>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <Suspense fallback={<AdminSkeleton />}>
                  <AdminGuard>
                    <AdminLayout title="AdminRoles">
                      <AdminRoles />
                    </AdminLayout>
                  </AdminGuard>
                </Suspense>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChunkErrorBoundary>
      </FrozenAccountGuard>
    </AuthErrorBoundary>
  );
};

export default App;
