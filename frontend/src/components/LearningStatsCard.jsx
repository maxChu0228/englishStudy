import { useEffect, useState } from "react";
import CheckInCard from "./CheckInCard";
import DailyGoalModal from "./DailyGoalModal";
import api from "../api";

function LearningStatsCard({ checkIns = [], tasks = {}, setCheckIns }) {
  const [dailyGoals, setDailyGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // 取得當前目標列表
  useEffect(() => {
    api.get("/api/daily-goal").then((res) => {
      if (Array.isArray(res.data)) {
        setDailyGoals(res.data);
      }
    });
  }, []);

const handleSaveGoal = () => {
  api.get("/api/daily-goal") // ❗改成純刷新，不再負責新增
    .then((res) => {
      if (Array.isArray(res.data)) {
        setDailyGoals(res.data);
      }
      setShowGoalModal(false);
    })
    .catch((err) => {
      alert("重新取得目標失敗: " + err.message);
    });
};


  return (
    <div className="relative">
      <CheckInCard
        checkIns={checkIns}
        setCheckIns={setCheckIns}
        tasks={tasks}
        dailyGoals={dailyGoals}
        onEditGoal={() => setShowGoalModal(true)}
      />

      {showGoalModal && (
        <DailyGoalModal
          dailyGoals={dailyGoals}
          onSave={handleSaveGoal}
          onClose={() => setShowGoalModal(false)}
        />
      )}
    </div>
  );
}

export default LearningStatsCard;
