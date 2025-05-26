from flask import Flask, render_template, request, redirect, session, url_for, jsonify
import sqlite3
import random
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "my_english_game_123"  # 用來保護 session 要改

# 登入頁面
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = sqlite3.connect("vocab.db")
        c = conn.cursor()
        c.execute("SELECT username, role FROM users WHERE username=? AND password=?", (username, password))
        user = c.fetchone()
        conn.close()

        if user:
            session["user"] = user[0]
            session["role"] = user[1]
            return redirect(url_for("home"))
        else:
            return render_template("login.html", error="帳號或密碼錯誤")
    return render_template("login.html")

# 登出功能
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# 首頁（需登入）
@app.route("/")
def home():
    if "user" not in session:
        return redirect("/login")
    return render_template("index.html")

# 題目 API
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
        return jsonify({"error": "No data found"})

if __name__ == "__main__":
    app.run(debug=True)
