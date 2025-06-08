import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-custom.css";
import { Pencil } from "lucide-react";

function CheckInCard({
  checkIns = [],
  tasks = {},
  dailyGoals = [],
  completedDates = [],  // ➊ 新增 prop：過去已完成目標的日期清單
  onEditGoal
}) {
  const today = new Date().toISOString().split("T")[0];
  const todayMap = tasks[today] || {};

  // ➋ 修改 tileClassName：如果 dateStr 在 completedDates 裡，就標綠
  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    if (completedDates.includes(dateStr)) {
      return "calendar-complete"; // 這個 CSS class 要自行在 calendar-custom.css 裡定義（參考後面）
    }
    return null;
  };

  const getTypeLabel = (type) => {
    if (type === "advancedQuiz") return "進階";
    if (type === "easyQuiz") return "基礎";
    return "";
  };

  const getTaskInfo = (goal) => {
    const info = todayMap[goal.id] || {};
    if (goal.type === "easyQuiz" || goal.type === "advancedQuiz") {
      const done = info.done_count || 0;
      const target = goal.count;
      const percent = Math.round((done / target) * 100);
      return {
        label: `完成 ${target} 次${getTypeLabel(goal.type)}測驗`,
        done,
        target,
        percent: Math.min(100, Math.max(0, percent)),
        completed: info.completed || false
      };
    } else {
      const done = info.done_count || 0;
      const target = goal.count;
      const percent = Math.round((done / target) * 100);
      const currentAcc = info.current_accuracy || 0;
      const accuracyMet = info.accuracyMet || false;
      return {
        label: `最近 ${target} 次測驗平均正確率 ≥ ${goal.accuracy}%`,
        done,
        target,
        percent: Math.min(100, Math.max(0, percent)),
        currentAcc,
        accuracyMet,
        completed: info.completed || false
      };
    }
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

      {/* 🎯 任務區塊 */}
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
            {dailyGoals.map((goal) => {
              const info = getTaskInfo(goal);

              if (goal.type === "accuracy") {
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="text-base font-medium text-gray-700">
                      {info.label}
                    </div>
                    <div className="text-sm font-semibold text-gray-400">
                      {info.done}/{info.target} （平均 {info.currentAcc}%）
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          info.completed
                            ? "bg-green-500"
                            : info.currentAcc >= goal.accuracy
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${info.percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-base font-medium text-gray-700">
                      {info.label}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        info.completed ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {info.done}/{info.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${info.percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
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

export default CheckInCard;
