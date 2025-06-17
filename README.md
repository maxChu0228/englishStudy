# English Study 英文單字學習平台

這是一個互動式英文單字學習網站，結合每日任務打卡、測驗與背單字功能，幫助使用者提升學習效率與維持穩定進度。

## 🧩 功能簡介

- 🔐 **使用者登入系統**：支援帳號密碼登入、註冊與個人頭像上傳。
- 🏠 **Dashboard 主頁**：
  - 顯示學習進度、測驗正確率、個人等級與任務紀錄。
  - 支援每日打卡與學習任務追蹤（如進階測驗次數與正確率）。
- 🧠 **測驗模式**：
  - 提供 Easy / Advanced / Mixed 三種難度。
  - 支援即時回饋與錯題紀錄。
- 📚 **背單字模式**：
  - 單字依照 CEFR 難度分類。
- ⭐ **收藏功能**：將錯誤或需複習的單字加入收藏清單。
- 📊 **排行榜功能**：
  - 根據答題數量與正確率計算加權分數進行排序，促進學習動力。
- 📆 **每日任務系統**：
  - 可自訂任務目標（完成次數、正確率目標等）。
  - 完成後自動標記日曆，提升持續學習意願。

## 🛠️ 技術架構

- 前端：React + Tailwind CSS + Material UI
- 後端：Flask + SQLite
- API：RESTful API 串接前後端邏輯

## 🚀 專案啟動方式

### 1. 安裝依賴

```bash
# 建立並啟動虛擬環境（Windows）
python -m venv .venv
.venv\Scripts\activate

# 安裝後端需求
pip install -r backend/requirements.txt

# 安裝前端需求
cd frontend
npm install
```

### 2. 同時啟動前後端

```bash
cd frontend
npm start
```

這會透過 `concurrently` 指令同時啟動：

- `npm run start:backend` → 啟動 Flask API
- `npm run start:frontend` → 啟動 React 網頁介面

### 📦 資料庫初始化

當你首次執行伺服器時，系統會自動檢查 `vocab.db` 是否存在。若不存在，會自動建立資料表並插入範例單字資料。

你無需手動執行 SQL 指令，首次執行後就會看到提示：

[系統] 資料庫不存在，正在初始化 vocab.db...
[系統] 已插入 7 筆範例單字。
[系統] 資料庫初始化完成。

📌 注意：`vocab.db` 已加入 `.gitignore`，請依照上述步驟啟動以自動產生。

## 📂 專案結構（簡略）

```
englishStudy/
├── backend/          # Flask API 後端
├── frontend/         # React 前端
├── database/         # SQLite 資料與模型
├── public/           # 圖片與 LOGO 靜態資源
├── README.md         # 本文件
```

## 🙋‍♂️ 作者

- 👤 [@maxChu0228](https://github.com/maxChu0228) - 全端開發、介面設計與功能規劃
