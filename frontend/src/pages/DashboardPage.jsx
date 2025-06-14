import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import UserProfileCard from "../components/UserProfileCard";
import LevelCard from "../components/LevelCard";
import LearningStatsCard from "../components/LearningStatsCard";

function DashboardPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  const [checkIns, setCheckIns] = useState(["2025-05-28", "2025-05-29"]);
  const [tasks, setTasks] = useState({
    "2025-05-29": {
      advancedQuiz: true,
      accuracyOver70: false,
    },
  });

  useEffect(() => {
    api
      .get("/api/check-session")
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
      <div className="bg-[#f5f6f8] min-h-screen w-full px-4 pt-6 pb-12">
        <div className="flex max-w-[1440px] mx-auto gap-4 justify-between items-stretch">
          <div className="w-[25%] min-h-[620px]">
            <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm h-full">
              <UserProfileCard />
            </div>
          </div>

          <div className="w-[50%] flex flex-col gap-4 min-h-[620px]">
            <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm w-full">
              <LearningStatsCard
                checkIns={checkIns}
                setCheckIns={setCheckIns}
                tasks={tasks}
              />
            </div>
            <div className="bg-white border border-blue-100 rounded-xl p-10 shadow-sm w-full">
              <h2 className="text-xl font-bold mb-4 text-blue-700">📝 測驗模式</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <LevelCard
                  title="基礎模式"
                  description="常見基本單字，適合新手"
                  level="easy"
                  type="quiz"
                  locked={false}
                  onClick={() => navigate("/game?level=easy")}
                />
                <LevelCard
                  title="進階模式"
                  description="挑戰進階單字，更具難度"
                  level="medium"
                  type="quiz"
                  locked={false}
                  onClick={() => navigate("/game?level=medium")}
                />
                <LevelCard
                  title="混合模式"
                  description="隨機抽題，自由發揮"
                  level="mixed"
                  type="quiz"
                  locked={false}
                  onClick={() => navigate("/game?level=mixed")}
                />
              </div>
            </div>
          </div>

          <div className="w-[25%] min-h-[620px]">
            <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm h-full">
              <h2 className="text-xl font-bold mb-4 text-green-700">📚 背單字模式</h2>
              <div className="flex flex-col gap-4">
                <LevelCard
                  title="基礎單字"
                  description="適合打基礎"
                  level="easy"
                  type="study"
                  locked={false}
                />
                <LevelCard
                  title="進階單字"
                  description="適合程度較好的學生"
                  level="medium"
                  type="study"
                  locked={false}
                />
                <LevelCard
                  title="我的收藏"
                  description="你標記過的重要單字"
                  level="starred"
                  type="study"
                  locked={false}
                  onClick={() => navigate("/study?type=starred")}
                />
                <LevelCard
                  title="高頻單字"
                  description="TOEIC / IELTS 常見單字"
                  level="frequent"
                  type="study"
                  locked={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
