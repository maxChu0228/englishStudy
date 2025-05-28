import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GamePage from "./pages/GamePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />         {/* 🔸首頁 */}
        <Route path="/login" element={<LoginPage />} />   {/* 🔐登入 */}
        <Route path="/dashboard" element={<DashboardPage />} /> {/* 👤使用者主頁 */}
        <Route path="/game" element={<GamePage />} />     {/* 🧠遊戲 */}
      </Routes>
    </Router>
  );
}

export default App;
