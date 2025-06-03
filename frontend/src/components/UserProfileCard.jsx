import { useState, useEffect, useRef } from "react";
import api from "../api";

function getLevel(completed) {
  if (completed >= 50) return "Lv. 5 - 單字王者";
  if (completed >= 30) return "Lv. 4 - 單字強者";
  if (completed >= 20) return "Lv. 3 - 熟練學習者";
  if (completed >= 10) return "Lv. 2 - 穩定進步中";
  return "Lv. 1 - 初學者";
}

function UserProfileCard() {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef();

  // 📌 暫時假資料，未來可從後端 API 取得
  const [completed, setCompleted] = useState(0);
  const [correctRate, setCorrectRate] = useState(0);
  const totalRequired = 50;
  const level = getLevel(completed);
  const progressPercent = Math.min((completed / totalRequired) * 100, 100);
  const recentMistakes = ["environment", "delicious", "opportunity"];



useEffect(() => {
  api.get("/api/user").then((res) => {
    setUsername(res.data.username);
    if (res.data.avatar) {
      setAvatar(`http://localhost:5000/static/avatars/${res.data.avatar}`);
    }
  });

  api.get("/api/quiz/stats").then((res) => {
    setCompleted(res.data.completed);
    setCorrectRate(res.data.accuracy);
  });
}, []);

  useEffect(() => {
    api.get("/api/user")
      .then((res) => {
        setUsername(res.data.username);
        if (res.data.avatar) {
          setAvatar(`http://localhost:5000/static/avatars/${res.data.avatar}`);
        }
      });
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);

      api.post("/api/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((res) => {
        const avatarPath = res.data.avatarPath;
        setAvatar(`http://localhost:5000/static/avatars/${avatarPath}`);
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center w-full">
      {/* 頭像容器 */}
      <div
        className="relative mx-auto w-32 h-32 border-2 border-gray-300 rounded-md overflow-hidden group cursor-pointer"
        onClick={handleAvatarClick}
      >
        {avatar ? (
          <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            頭像
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          點擊上傳頭像
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* 名稱與等級 */}
      <h2 className="text-xl font-bold mt-4">{username}</h2>
      <p className="text-base text-gray-500">排行榜名次：尚無資料</p>
      <p className="text-base text-blue-600 font-semibold mt-2">{level}</p>

      {/* 進度條 */}
      <div className="mt-4 text-base text-gray-500">學習進度：{completed} / {totalRequired}</div>
      <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* 額外統計 */}
      <div className="mt-6 text-base space-y-2 text-left">
        <div>✔️ 測驗完成次數：{completed}</div>
        <div>🎯 正確率：{correctRate}%</div>
      </div>
      <div className="mt-6 text-left">
        <h3 className="text-base font-semibold text-red-600 mb-2">🧠 最近錯誤單字</h3>
        <ul className="text-base text-gray-700 list-disc list-inside space-y-1">
          {recentMistakes.map((word, index) => (
            <li key={index}>{word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserProfileCard;
