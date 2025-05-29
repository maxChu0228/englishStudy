import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';

function CheckInCard({ checkIns = [], tasks = {} }) {
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks[today] || {
    advancedQuiz: false,
    accuracyOver70: false
  };

const tileClassName = ({ date }) => {
  const dateStr = date.toISOString().split("T")[0];
  const dayTasks = tasks[dateStr] || {};

  // ✅ 確保只有「所有任務都完成」才標記
  const allDone = Object.values(dayTasks).length > 0 && Object.values(dayTasks).every(v => v === true);

  return allDone ? "calendar-complete" : null;
};



  return (
    <div className="w-full flex flex-col md:flex-row gap-6 bg-white p-4 rounded-xl ">
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
      <div className="md:w-1/2">
        <h2 className="text-lg font-semibold text-pink-600 mb-4">🎯 今日任務</h2>
        <div className="space-y-4">
          <TaskItem label="完成 3 次進階測驗" done={todayTasks.advancedQuiz} />
          <TaskItem label="答對率 ≥ 70%" done={todayTasks.accuracyOver70} />
        </div>
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
