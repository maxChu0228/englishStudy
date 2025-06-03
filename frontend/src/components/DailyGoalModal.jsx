import { useState } from "react";

function DailyGoalModal({ onClose, onSave, dailyGoals = [] }) {
  const [type, setType] = useState("advancedQuiz");
  const [count, setCount] = useState(3);
  const [accuracy, setAccuracy] = useState(70);

 const handleSubmit = (e) => {
    e.preventDefault();
    const goal = { type, count };
    if (type === "accuracy") goal.accuracy = accuracy;

    // 查找是否已有相同 type 的目標
    const existingGoal = dailyGoals.find(g => g.type === type);

    const endpoint = existingGoal
      ? `/api/daily-goal/update/${existingGoal.id}`
      : `/api/daily-goal/add`;

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goal),
    })
      .then((res) => {
        if (!res.ok) throw new Error("儲存失敗");
        return res.json();
      })
      .then(() => {
        onSave(); // 通知父層刷新
        onClose();
      })
      .catch((err) => {
        alert("儲存失敗: " + err.message);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[480px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">新增任務目標</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">任務類型：</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="advancedQuiz">完成進階測驗</option>
              <option value="easyQuiz">完成基礎測驗</option>
              <option value="accuracy">最近 N 次測驗答對率</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">次數 (N)：</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
              min={1}
              required
            />
          </div>

          {type === "accuracy" && (
            <div>
              <label className="block mb-1">答對率門檻 (%)：</label>
              <input
                type="number"
                value={accuracy}
                onChange={(e) => setAccuracy(parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
                min={1}
                max={100}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              新增目標
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DailyGoalModal;
