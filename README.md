# 進到專案根目錄（含 app.py 的那層）

python -m venv venv

# Windows

venv\Scripts\activate

# macOS / Linux

source venv/bin/activate

pip install -r requirements.txt

# 第一次啟動時會自動建立 vocab.db

# 啟動

後端
source venv/bin/activate
Windows 則用 venv\Scripts\activate

python app.py

前端
cd frontend
npm start
