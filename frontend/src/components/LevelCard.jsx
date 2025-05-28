// src/components/LevelCard.jsx
import { useNavigate } from "react-router-dom";

function LevelCard({ title, description, level, locked, type = "quiz" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (locked) return;
    if (type === "quiz") {
      navigate(`/game?level=${level}`);
    } else if (type === "study") {
      navigate(`/study?type=${level}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer p-5 rounded-xl shadow-md border-2 transition ${
        locked
          ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
          : "bg-white text-black border-green-400 hover:bg-green-50 hover:border-green-600"
      }`}
    >
      <h3 className="text-lg font-semibold mb-2">{locked ? "🔒 " : ""}{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}

export default LevelCard;
