import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/check-session")
      .then(res => {
        const data = res.data;
        if (data.loggedIn) {
          setAllowed(true);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"))
      .finally(() => setChecking(false));
  }, [navigate]);

  if (checking) return <div>🔐 驗證中...</div>;
  if (!allowed) return null;

  return children;
}

export default ProtectedRoute;
