import { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import api from "../api";

function QuizHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/api/quiz/history")
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("載入紀錄失敗：", err));
  }, []);

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f6f8", p: 4 }}>
        <Paper sx={{ maxWidth: 800, mx: "auto", p: 4, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>📜 測驗紀錄</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>日期時間</TableCell>
                <TableCell>等級</TableCell>
                <TableCell>得分</TableCell>
                <TableCell>總題數</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Link to={`/quiz/result/${record.id}`}>
                      {new Date(record.created_at).toLocaleString()}
                    </Link>
                  </TableCell>
                  <TableCell>{record.level}</TableCell>
                  <TableCell>{record.score}</TableCell>
                  <TableCell>{record.total_questions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </>
  );
}

export default QuizHistoryPage;
