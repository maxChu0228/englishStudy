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
    c.execute("SELECT id, username, role FROM users WHERE username=? AND password=?", (username, password))
    user = c.fetchone()
    conn.close()

    if user:
        session["user_id"] = user[0] 
        session["user"] = user[1]
        session["role"] = user[2]
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

#註冊
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "請填入帳號與密碼"}), 400

    conn = sqlite3.connect("vocab.db")
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", (username, password, "user"))
        conn.commit()
        conn.close()
        return jsonify({"message": "註冊成功"})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "帳號已存在"}), 409

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


def get_db_connection():
    conn = sqlite3.connect("vocab.db")
    conn.row_factory = sqlite3.Row
    return conn

# 🔹 題目 API（需登入）
@app.route("/api/quiz", methods=["GET"])
def get_quiz_questions():
    level = request.args.get("level", "easy")
    count = int(request.args.get("count", 1))

    conn = get_db_connection()
    words = conn.execute("SELECT * FROM words WHERE level=?", (level,)).fetchall()
    conn.close()

    if len(words) < count:
        return jsonify({"error": f"{level} 題庫不足，至少需要 {count} 筆單字"}), 400

    # 將資料轉為 list of dict（sqlite3.Row 轉換）
    all_words = [dict(w) for w in words]
    random.shuffle(all_words)

    questions = []

    used_ids = set()

    for word in all_words:
        if word["id"] in used_ids:
            continue

        correct = word
        used_ids.add(correct["id"])

        # 準備選項池
        wrong_pool = [
            w["meaning"] for w in all_words
            if w["id"] != correct["id"]
            and w["meaning"] is not None
            and w["meaning"].strip() != ""
            and w["meaning"].strip() != correct["meaning"].strip()
        ]

        if len(wrong_pool) < 3:
            continue  # 無法組成有效選項就略過

        options = random.sample(wrong_pool, 3) + [correct["meaning"]]
        random.shuffle(options)

        questions.append({
            "word": correct["word"],
            "choices": options,
            "answer": correct["meaning"]
        })

        if len(questions) == count:
            break

    if len(questions) < count:
        return jsonify({"error": f"無法生成足夠的有效題目"}), 400

    return jsonify(questions)

#新增測驗紀錄
@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz_result():
    if "user_id" not in session:
        return jsonify({"error": "未登入"}), 401

    data = request.get_json()
    level = data.get("level")
    score = data.get("score")
    total = data.get("total")
    answers = data.get("answers", [])

    if not (level and isinstance(score, int) and isinstance(total, int) and isinstance(answers, list)):
        return jsonify({"error": "資料格式錯誤"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # 插入 quiz_records
    cursor.execute("""
        INSERT INTO quiz_records (user_id, level, score, total_questions)
        VALUES (?, ?, ?, ?)
    """, (session["user_id"], level, score, total))
    record_id = cursor.lastrowid

    # 插入 quiz_items
    for ans in answers:
        word = ans.get("word")
        correct = ans.get("correct")
        chosen = ans.get("chosen")
        is_correct = int(correct == chosen)

        if word and correct and chosen:
            cursor.execute("""
                INSERT INTO quiz_items (record_id, word, correct_answer, chosen_answer, is_correct)
                VALUES (?, ?, ?, ?, ?)
            """, (record_id, word, correct, chosen, is_correct))

    conn.commit()
    conn.close()

    return jsonify({"message": "紀錄已儲存"})

#查詢測驗紀錄
@app.route("/api/quiz/history", methods=["GET"])
def get_quiz_history():
    if "user_id" not in session:
        return jsonify({"error": "未登入"}), 401

    conn = get_db_connection()
    records = conn.execute("""
        SELECT id, level, score, total_questions, created_at
        FROM quiz_records
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    """, (session["user_id"],)).fetchall()
    conn.close()

    return jsonify([dict(r) for r in records])

#查詢單筆詳細記錄
@app.route("/api/quiz/result/<int:record_id>", methods=["GET"])
def get_quiz_result_detail(record_id):
    if "user_id" not in session:
        return jsonify({"error": "未登入"}), 401

    conn = get_db_connection()

    record = conn.execute(
        "SELECT * FROM quiz_records WHERE id=? AND user_id=?",
        (record_id, session["user_id"])
    ).fetchone()

    if not record:
        conn.close()
        return jsonify({"error": "找不到紀錄"}), 404

    # 🟡 ✅ 你要在這裡改「查答題細項」這一段 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    items = conn.execute("""
        SELECT qi.word, qi.correct_answer, qi.chosen_answer, qi.is_correct, w.id AS word_id
        FROM quiz_items qi
        JOIN words w ON qi.word = w.word
        WHERE qi.record_id = ?
    """, (record_id,)).fetchall()

    conn.close()

    return jsonify({
        "record": dict(record),
        "items": [dict(i) for i in items]  # 前端就能拿到 word_id
    })


#抓簡單單字
@app.route("/api/words", methods=["GET"])
def get_words():
    level = request.args.get("level", "easy")
    conn = get_db_connection()

    if level == "starred":
        if "user_id" not in session:
            return jsonify({"error": "未登入"}), 401

        words = conn.execute("""
            SELECT w.*
            FROM favorites f
            JOIN words w ON f.word_id = w.id
            WHERE f.user_id = ?
        """, (session["user_id"],)).fetchall()
    else:
        words = conn.execute("SELECT * FROM words WHERE level=?", (level,)).fetchall()

    conn.close()
    return jsonify([dict(w) for w in words])


#收藏單字
@app.route("/api/favorites", methods=["POST"])
def add_favorite():
    if "user_id" not in session:
        return jsonify({"error": "未登入"}), 401

    data = request.get_json()
    word_id = data.get("word_id")

    if not word_id:
        return jsonify({"error": "缺少單字 ID"}), 400

    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO favorites (user_id, word_id) VALUES (?, ?)", (session["user_id"], word_id))
        conn.commit()
        return jsonify({"message": "已加入收藏"})
    except sqlite3.IntegrityError:
        return jsonify({"message": "已經收藏過了"})
    finally:
        conn.close()

#抓收藏的單字
@app.route("/api/favorites", methods=["GET"])
def get_favorites():
    if "user_id" not in session:
        return jsonify({"error": "未登入"}), 401

    conn = get_db_connection()
    rows = conn.execute("""
        SELECT w.id, w.word, w.meaning, w.level
        FROM favorites f
        JOIN words w ON f.word_id = w.id
        WHERE f.user_id = ?
    """, (session["user_id"],)).fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])

#取消收藏
@app.route("/api/favorites/<int:word_id>", methods=["DELETE"])
def remove_favorite(word_id):
    if "user_id" not in session:
        return jsonify({"error": "未登入"}), 401

    conn = get_db_connection()
    conn.execute("DELETE FROM favorites WHERE user_id = ? AND word_id = ?", (session["user_id"], word_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "已取消收藏"})

#抓個人答題狀態
@app.route("/api/quiz/stats")
def get_quiz_stats():
    if "user_id" not in session:
        return jsonify({"error": "未登入"}), 401

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 取得該使用者的測驗資料
    cursor.execute("""
        SELECT COUNT(*) AS count, SUM(score) AS total_score, SUM(total_questions) AS total_questions
        FROM quiz_records
        WHERE user_id = ?
    """, (session["user_id"],))
    
    row = cursor.fetchone()
    conn.close()

    count = row["count"] or 0
    total_score = row["total_score"] or 0
    total_questions = row["total_questions"] or 0

    accuracy = round((total_score / total_questions) * 100, 1) if total_questions > 0 else 0

    return jsonify({
        "completed": count,
        "accuracy": accuracy
    })

    
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
    
def get_user_id():
    if "user" not in session:
        return None

    conn = sqlite3.connect("vocab.db")
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = ?", (session["user"],))
    row = c.fetchone()
    conn.close()

    return row[0] if row else None

#設定目標
# @app.route("/api/daily-goal", methods=["POST"])
# def set_daily_goal():
#     user_id = get_user_id()
#     if not user_id:
#         return jsonify({"error": "未登入"}), 401

#     goals = request.json  # ← 現在會是一個 list
#     if not isinstance(goals, list):
#         return jsonify({"error": "資料格式錯誤"}), 400

#     conn = sqlite3.connect("vocab.db")
#     c = conn.cursor()

#     # 先刪除使用者舊的目標
#     c.execute("DELETE FROM daily_goals WHERE user_id=?", (user_id,))

#     for goal in goals:
#         type_ = goal.get("type")
#         count = goal.get("count")
#         accuracy = goal.get("accuracy")  # 可為 None
#         c.execute(
#             "INSERT INTO daily_goals (user_id, type, count, accuracy) VALUES (?, ?, ?, ?)",
#             (user_id, type_, count, accuracy)
#         )

#     conn.commit()
#     conn.close()

#     return jsonify({"message": "所有目標已儲存"})


# 新增目標
@app.route("/api/daily-goal/add", methods=["POST"])
def add_daily_goal():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "未登入"}), 401

    data = request.json
    type_ = data.get("type")
    count = data.get("count")
    accuracy = data.get("accuracy")

    conn = sqlite3.connect("vocab.db")
    c = conn.cursor()
    c.execute(
        "INSERT INTO daily_goals (user_id, type, count, accuracy) VALUES (?, ?, ?, ?)",
        (user_id, type_, count, accuracy)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "目標已新增"})

# 更新單一目標
@app.route("/api/daily-goal/update/<int:goal_id>", methods=["POST"])
def update_daily_goal(goal_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "未登入"}), 401

    data = request.json
    type_ = data.get("type")
    count = data.get("count")
    accuracy = data.get("accuracy")

    conn = sqlite3.connect("vocab.db")
    c = conn.cursor()
    c.execute(
        """
        UPDATE daily_goals
        SET type = ?, count = ?, accuracy = ?
        WHERE id = ? AND user_id = ?
        """,
        (type_, count, accuracy, goal_id, user_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "目標已更新"})




# 取得所有目標
@app.route("/api/daily-goal", methods=["GET"])
def get_daily_goals():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "未登入"}), 401

    conn = sqlite3.connect("vocab.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM daily_goals WHERE user_id=?", (user_id,))
    rows = c.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])




# 🔹 預設路由（可以不寫，React 前端處理）
@app.route("/")
def root():
    return jsonify({"message": "伺服器運作中"})

if __name__ == "__main__":
    app.run(debug=True)
