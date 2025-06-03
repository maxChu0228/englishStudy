import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';
import { Pencil } from "lucide-react";

function CheckInCard({ checkIns = [], tasks = {}, dailyGoals = [], onEditGoal }) {
  const today = new Date().toISOString().split("T")[0];
  const todayProgress = tasks[today] || {}; // e.g., { goalId1: 100, goalId2: 60 }

  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    const progressMap = tasks[dateStr] || {};
    const allDone = Object.values(progressMap).length > 0 && Object.values(progressMap).every(v => v >= 100);
    return allDone ? "calendar-complete" : null;
  };

  const getGoalLabel = (goal) => {
    if (goal.type === "accuracy") {
      return `最近 ${goal.count} 次測驗正確率 ≥ ${goal.accuracy}%`;
    } else {
      return `完成 ${goal.count} 次${getTypeLabel(goal.type)}測驗`;
    }
  };

  const getTypeLabel = (type) => {
    if (type === "advancedQuiz") return "進階";
    if (type === "easyQuiz") return "基礎";
    return "";
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 bg-white p-4 rounded-xl relative">
      {/* 📅 日曆 */}
      <div className="md:w-1/2 flex justify-center items-center">
        <Calendar
          tileClassName={tileClassName}
          locale="en-US"
          formatShortWeekday={(locale, date) =>
            date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3)
          }
          formatMonthYear={(locale, date) =>
            date.toLocaleDateString("en-US", { month: "long" })
          }
          showNeighboringMonth={false}
          className="rounded-xl border-0 shadow-inner"
        />
      </div>

      {/* 🎯 任務 */}
      <div className="md:w-1/2 relative">
        <h2 className="text-lg font-semibold text-pink-600 mb-4 flex items-center justify-between">
          🎯 今日任務
          <button
            className="text-gray-500 hover:text-black text-sm"
            onClick={onEditGoal}
          >
            <Pencil size={16} className="inline-block mr-1" /> 設定 / 新增目標
          </button>
        </h2>

        {dailyGoals.length > 0 ? (
          <div className="space-y-4">
            {dailyGoals.map((goal) => (
              <TaskItem
                key={goal.id}
                label={getGoalLabel(goal)}
                progress={todayProgress[goal.id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-xl">
            <button
              onClick={onEditGoal}
              className="bg-pink-600 text-white px-4 py-2 rounded shadow-md hover:bg-pink-700"
            >
              點此設定今日目標
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskItem({ label, progress }) {
  const percent = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <span className="text-base font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${percent >= 100 ? "text-green-600" : "text-gray-400"}`}>
          {percent}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}

export default CheckInCard;
