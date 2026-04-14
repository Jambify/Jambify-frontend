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
import NotFound from "./Pages/PageNotFound";

const App: React.FC = () => (

    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/performance" element={<Performance />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/mock-exams" element={<MockExams />} />

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
