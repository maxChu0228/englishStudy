import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid
} from "@mui/material";
import Navbar from "../components/Navbar";

function GameResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { score = 0, wrongAnswers = [] } = state || {};

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#f9f9f9"
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          🎉 測驗完成！
        </Typography>

        <Paper elevation={3} sx={{ width: "100%", maxWidth: 900, p: 5, mt: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📊 結果資訊
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography fontSize={18}>✅ 總分</Typography>
            <Typography fontSize={18} fontWeight="bold">{score} / 10</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography gutterBottom fontSize={18}>📄 答錯單字列表：</Typography>
          {wrongAnswers.length > 0 ? (
            <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 250, overflowY: 'auto' }}>
              <Table size="medium" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>單字</strong></TableCell>
                    <TableCell><strong>正確</strong></TableCell>
                    <TableCell><strong>你的選擇</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wrongAnswers.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontSize: 16 }}>{item.word}</TableCell>
                      <TableCell sx={{ color: 'green', fontSize: 16 }}>{item.correct}</TableCell>
                      <TableCell sx={{ color: 'red', fontSize: 16 }}>{item.chosen}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="green" fontSize={16}>🎉 全部答對！太棒了！</Typography>
          )}

          <Divider sx={{ my: 3 }} />

            <Grid container spacing={20} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" fullWidth size="large" sx={{ borderColor: '#1976d2', color: '#1976d2' }} onClick={() => navigate("/game?level=easy")}>🔁 再挑戰</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" fullWidth size="large" sx={{ borderColor: '#1976d2', color: '#1976d2' }} onClick={() => navigate("/dashboard")}>🏠 回主頁</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" fullWidth size="large" sx={{ borderColor: '#1976d2', color: '#1976d2' }} onClick={() => alert("⭐ 收藏功能尚未實作")}>⭐ 收藏錯題</Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  );
}

export default GameResultPage;
