import { useState, useEffect, useRef } from "react";
import api from "../api";

// 定義等級與門檻
const LEVELS = [
  { name: "Lv. 1 - 初學者",     threshold: 0   },
  { name: "Lv. 2 - 穩定進步中", threshold: 50  },
  { name: "Lv. 3 - 熟練學習者", threshold: 100 },
  { name: "Lv. 4 - 單字強者",   threshold: 150 },
  { name: "Lv. 5 - 單字王者",   threshold: 200 }
];

// 取得目前等級的索引
function getLevelIndex(completed) {
  const idx = LEVELS.findIndex(l => completed < l.threshold);
  return idx === -1 ? LEVELS.length - 1 : Math.max(0, idx - 1);
}

// 回傳等級名稱
function getLevelName(completed) {
  return LEVELS[getLevelIndex(completed)].name;
}

// 取得升到下一級需要的累積次數
function getNextThreshold(completed) {
  const idx = getLevelIndex(completed);
  if (idx === LEVELS.length - 1) {
    // 已最高級
    return LEVELS[idx].threshold;
  }
  return LEVELS[idx + 1].threshold;
}

export default function UserProfileCard() {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef();

  const [completed, setCompleted] = useState(0);
  const [correctRate, setCorrectRate] = useState(0);
  const [recentMistakes, setRecentMistakes] = useState([]);
  const [myRankData, setMyRankData] = useState(null);

  // 從後端抓基本資料與統計
useEffect(() => {
  api.get("/api/user").then(({ data }) => {
    setUsername(data.username);
    if (data.avatar) {
      setAvatar(`${api.defaults.baseURL}/static/avatars/${data.avatar}`);
    }
  });

  api.get("/api/quiz/stats").then(({ data }) => {
    setCompleted(data.completed);
    setCorrectRate(data.accuracy);
  });

  api.get("/api/leaderboard/advanced/me", {
    params: { min_accuracy: 10, min_quizzes: 5 }
  }).then(({ data }) => setMyRankData(data))
    .catch(console.error);

  api.get("/api/quiz/mistakes")
    .then(({ data }) => setRecentMistakes(data))
    .catch(console.error);
}, []);
          
  // 計算等級與進度
  const levelName = getLevelName(completed);
  const totalRequired = getNextThreshold(completed);
  const progressPercent = Math.min((completed / totalRequired) * 100, 100);

  // 頭像上傳
  const handleAvatarClick = () => fileInputRef.current.click();
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    api.post("/api/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }).then(res => {
      setAvatar(`http://localhost:5000/static/avatars/${res.data.avatarPath}`);
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center w-full max-w-md mx-auto">
      {/* 頭像 */}
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
      <p className="text-base text-gray-500">
        排行榜名次：
        {myRankData?.rank
          ? `第 ${myRankData.rank} 名`
          : myRankData?.message || "尚無資料"}
      </p>
      <p className="text-base text-blue-600 font-semibold mt-2">{levelName}</p>

      {/* 進度條 */}
      <div className="mt-4 text-base text-gray-500">
        學習進度：{completed} / {totalRequired}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 額外統計 */}
      <div className="mt-6 text-base space-y-2 text-left">
        <div>✔️ 測驗完成次數：{completed}</div>
        <div>🎯 正確率：{correctRate}%</div>
      </div>

      {/* 最近錯誤 */}
      <div className="mt-6 text-left">
        <h3 className="text-base font-semibold text-red-600 mb-2">🧠 最近錯誤單字</h3>
        <ul className="text-base text-gray-700 list-disc list-inside space-y-1">
          {recentMistakes.map((word, idx) => (
            <li key={idx}>{word}</li>   
          ))}
        </ul>
      </div>
    </div>
  );
}
