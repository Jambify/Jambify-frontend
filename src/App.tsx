/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. src/App.tsx — add the route
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import React from "react";
import {  Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Quiz from "./Pages/Quiz";
import Performance from "./Pages/Performance";
import Subjects from "./Pages/Subjects";
import MockExams from "./Pages/MockExam";
import RouteGuard from "./components/Layout/RouteGuard";
import Onboarding from "./Pages/OnBoarding";
import NotFound from "./Pages/PageNotFound";

const App: React.FC = () => (

    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected routes */}
      <Route path="/" element={<RouteGuard><Dashboard /></RouteGuard>} />
      <Route path="/quiz" element={<RouteGuard><Quiz /></RouteGuard>} />
      <Route path="/performance" element={<RouteGuard><Performance /></RouteGuard>} />
      <Route path="/subjects" element={<RouteGuard><Subjects /></RouteGuard>} />
      <Route path="/mock-exams" element={<RouteGuard><MockExams /></RouteGuard>} />

      <Route path="*" element={<NotFound />} />
    </Routes>

);

export default App;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. src/components/Layout/Sidebar.tsx
   The Performance nav item is already in MAIN_NAV
   pointing to '/performance' — nothing to change.

   Just confirm this entry exists in your MAIN_NAV:
   
   Example nav item:
   {
     label: 'Performance', path: '/performance',
     icon: (
       <svg width="16" height="16" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="1.8">
         <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
       </svg>
     )
   }
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. Create this folder:
      src/components/Performance/
        WeeklyChart.tsx
        TopicStats.tsx
        MockScores.tsx
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
