import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css';

function CheckInCard({ checkIns = [], setCheckIns = () => {} }) {
  const today = new Date().toISOString().split("T")[0];
  const [hasCheckedIn, setHasCheckedIn] = useState(checkIns.includes(today));
  const [showCalendar, setShowCalendar] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    calculateStreak();
  }, [checkIns]);

  const calculateStreak = () => {
    let count = 0;
    let d = new Date(today);
    while (checkIns.includes(d.toISOString().split("T")[0])) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    setStreak(count);
  };

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    const newList = [...checkIns, today];
    setCheckIns(newList);
    setHasCheckedIn(true);
  };

  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    return checkIns.includes(dateStr) ? "highlight" : null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-pink-600">📅 每日打卡</h3>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="text-xs text-blue-500 underline"
        >
          {showCalendar ? "隱藏日曆" : "顯示日曆"}
        </button>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={hasCheckedIn}
        className={`mb-2 px-4 py-1 text-sm text-white rounded ${
          hasCheckedIn ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {hasCheckedIn ? "今天已打卡 ✔" : "點我打卡"}
      </button>

      <p className="text-sm">✅ 連續打卡：{streak} 天</p>
      <p className="text-sm">📊 總打卡次數：{checkIns.length} 天</p>

      {showCalendar && (
        <div className="mt-3">
          <Calendar tileClassName={tileClassName} locale="zh-TW" />
        </div>
      )}
    </div>
  );
}

export default CheckInCard;
