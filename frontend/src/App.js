import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import DashboardPage from "./pages/DashboardPage";
import GamePage from "./pages/GamePage";
import GameResultPage from "./pages/GameResultPage";
import QuizHistoryPage from "./pages/QuizHistoryPage";
import QuizResultPage from "./pages/QuizResultPage";
import StudyLevelPage from "./pages/StudyLevelPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdvancedLeaderboard from "./pages/AdvancedLeaderboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* 公開頁面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 需要登入的頁面 */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/game" element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        } />
        <Route path="/game/result" element={
          <ProtectedRoute>
            <GameResultPage />
          </ProtectedRoute>
        } />
        <Route path="/quiz/history" element={
          <ProtectedRoute>
            <QuizHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/quiz/result/:id" element={
          <ProtectedRoute>
            <QuizResultPage />
          </ProtectedRoute>
        } />
        <Route path="/study" element={
          <ProtectedRoute>
            <StudyLevelPage />
          </ProtectedRoute>
        } />
          <Route
          path="/leaderboard" element={
            <ProtectedRoute>
              <AdvancedLeaderboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
