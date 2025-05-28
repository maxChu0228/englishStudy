import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data.username))
      .catch(() => setUser(""));
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include"
    }).then(() => {
      setUser(""); // 清空前端狀態
      navigate("/login");
    });
  };


  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#F5F5F5",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <Link to="/dashboard">
            <img src="/logo.png" alt="Logo" style={{ height: "90px", marginRight: "10px" }} />
          </Link>
        </Box>

        <Box display="flex" alignItems="center">
          {/* 新增首頁按鈕 */}
          <Button
            component={Link}
            to="/"
            sx={{ color: "#333", fontWeight: "bold", textTransform: "none", mr: 2 }}
          >
            首頁
          </Button>

          {user ? (
            <Box>
              <IconButton onClick={handleMenu} color="inherit">
                <AccountCircle />
                <Typography sx={{ ml: 1, color: "#333" }}>{user}</Typography>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem onClick={handleLogout}>登出</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              component={Link}
              to="/login"
              sx={{ color: "#333", fontWeight: "bold", textTransform: "none" }}
            >
              登入
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
