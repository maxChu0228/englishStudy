import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import LeaderboardIcon from "@mui/icons-material/EmojiEvents"; 
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export default function AdvancedLeaderboard({
  initialPage = 1,
  pageSize = 10,
  minAccuracy = 10,
  minQuizzes = 5,
}) {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    api
      .get("/api/leaderboard/advanced", {
        params: {
          page,
          limit: pageSize,
          min_accuracy: minAccuracy,
          min_quizzes: minQuizzes,
        },
      })
      .then((res) => setList(res.data))
      .catch(console.error);
  }, [page, pageSize, minAccuracy, minQuizzes]);

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <LeaderboardIcon className="text-pink-600" fontSize="large" />
            <h1 className="ml-3 text-2xl font-semibold">排行榜</h1>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-gray-600">排名</th>
                  <th className="py-2 px-3 text-gray-600">使用者</th>
                  <th className="py-2 px-3 text-gray-600">測驗次數</th>
                  <th className="py-2 px-3 text-gray-600">平均正確率</th>
                  <th className="py-2 px-3 text-gray-600">加權分數</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.user_id} className="even:bg-gray-50 hover:bg-gray-100">
                    <td className="py-2 px-3">{u.rank}</td>
                    <td className="py-2 px-3">{u.username}</td>
                    <td className="py-2 px-3">{u.quiz_count}</td>
                    <td className="py-2 px-3">{u.accuracy}%</td>
                    <td className="py-2 px-3">{u.weighted_score}</td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      暫無排行榜資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-full bg-pink-100 text-pink-600 disabled:opacity-50"
            >
              <ArrowLeftIcon />
            </button>
            <span className="text-gray-700">第 {page} 頁</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-full bg-pink-100 text-pink-600"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
