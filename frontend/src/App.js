import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GamePage from "./pages/GamePage";
import GameResultPage from "./pages/GameResultPage";
import QuizHistoryPage from "./pages/QuizHistoryPage";
import QuizResultPage from "./pages/QuizResultPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />         {/* 🔸首頁 */}
        <Route path="/login" element={<LoginPage />} />   {/* 🔐登入 */}
        <Route path="/dashboard" element={<DashboardPage />} /> {/* 👤使用者主頁 */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/game/result" element={<GameResultPage />} />
        <Route path="/quiz/history" element={<QuizHistoryPage />} />
        <Route path="/quiz/result/:id" element={<QuizResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;
