from flask import Flask, request, redirect, session, jsonify, make_response
import os
from werkzeug.utils import secure_filename
import sqlite3
import random
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "my_english_game_123"  # session 加密金鑰

# ✅ 開啟 CORS 支援跨域 Cookie
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# 🔹 登入 API
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = sqlite3.connect("vocab.db")
    c = conn.cursor()
    c.execute("SELECT username, role FROM users WHERE username=? AND password=?", (username, password))
    user = c.fetchone()
    conn.close()

    if user:
        session["user"] = user[0]
        session["role"] = user[1]
        return jsonify({"message": "登入成功"})
    else:
        return jsonify({"error": "帳號或密碼錯誤"}), 401

# 🔹 登出 API
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    response = make_response(jsonify({"message": "已登出"}))
    response.set_cookie("session", "", expires=0)  # 清除 cookie 名稱依你設定為主
    return response

# 🔹 使用者資訊 API
@app.route("/api/user")
def get_user():
    if "user" in session:
        conn = sqlite3.connect("vocab.db")
        c = conn.cursor()
        c.execute("SELECT username, role, avatar_path FROM users WHERE username=?", (session["user"],))
        row = c.fetchone()
        conn.close()
        return jsonify({
            "username": row[0],
            "role": row[1],
            "avatar": row[2]  # 新增這行
        })
    else:
        return jsonify({"error": "未登入"}), 401


# 🔹 Session 驗證 API（給 React 用）
@app.route("/api/check-session")
def check_session():
    if "user" in session:
        return jsonify({"loggedIn": True})
    else:
        return jsonify({"loggedIn": False})

# 🔹 題目 API（需登入）
@app.route("/api/question")
def get_question():
    if "user" not in session:
        return jsonify({"error": "未登入"}), 401

    conn = sqlite3.connect("vocab.db")
    c = conn.cursor()
    c.execute("SELECT word, correct, wrong1, wrong2, wrong3 FROM words ORDER BY RANDOM() LIMIT 1")
    row = c.fetchone()
    conn.close()

    if row:
        word, correct, *wrongs = row
        choices = wrongs + [correct]
        random.shuffle(choices)
        return jsonify({
            "word": word,
            "choices": choices,
            "answer": correct
        })
    else:
        return jsonify({"error": "無資料"})
    
# 圖片上傳
UPLOAD_FOLDER = "static/avatars"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/api/upload-avatar", methods=["POST"])
def upload_avatar():
    if "user" not in session:
        return jsonify({"error": "未登入"}), 401

    file = request.files.get("avatar")
    if not file or not allowed_file(file.filename):
        return jsonify({"error": "不合法的檔案"}), 400

    # 儲存檔案
    filename = secure_filename(session["user"] + "_" + file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # 存進 DB
    conn = sqlite3.connect("vocab.db")
    c = conn.cursor()
    c.execute("UPDATE users SET avatar_path=? WHERE username=?", (filename, session["user"]))
    conn.commit()
    conn.close()

    return jsonify({"message": "上傳成功", "avatarPath": filename})



# 🔹 預設路由（可以不寫，React 前端處理）
@app.route("/")
def root():
    return jsonify({"message": "伺服器運作中"})

if __name__ == "__main__":
    app.run(debug=True)
