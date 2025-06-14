import { useEffect, useState } from "react";
import CheckInCard from "./CheckInCard";
import DailyGoalModal from "./DailyGoalModal";
import api from "../api";

function LearningStatsCard({ checkIns = [], setCheckIns }) {
  const [dailyGoals, setDailyGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tasksState, setTasksState] = useState({});
  const [completedDates, setCompletedDates] = useState([]);

  useEffect(() => {
    api.get("/api/daily-goal").then((res) => {
      if (Array.isArray(res.data)) {
        setDailyGoals(res.data);
      }
    });

    api.get("/api/daily-goal/history")
      .then((res) => {
        if (Array.isArray(res.data)) {
          // res.data example: ["2025-06-01", "2025-06-03"]
          setCompletedDates(res.data);
        }
      })
      .catch((err) => {
        console.error("取得歷史完成日期失敗", err);
        setCompletedDates([]);
      });
  }, []);

  useEffect(() => {
    if (dailyGoals.length === 0) {
      setTasksState({});
      return;
    }

    api.get("/api/daily-goal/progress")
      .then((res) => {
        if (!Array.isArray(res.data)) return;
        const todayStr = new Date().toISOString().split("T")[0];
        const newMap = {};
        newMap[todayStr] = {};

        res.data.forEach((p) => {
          newMap[todayStr][p.goal_id] = p;
        });

        setTasksState(newMap);
      })
      .catch((err) => {
        console.error("取得進度失敗", err);
        setTasksState({});
      });
  }, [dailyGoals]);

  const handleSaveGoal = () => {
    api.get("/api/daily-goal")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDailyGoals(res.data);
        }
      })
      .catch((err) => {
        alert("重新取得目標失敗: " + err.message);
      });

    api.get("/api/daily-goal/history")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCompletedDates(res.data);
        }
      })
      .catch((err) => {
        console.error("取得歷史完成日期失敗", err);
      });

    setShowGoalModal(false);
  };

  return (
    <div className="relative">
      <CheckInCard
        checkIns={checkIns}
        setCheckIns={setCheckIns}
        tasks={tasksState}
        dailyGoals={dailyGoals}
        completedDates={completedDates}
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
