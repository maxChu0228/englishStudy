import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoginCard from "../components/LoginCard";
import api from "../api";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    api
      .post("/login", { username, password })
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {
        setError("❌ 帳號或密碼錯誤");
      });
  };

  return (
    <>
      <div className="relative z-20">
        <Navbar />
      </div>

      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/background.png')" }}
        />
        <div className="absolute inset-0 bg-white bg-opacity-50" />
      </div>

      <div className="h-[80vh] flex justify-center items-center relative z-10">
        <LoginCard
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleLogin={handleLogin}
          error={error}
        />
      </div>
    </>
  );
}

export default LoginPage;