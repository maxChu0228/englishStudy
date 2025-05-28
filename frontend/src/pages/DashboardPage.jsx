// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import UserProfileCard from "../components/UserProfileCard";
import LevelCard from "../components/LevelCard";
import CheckInCard from "../components/CheckInCard";
import DailyCorrectChart from "../components/DailyCorrectChart";
import LearningStatsCard from "../components/LearningStatsCard";

function DashboardPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.get("/api/check-session")
      .then((res) => {
        if (res.data.loggedIn) {
          setChecking(false);
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  if (checking) return <div>載入中...</div>;

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-120px)] w-full px-6 pt-3 gap-6">
        {/* 左側：使用者資訊卡 */}
        <div className="w-1/3 flex justify-center">
          <div className="w-full max-w-sm">
            <UserProfileCard />
          </div>
        </div>

        {/* 右側：學習功能區（可滾動） */}
        <div className="w-2/3 overflow-y-auto pr-4">
          <div className="flex flex-col gap-8">
            
            {/* 📝 測驗區塊 */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-blue-700">📝 測驗模式</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <LevelCard
                  title="初級關卡"
                  description="常見基本單字，適合新手"
                  level="easy"
                  type="quiz"
                  locked={false}
                />
                <LevelCard
                  title="進階關卡"
                  description="需完成初級才能解鎖"
                  level="medium"
                  type="quiz"
                  locked={true}
                />
                <LevelCard
                  title="挑戰關卡"
                  description="最高難度，限高手挑戰"
                  level="hard"
                  type="quiz"
                  locked={true}
                />
              </div>
            </section>

            {/* 📚 背單字區塊 */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-green-700">📚 背單字模式</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <LevelCard
                  title="常見單字"
                  description="適合打基礎"
                  level="common"
                  type="study"
                  locked={false}
                />
                <LevelCard
                  title="我的收藏"
                  description="你標記過的重要單字"
                  level="starred"
                  type="study"
                  locked={false}
                />
                <LevelCard
                  title="高頻單字"
                  description="TOEIC / IELTS 常見單字"
                  level="frequent"
                  type="study"
                  locked={false}
                />
              </div>
            </section>
            <LearningStatsCard />

          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
