import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, Divider } from "@mui/material";
import Navbar from "../components/Navbar";
import axios from "axios";

function QuizResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/quiz/result/${id}`, { withCredentials: true })
      .then(res => setResult(res.data))
      .catch(err => console.error("讀取測驗結果失敗", err));
  }, [id]);

  useEffect(() => {
  // 進入頁面時：允許滾動
  document.body.style.overflow = "auto";
  return () => {
    // 離開頁面時：恢復禁止滾動
    document.body.style.overflow = "hidden";
  };
}, []);

  if (!result) return null;

  return (
    <>
      <div className="App">
      <Navbar />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f6f8", p: 4, overflowY: "auto" }}>
        <Paper sx={{ maxWidth: 800, mx: "auto", p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📝 測驗結果（{new Date(result.record.created_at).toLocaleString()}）
          </Typography>
          <Typography variant="subtitle1" mb={2}>
            關卡：{result.record.level}｜得分：{result.record.score} / {result.record.total_questions}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {result.items.map((item, idx) => (
            <Box key={idx} sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: item.is_correct ? "#e0f7e9" : "#ffe6e6" }}>
              <Typography fontWeight="bold" fontSize="18px">
                {idx + 1}. {item.word}
              </Typography>
              <Typography>你的答案：{item.chosen_answer}</Typography>
              <Typography>正確答案：{item.correct_answer}</Typography>
              <Typography color={item.is_correct ? "green" : "red"}>
                {item.is_correct ? "✅ 正確" : "❌ 錯誤"}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>
      </div>
    </>
  );
}

export default QuizResultPage;
