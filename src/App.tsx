/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. src/App.tsx — add /settings route
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import React from 'react';
import {  Routes, Route, Navigate } from 'react-router-dom';
import Dashboard   from './Pages/Dashboard';
import Quiz        from './Pages/Quiz';
import Performance from './Pages/Performance';
import Subjects    from './Pages/Subjects';
import MockExam    from './Pages/MockExam';
import Onboarding  from './Pages/OnBoarding';
import Settings    from './Pages/Settings';
import RouteGuard  from './components/Layout/RouteGuard';

const App: React.FC = () => (
 
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/"            element={<RouteGuard><Dashboard   /></RouteGuard>} />
      <Route path="/quiz"        element={<RouteGuard><Quiz        /></RouteGuard>} />
      <Route path="/performance" element={<RouteGuard><Performance /></RouteGuard>} />
      <Route path="/subjects"    element={<RouteGuard><Subjects    /></RouteGuard>} />
      <Route path="/mock-exams"   element={<RouteGuard><MockExam    /></RouteGuard>} />
      <Route path="/settings"    element={<RouteGuard><Settings    /></RouteGuard>} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>

);

export default App;










