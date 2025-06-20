import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import api from '../api';

function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    api.post('/login', {
      username: email,
      password: password
    })
    .then((res) => {
      navigate('/dashboard');
    })
    .catch((err) => {
      setError('❌ 帳號或密碼錯誤');
    });
  };

  return (
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
          to="/register"
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
          Sign up
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Username"
        variant="standard"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
        Forgot password?
      </Typography>

      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 2,
          bgcolor: "#5e4b9a",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "18px",
          py:1.5,
          "&:hover": { bgcolor: "#4a3b7f" },
        }}
        onClick={handleLogin}
      >
        SIGN IN
      </Button>

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default LoginCard;
