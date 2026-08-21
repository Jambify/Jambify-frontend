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

   PERF FIX: every page used to be a static top-level import, which means
   visiting "/" downloaded the JS for the entire app — quiz engine, mock
   exams, the whole admin panel — in one bundle, whether or not any of it
   ran on that page. That's the likely source of PageSpeed's "5,998 KiB
   total payload" and "253 KiB unused JavaScript" flags. Converted every
   route component to React.lazy() so each route only loads its own chunk.
   Kept eager: layout/guard wrappers that run on every route regardless
   (RouteGuard, AdminGuard, AdminLayout, ScrollToTop, StudyTimeTracker,
   AuthErrorBoundary, FrozenAccountGuard, ProRevokedModal) since they're
   small and always needed immediately, not page-specific.
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


// ── Admin layout/guard — kept eager, small, needed on every /admin/* route ──
import AdminGuard from "./admin/AdminGuard";
import AdminLayout from "./admin/AdminLayout";

// ── Lazy-loaded pages — each becomes its own chunk, only fetched when
//    that route is actually visited ──────────────────────────────────────
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Landing = lazy(() => import("./Pages/LandingPage"));
const AboutPage = lazy(() => import("./Pages/Aboutpage"));
const Quiz = lazy(() => import("./Pages/Quiz"));
const AllSessions = lazy(() => import("./Pages/AllSessions"));
const Performance = lazy(() => import("./Pages/Performance"));
const Subjects = lazy(() => import("./Pages/Subjects"));
const MockExam = lazy(() => import("./Pages/MockExam/MockExam"));
const Onboarding = lazy(() => import("./Pages/OnBoarding"));
const SignUp = lazy(() => import("./Pages/Authentication/SignUp"));
const SignIn = lazy(() => import("./Pages/Authentication/SignIn"));
const Welcome = lazy(() => import("./Pages/Welcome"));
const Settings = lazy(() => import("./Pages/Settings"));
const StudyGroups = lazy(() => import("./Pages/StudyGroups"));
const MentorChat = lazy(() => import("./Pages/MentorChat"));
const PastQuestions = lazy(() => import("./Pages/PastQuestions"));
const ReviewScreen = lazy(() => import("./Pages/MockExam/ReviewExam"));
const ProPage = lazy(() => import("./Pages/Pro"));
const AuthCallback = lazy(() => import("./components/auth/AuthCallback"));
const GuestLanding = lazy(() => import("./Pages/GuestUser/GuestLanding"));
const GuestQuiz = lazy(() => import("./Pages/GuestUser/GuestQuiz"));
const GuestMock = lazy(() => import("./Pages/GuestUser/GuestExam"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const GuestPrivacyPolicy = lazy(() => import("./Pages/GuestUser/GuestPrivacy"));
const GuestTermsOfService = lazy(() => import("./Pages/GuestUser/GuestLegal"));
const GuestPastQuestions = lazy(
  () => import("./Pages/GuestUser/GuestPastQuestions"),
);
const TermsOfService = lazy(() => import("./Pages/TermsOfService"));

// ── Admin pages — lazy too, so the admin panel's JS never ships to
//    regular students at all, only to admins who actually visit /admin ──
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

// Minimal loading fallback — skeleton UI while route chunks download
const RouteFallback: React.FC = () => (
  <div className="bg-bgMain flex min-h-screen items-center justify-center p-6">
    <div className="animate-pulse space-y-4 w-full max-w-md">
      <div className="bg-bgSurface h-12 rounded-brand-lg w-3/4" />
      <div className="bg-bgSurface h-48 rounded-brand-xl w-full" />
      <div className="bg-bgSurface h-8 rounded-brand w-1/2" />
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthErrorBoundary>
      <FrozenAccountGuard>
        <ProRevokedModal />
        <ScrollToTop />
        <StudyTimeTracker />

        <ChunkErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
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
                path="/sessions"
                element={
                  <RouteGuard>
                    <AllSessions />
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
                path="/admin/topics"
                element={
                  <AdminGuard>
                    <AdminLayout title="Topic Overview">
                      <AdminTopicOverview />
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
          </Suspense>
        </ChunkErrorBoundary>
      </FrozenAccountGuard>
    </AuthErrorBoundary>
  );
};

export default App;
