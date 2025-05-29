import { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import Navbar from "../components/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";

function QuizHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/quiz/history", { withCredentials: true })
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
            </TableHead>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
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
