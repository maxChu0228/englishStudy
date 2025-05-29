import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";

function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const level = new URLSearchParams(location.search).get("level") || "easy";

  const [questions, setQuestions] = useState([]); // 一次拿全部題目
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const question = questions[currentIndex];

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/quiz?level=${level}&count=10`, { withCredentials: true });
      setQuestions(res.data);
      setCurrentIndex(0);
      setQuestionCount(1);
      setSelected(null);
      setFeedback(null);
      setScore(0);
      setWrongAnswers([]);
    } catch (err) {
      console.error("Failed to fetch quiz questions:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [level]);

  const handleChoiceClick = (choice) => {
    setSelected(choice);
    const isCorrect = choice === question.answer;
    setFeedback(isCorrect ? "✅ 正確！" : "❌ 錯誤！");

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [
        ...prev,
        { word: question.word, correct: question.answer, chosen: choice }
      ]);
    }
  };

const handleNext = async () => {
  if (questionCount >= 10) {
    // 整理每一題的答題記錄（包含錯題與正確題）
    const answers = questions.map((q) => {
      const wrong = wrongAnswers.find(w => w.word === q.word);
      return {
        word: q.word,
        correct: q.answer,
        chosen: wrong ? wrong.chosen : q.answer, // 錯的就用錯的，對的就記正確答案
      };
    });

    // 發送 POST 請求到後端儲存測驗紀錄
    try {
      await axios.post("http://localhost:5000/api/quiz/submit", {
        level,
        score,
        total: 10,
        answers
      }, { withCredentials: true });
    } catch (err) {
      console.error("測驗紀錄儲存失敗：", err);
    }

    // 導向結果頁
    navigate("/game/result", {
      state: {
        score,
        wrongAnswers
      }
    });
  } else {
    setCurrentIndex(prev => prev + 1);
    setQuestionCount(prev => prev + 1);
    setSelected(null);
    setFeedback(null);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f6f8", p: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Paper elevation={3} sx={{ px: 4, py: 2, mb: 3, borderRadius: 3, textAlign: "center", backgroundColor: "#ffffff" }}>
          <Typography variant="h6" fontWeight="medium" color="text.secondary">
            關卡：
            <Typography component="span" fontWeight="bold" color="primary" ml={1}>{level}</Typography>
            <Typography component="span" mx={2}>|</Typography>
            題目進度：
            <Typography component="span" fontWeight="bold" color="primary" ml={1}>第 {questionCount} / 10 題</Typography>
          </Typography>
        </Paper>

        {question && (
          <Paper sx={{ p: 4, width: "100%", maxWidth: 480, borderRadius: 4, boxShadow: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary" textAlign="center" mb={3}>
              {question.word}
            </Typography>

            <Stack spacing={2}>
              {question.choices.map((choice, index) => {
                const isCorrect = choice === question.answer;
                const isSelected = selected === choice;

                let bgColor = "#fff";
                let icon = null;
                let textColor = "inherit";

                if (selected) {
                  if (isSelected && !isCorrect) {
                    bgColor = "#ffe6e6";
                    icon = "❌";
                    textColor = "#d32f2f";
                  } else if (isCorrect) {
                    bgColor = "#e0f7e9";
                    icon = "✔️";
                    textColor = "#388e3c";
                  }
                }

                return (
                  <Button
                    key={index}
                    variant="outlined"
                    fullWidth
                    disableRipple
                    sx={{
                      bgcolor: bgColor,
                      color: textColor,
                      borderColor: "#bbb",
                      fontWeight: "bold",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#f0f0f0"
                      }
                    }}
                    onClick={() => handleChoiceClick(choice)}
                    disabled={selected !== null}
                  >
                    <span>{choice}</span>
                    {icon && <span>{icon}</span>}
                  </Button>
                );
              })}
            </Stack>

            {feedback && (
              <Typography mt={3} textAlign="center" fontWeight="medium" color={feedback.startsWith("✅") ? "green" : "red"}>
                {feedback}
              </Typography>
            )}

            {selected && (
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 4, py: 1.5 }} onClick={handleNext}>
                下一題
              </Button>
            )}
          </Paper>
        )}
      </Box>
    </>
  );
}

export default GamePage;
