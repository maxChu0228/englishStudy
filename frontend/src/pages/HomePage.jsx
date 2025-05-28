import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>🎓 歡迎來到 VocaPlay</h1>
      <p>一起學英文單字吧！</p>
      <Link to="/login">
        <button style={{ padding: "10px 20px", fontSize: "1em", marginTop: "20px" }}>
          🔐 前往登入
        </button>
      </Link>
    </div>
  );
}

export default HomePage;
