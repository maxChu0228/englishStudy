import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import axios from "axios";
import api from "../api";

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    api.get("/api/check-session")
      .then((res) => {
        if (res.data.loggedIn) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "calc(100vh - 60px)",
          backgroundImage: `url(/background.png)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          pt: 8,
          px: 6,
        }}
      >
        {/* 左側內容 */}
        <Box
          sx={{
            flex: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
            maxWidth: 800,
            pl: 8,
          }}
        >
          <img src="/logo.png" alt="VocaPlay Logo" style={{ height: "120px", width: "256px" }} />

          <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
            提升你的單字力
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
            從基礎到進階，打造專屬學習路線
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.9 }}>
            VocaPlay 是一個幫助你透過遊戲方式學習英文單字的互動平台。從日常單字到多益考題，
            讓學習變得輕鬆又有趣。
            <br />立即開始你的英文挑戰旅程！
          </Typography>

          <Button
            component={Link}
            to={isLoggedIn ? "/dashboard" : "/login"}
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              px: 5,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "999px",
              background: "linear-gradient(to right, #007bff, #00c6ff)",
              boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
              transition: "all 0.3s ease-in-out",
              transform: "translateY(0)",
              "&:hover": {
                background: "linear-gradient(to right, #0056d2, #00a3d2)",
                transform: "translateY(-2px)",
              },
            }}
          >
            🚀 開始學習之旅
          </Button>
        </Box>

        {/* 右側插圖 */}
        <Box
          sx={{
            flex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pl: 4,
          }}
        >
          <img
            src="/wordpic.png"
            alt="學習插圖"
            style={{
              maxHeight: "70vh",
              width: "100%",
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>
    </>
  );
}

export default HomePage;
