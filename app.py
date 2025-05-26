from flask import Flask, render_template, request, redirect, session, url_for, jsonify
import sqlite3
import random

app = Flask(__name__)
app.secret_key = "my_english_game_123"  # 用來保護 session

# 🔸 公開首頁（訪客介紹）
@app.route("/home")
def main_home():
    return render_template("home.html")

# 🔸 登入頁面
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
            return redirect(url_for("dashboard"))
        else:
            return render_template("login.html", error="帳號或密碼錯誤")
    return render_template("login.html")

# 🔸 登出
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# 🔸 使用者登入後的主介面
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect("/login")
    return render_template("dashboard.html", user=session["user"], role=session["role"])

# 🔸 遊戲主頁（只有登入後才能玩）
@app.route("/game")
def game():
    if "user" not in session:
        return redirect("/login")
    return render_template("game.html")

# 🔸 題目 API（保護中）
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

# 🔸 預設首頁：登入者導到 dashboard，未登入導向 /home
@app.route("/")
def home():
    if "user" not in session:
        return redirect("/home")
    return redirect(url_for("dashboard"))

if __name__ == "__main__":
    app.run(debug=True)
