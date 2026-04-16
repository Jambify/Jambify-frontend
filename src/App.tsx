/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. src/App.tsx — add /settings route
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Quiz from "./Pages/Quiz";
import Performance from "./Pages/Performance";
import Subjects from "./Pages/Subjects";
import MockExam from "./Pages/MockExam";
import Onboarding from "./Pages/OnBoarding";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import Welcome from "./Pages/Welcome";
import Settings from "./Pages/Settings";
import RouteGuard from "./components/Layout/RouteGuard";
import StudyGroups from "./Pages/StudyGroup";
import MentorChat from "./Pages/MentorChat";
import PastQuestions from "./Pages/PastQuestions";

const App: React.FC = () => (
  <Routes>
    <Route path="/signup" element={<SignUp />} />
    <Route path="/signin" element={<SignIn />} />
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

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
