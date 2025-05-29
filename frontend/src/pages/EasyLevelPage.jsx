import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import axios from "axios";

function EasyLevelPage() {
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);

  const fetchQuestion = async () => {
    const res = await axios.get("http://localhost:5000/api/quiz", { withCredentials: true });
    setQuestion(res.data);
    setSelected(null);
    setFeedback(null);
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleChoiceClick = (choice) => {
    setSelected(choice);
    setFeedback(choice === question.answer ? "✅ 正確！" : "❌ 錯誤！");
  };

  const handleNext = () => {
    if (questionCount >= 10) {
      alert("你完成了 10 題！");
      setQuestionCount(1);
    } else {
      setQuestionCount(prev => prev + 1);
    }
    fetchQuestion();
  };

  return (
    <Box sx={{ minHeight: "100vh", p: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        初級關卡 - 第 {questionCount} 題 / 10
      </Typography>

      {question && (
        <Paper sx={{ p: 4, mt: 2, width: 400, textAlign: "center" }}>
          <Typography variant="h5" mb={2}>
            {question.word}
          </Typography>

          {question.choices.map((choice, index) => (
            <Button
              key={index}
              variant="outlined"
              fullWidth
              sx={{
                mb: 1,
                bgcolor: selected === choice
                  ? choice === question.answer ? "#c8f7c5" : "#f8d7da"
                  : "#fff",
                borderColor: "#ccc",
              }}
              onClick={() => handleChoiceClick(choice)}
              disabled={selected !== null}
            >
              {choice}
            </Button>
          ))}

          {feedback && (
            <Typography mt={2} color={feedback.startsWith("✅") ? "green" : "red"}>
              {feedback}
            </Typography>
          )}

          {selected && (
            <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleNext}>
              下一題
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default EasyLevelPage;
