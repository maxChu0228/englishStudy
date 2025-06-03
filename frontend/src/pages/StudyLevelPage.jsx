import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Star, StarOff } from "lucide-react";
import api from "../api";

function StudyLevelPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const level = queryParams.get("type") || "easy";

  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState("card"); // card or list
  const [favoritedWordIds, setFavoritedWordIds] = useState(new Set());

  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);
  

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/words?level=${level}`, { withCredentials: true })
      .then((res) => setWords(res.data))
      .catch((err) => console.error("無法取得單字", err));

    axios
      .get("http://localhost:5000/api/favorites", { withCredentials: true })
      .then((res) => {
        const ids = res.data.map((w) => w.id);
        setFavoritedWordIds(new Set(ids));
      })
      .catch((err) => console.error("無法取得收藏", err));
  }, [level]);

  const toggleFavorite = async (wordId) => {
    const updated = new Set(favoritedWordIds);

    if (updated.has(wordId)) {
      try {
        await axios.delete(`http://localhost:5000/api/favorites/${wordId}`, {
          withCredentials: true,
        });
        updated.delete(wordId);
      } catch (err) {
        console.error("取消收藏失敗", err);
      }
    } else {
      try {
        await axios.post(
          "http://localhost:5000/api/favorites",
          { word_id: wordId },
          { withCredentials: true }
        );
        updated.add(wordId);
      } catch (err) {
        console.error("加入收藏失敗", err);
      }
    }

    setFavoritedWordIds(updated);
  };

  const nextWord = () => {
    setIndex((prev) => (prev + 1) % words.length);
  };

  return (
    <>
      <Navbar />
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {level === "starred" ? "⭐ 我的收藏" : `📘 背單字 - ${level} 等級`}
        </h2>

        <div className="mb-6">
          <button
            onClick={() => setMode("card")}
            className={`mx-2 px-4 py-2 rounded ${mode === "card" ? "bg-green-500 text-white" : "bg-gray-200"}`}
          >
            卡片模式
          </button>
          <button
            onClick={() => setMode("list")}
            className={`mx-2 px-4 py-2 rounded ${mode === "list" ? "bg-green-500 text-white" : "bg-gray-200"}`}
          >
            單字列表
          </button>
        </div>

        {words.length === 0 ? (
          <div>載入中...</div>
        ) : mode === "card" ? (
          <div className="relative max-w-md mx-auto bg-white border-2 border-green-400 rounded-xl shadow-md p-6">
            <button
              onClick={() => toggleFavorite(words[index].id)}
              className="absolute top-4 right-4 text-yellow-500 hover:scale-110 transition-transform"
              title={favoritedWordIds.has(words[index].id) ? "取消收藏" : "加入收藏"}
            >
              {favoritedWordIds.has(words[index].id) ? (
                <Star fill="currentColor" stroke="currentColor" size={26} />
              ) : (
                <StarOff size={26} />
              )}
            </button>

            <h3 className="text-3xl font-bold mb-2">{words[index].word}</h3>
            <p className="text-lg text-gray-700">{words[index].meaning}</p>
            <button
              onClick={nextWord}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              下一個單字
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-left">
            <table className="w-full border border-gray-300 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border-b w-[50px] text-center">⭐</th>
                  <th className="p-2 border-b">英文單字</th>
                  <th className="p-2 border-b">中文意思</th>
                </tr>
              </thead>
              <tbody>
                {words.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="p-2 border-b text-center">
                      <button
                        onClick={() => toggleFavorite(w.id)}
                        className="text-yellow-500 hover:scale-110 transition-transform"
                        title={favoritedWordIds.has(w.id) ? "取消收藏" : "加入收藏"}
                      >
                        {favoritedWordIds.has(w.id) ? (
                          <Star fill="currentColor" stroke="currentColor" size={22} />
                        ) : (
                          <StarOff size={22} />
                        )}
                      </button>
                    </td>
                    <td className="p-2 border-b font-semibold">{w.word}</td>
                    <td className="p-2 border-b">{w.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default StudyLevelPage;
