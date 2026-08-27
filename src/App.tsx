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
import AppLayout from "./components/Layout/AppLayout";
import StudyTimeTracker from "./components/StudyTimeTracker";
import AuthErrorBoundary from "./components/ui/AuthErrorBoundary";
import ChunkErrorBoundary from "./components/ChunkErrorBoundary";
import { supabase } from "./lib/supabase";
import ScrollToTop from "./components/Scrolltotop";
import FrozenAccountGuard from "./components/auth/FrozenAccountGuard";
import ProRevokedModal from "./components/auth/ProRevokedModal";
import type { SupabaseClient } from "@supabase/supabase-js";

// ── Skeletons (only for pages that fetch data on mount) ──────

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
//    AdminOverview has section-scoped skeletons inline.
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
                <Suspense
                  fallback={
                    <AppLayout currentPage="quiz">
                      <div className="bg-bgMain min-h-[60vh]" />
                    </AppLayout>
                  }
                >
                  <GuestQuiz />
                </Suspense>
              }
            />
            <Route
              path="/guest/mock"
              element={
                <Suspense
                  fallback={
                    <AppLayout currentPage="mock">
                      <div className="bg-bgMain min-h-[60vh]" />
                    </AppLayout>
                  }
                >
                  <GuestMock />
                </Suspense>
              }
            />
            <Route
              path="/guest/past-questions"
              element={
                <Suspense
                  fallback={
                    <AppLayout currentPage="past-questions">
                      <div className="bg-bgMain min-h-[60vh]" />
                    </AppLayout>
                  }
                >
                  <GuestPastQuestions />
                </Suspense>
              }
            />
            <Route
              path="/guest/past-questions/:subject"
              element={
                <Suspense
                  fallback={
                    <AppLayout currentPage="past-questions">
                      <div className="bg-bgMain min-h-[60vh]" />
                    </AppLayout>
                  }
                >
                  <GuestPastQuestions />
                </Suspense>
              }
            />
            <Route
              path="/guest/past-questions/:subject/:year"
              element={
                <Suspense
                  fallback={
                    <AppLayout currentPage="past-questions">
                      <div className="bg-bgMain min-h-[60vh]" />
                    </AppLayout>
                  }
                >
                  <GuestPastQuestions />
                </Suspense>
              }
            />

            <Route
              path="/quiz"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={
                      <AppLayout currentPage="quiz">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
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
                    fallback={
                      <AppLayout currentPage="performance">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
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
                    fallback={
                      <AppLayout currentPage="subjects">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
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
                  <Suspense
                    fallback={
                      <AppLayout currentPage="sessions">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
                    <AllSessions />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/mock-exams"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={
                      <AppLayout currentPage="mock">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
                    <MockExam />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={
                      <AppLayout currentPage="settings">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
                    <Settings />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/study-groups"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={
                      <AppLayout currentPage="groups">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
                    <StudyGroups />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/mentor"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={
                      <AppLayout currentPage="mentor">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
                    <MentorChat />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/past-questions"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={
                      <AppLayout currentPage="past-questions">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
                    <PastQuestions />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/pro"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={
                      <AppLayout currentPage="pro">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
                    <ProPage />
                  </Suspense>
                </RouteGuard>
              }
            />
            <Route
              path="/review"
              element={
                <RouteGuard>
                  <Suspense
                    fallback={
                      <AppLayout currentPage="Review">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AppLayout>
                    }
                  >
                    <ReviewScreen onBack={() => window.history.back()} />
                  </Suspense>
                </RouteGuard>
              }
            />

            {/* ── LAZY Admin routes — section-scoped skeletons inline in pages ── */}
            <Route
              path="/admin"
              element={
                <Suspense
                  fallback={
                    <AdminGuard>
                      <AdminLayout title="Overview">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AdminLayout>
                    </AdminGuard>
                  }
                >
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
                <Suspense
                  fallback={
                    <AdminGuard>
                      <AdminLayout title="Users">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AdminLayout>
                    </AdminGuard>
                  }
                >
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
                <Suspense
                  fallback={
                    <AdminGuard>
                      <AdminLayout title="Audit Log">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AdminLayout>
                    </AdminGuard>
                  }
                >
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
                <Suspense
                  fallback={
                    <AdminGuard>
                      <AdminLayout title="AdminBroadcast">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AdminLayout>
                    </AdminGuard>
                  }
                >
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
                <Suspense
                  fallback={
                    <AdminGuard>
                      <AdminLayout title="Adminquestions">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AdminLayout>
                    </AdminGuard>
                  }
                >
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
                <Suspense
                  fallback={
                    <AdminGuard>
                      <AdminLayout title="Topic Overview">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AdminLayout>
                    </AdminGuard>
                  }
                >
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
                <Suspense
                  fallback={
                    <AdminGuard>
                      <AdminLayout title="AdminReports">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AdminLayout>
                    </AdminGuard>
                  }
                >
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
                <Suspense
                  fallback={
                    <AdminGuard>
                      <AdminLayout title="AdminRoles">
                        <div className="bg-bgMain min-h-[60vh]" />
                      </AdminLayout>
                    </AdminGuard>
                  }
                >
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
