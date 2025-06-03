import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import "../css/LoginPage.css"; // ✅ 共用動畫背景 CSS

function generateLetterRows(rowCount = 3, lettersPerRow = 30) {
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
}

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [letterRows, setLetterRows] = useState([]);

  useEffect(() => {
    setLetterRows(generateLetterRows());
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    fetch("http://localhost:5000/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("註冊失敗");
        return res.json();
      })
      .then(() => {
        alert("✅ 註冊成功！");
        navigate("/login");
      })
      .catch((err) => {
        setError("❌ 帳號已存在或格式錯誤");
      });
  };

  return (
    <>
      <div style={{ position: "relative", zIndex: 2 }}>
        <Navbar />
      </div>

      <div className="letter-background">{letterRows}</div>

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
        <Box
          sx={{
            width: 460,
            bgcolor: "#fff",
            p: 5,
            borderRadius: 3,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: "relative",
          }}
        >
          {/* Logo 與登入連結 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box component="img" src="/logo.png" alt="Logo" sx={{ height: 80 }} />
            <Typography
              component={Link}
              to="/login"
              sx={{
                fontSize: "14px",
                color: "#5e4b9a",
                fontWeight: "bold",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Sign in
            </Typography>
          </Box>

          {/* 表單欄位 */}
          <TextField
            fullWidth
            placeholder="Username"
            variant="standard"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            placeholder="Password"
            variant="standard"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 註冊按鈕 */}
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: "#5e4b9a",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "18px",
              py: 1.5,
              "&:hover": { bgcolor: "#4a3b7f" },
            }}
            onClick={handleRegister}
          >
            CREATE ACCOUNT
          </Button>

          {/* 錯誤訊息 */}
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </div>
    </>
  );
}

export default RegisterPage;
