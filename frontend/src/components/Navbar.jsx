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
  Avatar,
  Badge,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";



function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState("");
  const [avatar, setAvatar] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.username);
        if (data.avatar) {
          setAvatar(`http://localhost:5000/static/avatars/${data.avatar}`);
        }
      })
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
      setUser("");
      setAvatar(null);
      navigate("/login");
    });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navButton = (path, label, icon) => {
    const isActive =
      location.pathname === path || location.pathname + location.search === path;

    return (
      <Button
        component={Link}
        to={path}
        startIcon={icon}
        sx={{
          color: isActive ? "primary.main" : "#333",
          fontWeight: "bold",
          textTransform: "none",
          fontSize: "1.2rem",
          mr: 3,
          px: 2,
          py: 1,
          borderBottom: isActive ? "2px solid #1976d2" : "none",
          borderRadius: 0,
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#F5F5F5",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        px: 4,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: 80 }}>
        <Box display="flex" alignItems="center">
          <Link to="/">
            <img src="/logo.png" alt="Logo" style={{ height: "80px", marginRight: "16px" }} />
          </Link>
        </Box>

        <Box display="flex" alignItems="center">
          {navButton("/dashboard", "個人主頁", <HomeIcon fontSize="medium" />)}
          {navButton("/quiz/history", "測驗紀錄", <HistoryIcon fontSize="medium" />)}
          {navButton("/study?type=starred", "收藏單字", <Star size={20} />)}
          {navButton("/leaderboard",    "排行榜",     <LeaderboardIcon fontSize="medium" />)}

          <IconButton sx={{ color: "#333", mr: 2 }}>
            <Badge badgeContent={0} color="error">
              <NotificationsIcon fontSize="large" />
            </Badge>
          </IconButton>

          {user ? (
            <Box>
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar
                  src={avatar}
                  sx={{ width: 40, height: 40, mr: 1 }}
                />
                <Typography sx={{ color: "#333", fontWeight: "bold" }}>{user}</Typography>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem disabled>{user}</MenuItem>
                <MenuItem onClick={handleLogout}>登出</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              component={Link}
              to="/login"
              sx={{ color: "#333", fontWeight: "bold", textTransform: "none", fontSize: "1.2rem" }}
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
