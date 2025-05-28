import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoginCard from "../components/LoginCard";
import "../css/LoginPage.css"; // 或你自己的 CSS 檔案，包含 .letter-rain 等樣式

const generateLetterRows = (rowCount = 3, lettersPerRow = 30) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: rowCount }).map((_, rowIndex) => {
    const rowText = Array.from({ length: lettersPerRow })
      .map(() => letters[Math.floor(Math.random() * letters.length)])
      .join("");

  const direction = rowIndex % 2 === 0 ? "normal" : "reverse"; // 偶數排向右，奇數排向左

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
            <span className="letter-row">
              {rowText + " " + rowText}
          </span>
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

    fetch("http://localhost:5000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("登入失敗");
        return res.json();
      })
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {
        setError("❌ 帳號或密碼錯誤");
      });
  };

  return (
    <>
      <div style={{ position: "relative", zIndex: 2 }}>
        <Navbar />
      </div>

      {/* 背景：4 排橫向移動的英文字母 */}
      <div className="letter-background">{letterRows}</div>

      {/* 登入表單 */}
      <div
        style={{
          height: "80vh",               // 佔滿整個畫面高度
          display: "flex",               // 使用 Flex 排版
          justifyContent: "center",      // 水平置中
          alignItems: "center",          // 垂直置中
          position: "relative",          // 讓背景動畫仍能疊在底層
          zIndex: 1,                     // 登入框要浮在背景英文字母上
        }}
      >
        <LoginCard />
      </div>
    </>
  );
}

export default LoginPage;
