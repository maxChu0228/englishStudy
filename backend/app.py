import os
import random
import sqlite3
from datetime import datetime

import pytz
from flask import Flask, jsonify, make_response, request, session
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = "my_english_game_123"

# ─── 全局設定 ─────────────────────────────────────────────────────────

DB_PATH = "vocab.db"
TAIPEI = pytz.timezone("Asia/Taipei")
LEVEL_MAP = {
    "easyQuiz": "easy",
    "advancedQuiz": "medium"
}
UPLOAD_FOLDER = "static/avatars"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ─── 共用函式 ─────────────────────────────────────────────────────────

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_taipei_now():
    return datetime.now(TAIPEI)

def get_taipei_date_str():
    return get_taipei_now().strftime("%Y-%m-%d")

def get_user_id():
    username = session.get("user")
    if not username:
        return None
    conn = get_db_connection()
    user = conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()
    conn.close()
    return user["id"] if user else None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ─── 認證相關 ─────────────────────────────────────────────────────────

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    conn = get_db_connection()
    user = conn.execute(
        "SELECT id, username, role FROM users WHERE username=? AND password=?",
        (data.get("username"), data.get("password"))
    ).fetchone()
    conn.close()

    if not user:
        return jsonify(error="帳號或密碼錯誤"), 401

    session["user_id"], session["user"], session["role"] = user
    return jsonify(message="登入成功")

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    resp = make_response(jsonify(message="已登出"))
    resp.set_cookie("session", "", expires=0)
    return resp

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data.get("username") or not data.get("password"):
        return jsonify(error="請填入帳號與密碼"), 400

    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')",
            (data["username"], data["password"])
        )
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        return jsonify(error="帳號已存在"), 409

    return jsonify(message="註冊成功")

@app.route("/api/check-session")
def check_session():
    return jsonify(loggedIn = "user" in session)

@app.route("/api/user")
def get_user():
    if "user" not in session:
        return jsonify(error="未登入"), 401

    conn = get_db_connection()
    row = conn.execute(
        "SELECT username, role, avatar_path FROM users WHERE username=?",
        (session["user"],)
    ).fetchone()
    conn.close()

    return jsonify(username=row["username"], role=row["role"], avatar=row["avatar_path"])

# ─── 單字 & 測驗 API ─────────────────────────────────────────────────

@app.route("/api/words")
def get_words():
    level = request.args.get("level", "easy")
    if level == "starred":
        uid = get_user_id()
        if not uid:
            return jsonify(error="未登入"), 401
        query = """
            SELECT w.* FROM favorites f 
            JOIN words w ON f.word_id=w.id 
            WHERE f.user_id=?
        """
        params = (uid,)
    else:
        query = "SELECT * FROM words WHERE level=?"
        params = (level,)

    conn = get_db_connection()
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/quiz", methods=["GET"])
def get_quiz_questions():
    level = request.args.get("level", "easy")
    count = int(request.args.get("count", 1))

    conn = get_db_connection()
    words = conn.execute("SELECT * FROM words WHERE level=?", (level,)).fetchall()
    conn.close()

    if len(words) < count:
        return jsonify(error=f"{level} 題庫不足，至少需要 {count} 筆單字"), 400

    pool = [dict(w) for w in words]
    random.shuffle(pool)

    questions, used = [], set()
    for w in pool:
        if w["id"] in used:
            continue
        used.add(w["id"])

        wrong = [x["meaning"] for x in pool
                 if x["id"]!=w["id"] and x["meaning"] and x["meaning"]!=w["meaning"]]
        if len(wrong) < 3:
            continue

        opts = random.sample(wrong, 3) + [w["meaning"]]
        random.shuffle(opts)
        questions.append({"word": w["word"], "choices": opts, "answer": w["meaning"]})
        if len(questions)==count:
            break

    if len(questions)<count:
        return jsonify(error="無法生成足夠的有效題目"), 400
    return jsonify(questions)

@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz_result():
    if "user_id" not in session:
        return jsonify(error="未登入"), 401

    data = request.get_json()
    if not all(k in data for k in ("level","score","total","answers")):
        return jsonify(error="資料格式錯誤"), 400

    now = get_taipei_now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO quiz_records
          (user_id, level, score, total_questions, created_at)
        VALUES (?,?,?,?,?)
    """, (session["user_id"], data["level"], data["score"], data["total"], now))
    rid = cur.lastrowid

    for ans in data["answers"]:
        if all(ans.get(k) for k in ("word","correct","chosen")):
            cur.execute("""
                INSERT INTO quiz_items
                  (record_id, word, correct_answer, chosen_answer, is_correct)
                VALUES (?,?,?,?,?)
            """, (rid, ans["word"], ans["correct"], ans["chosen"],
                  int(ans["correct"]==ans["chosen"])))

    conn.commit()
    conn.close()
    return jsonify(message="紀錄已儲存")

@app.route("/api/quiz/history")
def get_quiz_history():
    if "user_id" not in session:
        return jsonify(error="未登入"), 401
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT id, level, score, total_questions, created_at
        FROM quiz_records
        WHERE user_id=?
        ORDER BY created_at DESC
        LIMIT 10
    """, (session["user_id"],)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/quiz/result/<int:record_id>")
def get_quiz_result_detail(record_id):
    if "user_id" not in session:
        return jsonify(error="未登入"), 401
    conn = get_db_connection()
    rec = conn.execute(
        "SELECT * FROM quiz_records WHERE id=? AND user_id=?",
        (record_id, session["user_id"])
    ).fetchone()
    if not rec:
        conn.close()
        return jsonify(error="找不到紀錄"), 404

    items = conn.execute("""
        SELECT qi.word, qi.correct_answer, qi.chosen_answer, qi.is_correct, w.id AS word_id
        FROM quiz_items qi
        JOIN words w ON qi.word=w.word
        WHERE qi.record_id=?
    """, (record_id,)).fetchall()
    conn.close()
    return jsonify(record=dict(rec), items=[dict(i) for i in items])

@app.route("/api/quiz/stats")
def get_quiz_stats():
    if "user_id" not in session:
        return jsonify(error="未登入"), 401
    conn = get_db_connection()
    row = conn.execute("""
        SELECT COUNT(*) AS count,
               SUM(score) AS total_score,
               SUM(total_questions) AS total_questions
        FROM quiz_records
        WHERE user_id=?
    """, (session["user_id"],)).fetchone()
    conn.close()
    cnt = row["count"] or 0
    totq = row["total_questions"] or 0
    acc = round((row["total_score"]/totq)*100,1) if totq else 0
    return jsonify(completed=cnt, accuracy=acc)


@app.route("/api/quiz/mistakes", methods=["GET"])
def get_recent_mistakes():
    user_id = get_user_id()
    if not user_id:
        return jsonify(error="未登入"), 401

    conn = get_db_connection()
    # 取最近 5 筆 is_correct = 0 的 word，依 record 的 created_at 排序
    rows = conn.execute("""
        SELECT qi.word
        FROM quiz_items qi
        JOIN quiz_records qr ON qi.record_id = qr.id
        WHERE qr.user_id = ? AND qi.is_correct = 0
        ORDER BY qr.created_at DESC
        LIMIT 5
    """, (user_id,)).fetchall()
    conn.close()

    mistakes = [r["word"] for r in rows]
    return jsonify(mistakes)

# ─── 收藏功能 ─────────────────────────────────────────────────────────

@app.route("/api/favorites", methods=["POST"])
def add_favorite():
    if "user_id" not in session:
        return jsonify(error="未登入"), 401
    wid = request.json.get("word_id")
    if not wid:
        return jsonify(error="缺少單字 ID"), 400
    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO favorites(user_id,word_id) VALUES(?,?)",
                     (session["user_id"], wid))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()
    return jsonify(message="已加入收藏")

@app.route("/api/favorites", methods=["GET"])
def get_favorites():
    if "user_id" not in session:
        return jsonify(error="未登入"), 401
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT w.id,w.word,w.meaning,w.level
        FROM favorites f
        JOIN words w ON f.word_id=w.id
        WHERE f.user_id=?
    """, (session["user_id"],)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/favorites/<int:word_id>", methods=["DELETE"])
def remove_favorite(word_id):
    if "user_id" not in session:
        return jsonify(error="未登入"), 401
    conn = get_db_connection()
    conn.execute("DELETE FROM favorites WHERE user_id=? AND word_id=?",
                 (session["user_id"], word_id))
    conn.commit()
    conn.close()
    return jsonify(message="已取消收藏")

# ─── 每日目標：增刪改查/進度/歷史 ───────────────────────────────────

@app.route("/api/daily-goal/add", methods=["POST"])
def add_daily_goal():
    uid = get_user_id()
    if not uid:
        return jsonify(error="未登入"), 401
    data = request.json
    now = get_taipei_now().strftime("%Y-%m-%d %H:%M:%S")
    today = get_taipei_date_str()
    conn = get_db_connection()
    conn.execute("""
        INSERT INTO daily_goals
          (user_id,type,count,accuracy,created_at,goal_date)
        VALUES(?,?,?,?,?,?)
    """, (uid, data["type"], data["count"], data.get("accuracy"), now, today))
    conn.commit()
    conn.close()
    return jsonify(message="目標已新增")

@app.route("/api/daily-goal/update/<int:gid>", methods=["POST"])
def update_daily_goal(gid):
    uid = get_user_id()
    if not uid:
        return jsonify(error="未登入"), 401
    data = request.json
    now = get_taipei_now().strftime("%Y-%m-%d %H:%M:%S")
    today = get_taipei_date_str()
    conn = get_db_connection()
    conn.execute("""
        UPDATE daily_goals
        SET type=?,count=?,accuracy=?,created_at=?,goal_date=?
        WHERE id=? AND user_id=?
    """, (data["type"], data["count"], data.get("accuracy"),
          now, today, gid, uid))
    conn.commit()
    conn.close()
    return jsonify(message="目標已更新")

@app.route("/api/daily-goal", methods=["GET"])
def get_daily_goals():
    uid = get_user_id()
    if not uid:
        return jsonify(error="未登入"), 401
    today = get_taipei_date_str()
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT * FROM daily_goals
        WHERE user_id=? AND goal_date=?
    """, (uid, today)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/daily-goal/progress", methods=["GET"])
def get_daily_goal_progress():
    uid = get_user_id()
    if not uid:
        return jsonify(error="未登入"), 401
    today = get_taipei_date_str()
    conn = get_db_connection()
    goals = conn.execute("""
        SELECT id,type,count,accuracy
        FROM daily_goals
        WHERE user_id=? AND goal_date=?
    """, (uid, today)).fetchall()
    recs = conn.execute("""
        SELECT level,score,total_questions,created_at
        FROM quiz_records
        WHERE user_id=? AND created_at LIKE ?
    """, (uid, today+"%")).fetchall()
    conn.close()

    recs = [dict(r) for r in recs]
    out = []
    for g in goals:
        gid, typ, cnt, acc = g["id"], g["type"], g["count"], g["accuracy"]
        if typ in LEVEL_MAP:
            lvl = LEVEL_MAP[typ]
            done = sum(1 for r in recs if r["level"]==lvl)
            out.append({
                "goal_id": gid, "type": typ,
                "target_count": cnt, "done_count": done,
                "completed": done>=cnt
            })
        elif typ=="accuracy":
            done = len(recs)
            recent = sorted(recs, key=lambda x:x["created_at"], reverse=True)[:cnt]
            avg = (sum(r["score"]/r["total_questions"]*100 for r in recent)/len(recent)) if recent else 0
            met = avg>=(acc or 0)
            out.append({
                "goal_id": gid, "type": typ,
                "target_count": cnt, "done_count": done,
                "current_accuracy": round(avg,1),
                "accuracyMet": met,
                "completed": done>=cnt and met
            })
        else:
            out.append({"goal_id":gid,"type":typ,"error":"Unknown"})
    return jsonify(out)

@app.route("/api/daily-goal/history", methods=["GET"])
def get_daily_goal_history():
    uid = get_user_id()
    if not uid:
        return jsonify(error="未登入"), 401
    conn = get_db_connection()
    dates = conn.execute("""
        SELECT DISTINCT goal_date
        FROM daily_goals
        WHERE user_id=?
        ORDER BY goal_date
    """, (uid,)).fetchall()
    conn.close()

    completed = []
    for d in dates:
        day = d["goal_date"]
        # 直接重用 progress endpoint 的邏輯
        prog = []
        with get_db_connection() as c:
            goals = c.execute("""
                SELECT id,type,count,accuracy
                FROM daily_goals
                WHERE user_id=? AND goal_date=?
            """, (uid, day)).fetchall()
            recs = c.execute("""
                SELECT level,score,total_questions,created_at
                FROM quiz_records
                WHERE user_id=? AND created_at LIKE ?
            """, (uid, day+"%")).fetchall()
        recs = [dict(r) for r in recs]
        ok = True
        for g in goals:
            typ, cnt, acc = g["type"], g["count"], g["accuracy"]
            if typ in LEVEL_MAP:
                if sum(1 for r in recs if r["level"]==LEVEL_MAP[typ])<cnt:
                    ok=False; break
            elif typ=="accuracy":
                if len(recs)<cnt: ok=False; break
                recent = sorted(recs, key=lambda x:x["created_at"], reverse=True)[:cnt]
                avg = sum(r["score"]/r["total_questions"]*100 for r in recent)/len(recent)
                if avg<(acc or 0): ok=False; break
            else:
                ok=False; break
        if ok:
            completed.append(day)
    return jsonify(completed)

# ─── 圖片上傳 ─────────────────────────────────────────────────────────

@app.route("/api/upload-avatar", methods=["POST"])
def upload_avatar():
    if "user" not in session:
        return jsonify(error="未登入"), 401
    file = request.files.get("avatar")
    if not file or not allowed_file(file.filename):
        return jsonify(error="不合法的檔案"), 400

    fn = secure_filename(f"{session['user']}_{file.filename}")
    path = os.path.join(UPLOAD_FOLDER, fn)
    file.save(path)

    conn = get_db_connection()
    conn.execute("UPDATE users SET avatar_path=? WHERE username=?",
                 (fn, session["user"]))
    conn.commit(); conn.close()

    return jsonify(message="上傳成功", avatarPath=fn)

# ─── 排行榜 ─────────────────────────────────────────────────────────
@app.route("/api/leaderboard/advanced", methods=["GET"])
def get_leaderboard_advanced():
    # 1. 從 query string 拿參數，並給預設值
    min_accuracy = float(request.args.get("min_accuracy", 10))   # 平均正確率最低 70%
    min_quizzes  = int(request.args.get("min_quizzes", 5))      # 至少 5 次測驗
    limit        = int(request.args.get("limit", 10))           # 顯示前 10 名
    page         = int(request.args.get("page", 1))
    offset       = (page - 1) * limit

    # 2. 權限檢查
    uid = get_user_id()
    if not uid:
        return jsonify(error="未登入"), 401

    # 3. 用一條 SQL 同時計算：quiz_count、accuracy、加權分數 weighted_score
    sql = """
    SELECT
      u.id            AS user_id,
      u.username      AS username,
      COUNT(r.id)     AS quiz_count,
      ROUND(
        SUM(r.score) * 1.0 / SUM(r.total_questions) * 100
      , 1)             AS accuracy,
      ROUND(
        COUNT(r.id) * (SUM(r.score) * 1.0 / SUM(r.total_questions))
      , 1)             AS weighted_score
    FROM quiz_records r
    JOIN users u ON r.user_id = u.id
    GROUP BY u.id
    HAVING quiz_count >= ?
       AND accuracy   >= ?
    ORDER BY weighted_score DESC, quiz_count DESC
    LIMIT ? OFFSET ?
    """

    conn = get_db_connection()
    rows = conn.execute(sql, (min_quizzes, min_accuracy, limit, offset)).fetchall()
    conn.close()

    # 4. 加上排名欄
    rank_start = offset + 1
    result = []
    for i, row in enumerate(rows):
        result.append({
            "rank":           rank_start + i,
            "user_id":        row["user_id"],
            "username":       row["username"],
            "quiz_count":     row["quiz_count"],
            "accuracy":       row["accuracy"],        # 平均正確率 %
            "weighted_score": row["weighted_score"]  # 加權分數
        })

    return jsonify(result)


@app.route("/api/leaderboard/advanced/me", methods=["GET"])
def get_my_leaderboard_rank():
    # 1. 參數
    min_accuracy = float(request.args.get("min_accuracy", 10))
    min_quizzes  = int(request.args.get("min_quizzes", 5))

    # 2. 檢查登入
    uid = get_user_id()
    if not uid:
        return jsonify(error="未登入"), 401

    # 3. 把所有符合條件的使用者拉出來，並排序
    sql = """
    SELECT
      u.id            AS user_id,
      u.username      AS username,
      COUNT(r.id)     AS quiz_count,
      SUM(r.score)*1.0 / SUM(r.total_questions)*100 AS accuracy,
      COUNT(r.id)*(SUM(r.score)*1.0 / SUM(r.total_questions)) AS weighted_score
    FROM quiz_records r
    JOIN users u ON r.user_id = u.id
    GROUP BY u.id
    HAVING quiz_count >= ?
       AND accuracy   >= ?
    ORDER BY weighted_score DESC, quiz_count DESC
    """
    conn = get_db_connection()
    rows = conn.execute(sql, (min_quizzes, min_accuracy)).fetchall()
    conn.close()

    # 4. 找出當前使用者的名次
    my_rank = None
    for idx, row in enumerate(rows):
        if row["user_id"] == uid:
            my_rank = idx + 1
            my_username      = row["username"]
            my_quiz_count    = row["quiz_count"]
            my_accuracy      = round(row["accuracy"], 1)
            my_weighted     = round(row["weighted_score"], 1)
            break

    # 5. 回傳結果
    if my_rank is None:
        return jsonify({"message": "尚未達成排行榜條件"}), 200

    return jsonify({
        "rank":           my_rank,
        "username":       my_username,
        "quiz_count":     my_quiz_count,
        "accuracy":       my_accuracy,
        "weighted_score": my_weighted
    })



@app.route("/")
def root():
    return jsonify(message="伺服器運作中")

def init_db(include_sample_data=True):
    if not os.path.exists(DB_PATH):
        print("[系統] 資料庫不存在，正在初始化 vocab.db...")
        conn = get_db_connection()
        cur = conn.cursor()

        # 建立資料表
        cur.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                avatar_path TEXT
            )
        """)
        cur.execute("""
            CREATE TABLE words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                meaning TEXT NOT NULL,
                level TEXT NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE quiz_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                level TEXT,
                score INTEGER,
                total_questions INTEGER,
                created_at TEXT
            )
        """)
        cur.execute("""
            CREATE TABLE quiz_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                record_id INTEGER,
                word TEXT,
                correct_answer TEXT,
                chosen_answer TEXT,
                is_correct INTEGER
            )
        """)
        cur.execute("""
            CREATE TABLE favorites (
                user_id INTEGER,
                word_id INTEGER,
                UNIQUE(user_id, word_id)
            )
        """)
        cur.execute("""
            CREATE TABLE daily_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                type TEXT,
                count INTEGER,
                accuracy REAL,
                created_at TEXT,
                goal_date TEXT
            )
        """)

        # 🔰 插入範例單字資料（可關閉）
        if include_sample_data:
            sample_words = [
                ("apple", "蘋果", "easy"),
                ("banana", "香蕉", "easy"),
                ("computer", "電腦", "easy"),
                ("architecture", "建築學", "medium"),
                ("resilient", "有韌性的", "medium"),
                ("perspective", "觀點", "medium"),
                ("serendipity", "意外的收穫", "medium"),
            ]
            cur.executemany("INSERT INTO words (word, meaning, level) VALUES (?, ?, ?)", sample_words)
            print(f"[系統] 已插入 {len(sample_words)} 筆範例單字。")

        conn.commit()
        conn.close()
        print("[系統] 資料庫初始化完成。")

if __name__=="__main__":
    init_db()
    app.run(debug=True)
