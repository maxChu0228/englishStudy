import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    api.get("/api/check-session")
      .then((res) => {
        if (res.data.loggedIn) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  return (
    <>
      <Navbar />

      <div
        className="min-h-[calc(100vh-60px)] flex items-start justify-center pt-20 px-6 bg-cover bg-no-repeat bg-bottom"
        style={{ backgroundImage: "url('/background.png')" }}
      >
        {/* 左側內容 */}
        <div className="flex-1 max-w-4xl flex flex-col justify-center gap-6 pl-8">
          <img src="/logo.png" alt="VocaPlay Logo" className="h-32 w-64" />

          <h1 className="text-5xl font-bold text-gray-900">提升你的單字力</h1>
          <h2 className="text-2xl font-bold text-blue-600">從基礎到進階，打造專屬學習路線</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            VocaPlay 是一個幫助你透過遊戲方式學習英文單字的互動平台。從日常單字到多益考題，
            讓學習變得輕鬆又有趣。
            <br />立即開始你的英文挑戰旅程！
          </p>

          <Link
            to={isLoggedIn ? "/dashboard" : "/login"}
            className="mt-4 inline-flex items-center justify-center text-white font-bold text-lg px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-lg hover:from-blue-700 hover:to-cyan-500 transform hover:-translate-y-1 transition-all"
          >
            <span className="text-center">🚀開始學習之旅</span>
          </Link>
        </div>

        {/* 右側插圖 */}
        <div className="flex-1 flex items-center justify-center pl-4">
          <img
            src="/wordpic.png"
            alt="學習插圖"
            className="max-h-[70vh] w-full object-contain"
          />
        </div>
      </div>
    </>
  );
}

export default HomePage;
