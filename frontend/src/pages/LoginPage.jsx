import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoginCard from "../components/LoginCard";
import "../css/LoginPage.css";
import api from "../api"; // ✅ 引入 axios 實例

// 🔤 動態產生背景英文字母
const generateLetterRows = (rowCount = 3, lettersPerRow = 30) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: rowCount }).map((_, rowIndex) => {
    const rowText = Array.from({ length: lettersPerRow })
      .map(() => letters[Math.floor(Math.random() * letters.length)])
      .join("");

    const direction = rowIndex % 2 === 0 ? "normal" : "reverse";

    return (
      <div key={rowIndex} className="letter-scroll-wrapper">
        <div
          className="letter-scroll"
          style={{
            animationDuration: `${100 + Math.random() * 20}s`,
            animationDirection: direction,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          <span className="letter-row">{rowText + " " + rowText}</span>
        </div>
      </div>
    );
  });
};

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [letterRows, setLetterRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLetterRows(generateLetterRows());
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    api
      .post("/login", { username, password })
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {
        setError("❌ 帳號或密碼錯誤");
      });
  };

  return (
    <>
      {/* 頂部導覽列 */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Navbar />
      </div>

      {/* 背景英文字母動畫 */}
      <div className="letter-background">{letterRows}</div>

      {/* 登入表單區塊 */}
      <div
        style={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <LoginCard
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleLogin={handleLogin}
          error={error}
        />
      </div>
    </>
  );
}

export default LoginPage;
