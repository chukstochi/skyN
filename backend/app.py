import os, re, time
from functools import wraps
from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request, jsonify, session, send_from_directory, redirect
import html as ihtml
import db, fetcher, social

FRONT = os.path.join(os.path.dirname(__file__), "..", "frontend")
app = Flask(__name__, static_folder=FRONT, static_url_path="")
app.secret_key = os.getenv("SECRET_KEY", "dev-secret")
db.init()

def admin(f):
    @wraps(f)
    def w(*a, **k):
        if not session.get("admin"): return jsonify(error="Not signed in"), 401
        return f(*a, **k)
    return w

@app.route("/")
def home(): return send_from_directory(FRONT, "index.html")

# ---- public
@app.get("/api/articles")
def articles():
    c = request.args.get("category")
    sql = "SELECT id,title,slug,summary,category,image,author,published_at FROM articles WHERE status='published'"
    sql += (" AND category=?" if c else "") + " ORDER BY published_at DESC LIMIT 40"
    return jsonify(db.q(sql, (c,) if c else ()))

@app.get("/api/articles/<slug>")
def article(slug):
    a = db.q("SELECT * FROM articles WHERE slug=? AND status='published'", (slug,), one=True)
    return (jsonify(a) if a else (jsonify(error="Not found"), 404))

@app.post("/api/subscribe")
def subscribe():
    e = str((request.json or {}).get("email", "")).strip()
    if not re.match(r"^\S+@\S+\.\S+$", e): return jsonify(error="Enter a valid email"), 400
    db.q("INSERT OR IGNORE INTO subscribers VALUES(?,?)", (e, int(time.time() * 1000)), write=True)
    return jsonify(ok=1)

# ---- shareable article page (gives Facebook, X, WhatsApp etc. a title + image preview)
@app.get("/article/<slug>")
def article_page(slug):
    a = db.q("SELECT * FROM articles WHERE slug=? AND status='published'", (slug,), one=True)
    if not a: return redirect("/")
    e = lambda s: ihtml.escape(str(s or ""), quote=True)
    site = os.getenv("SITE_URL", "").rstrip("/")
    img = (f'<meta property="og:image" content="{e(a["image"])}"><meta name="twitter:image" content="{e(a["image"])}">') if a["image"] else ""
    return (f'<!doctype html><html><head><meta charset="utf-8"><title>{e(a["title"])} | Sky N news</title>'
            f'<meta property="og:type" content="article"><meta property="og:site_name" content="Sky N news">'
            f'<meta property="og:title" content="{e(a["title"])}"><meta property="og:description" content="{e(a["summary"])}">'
            f'<meta property="og:url" content="{e(site)}/article/{e(slug)}">{img}<meta name="twitter:card" content="summary_large_image">'
            f'</head><body><script>location.replace("/#{e(slug)}")</script><noscript><a href="/">Read on Sky N news</a></noscript></body></html>')

# ---- admin
@app.post("/api/admin/login")
def login():
    if (request.json or {}).get("password") != os.getenv("ADMIN_PASSWORD"): return jsonify(error="Wrong password"), 401
    session["admin"] = True; return jsonify(ok=1)

@app.get("/api/admin/articles")
@admin
def a_list():
    return jsonify(db.q("SELECT * FROM articles WHERE status=? ORDER BY created_at DESC LIMIT 100", (request.args.get("status", "draft"),)))

@app.put("/api/admin/articles/<int:i>")
@admin
def a_edit(i):
    d = request.json
    db.q("UPDATE articles SET title=?,summary=?,body=?,category=?,author=?,image=? WHERE id=?",
         (d["title"], d["summary"], d["body"], d["category"], d["author"], d.get("image") or None, i), write=True)
    return jsonify(ok=1)

@app.post("/api/admin/articles/<int:i>/<act>")
@admin
def a_act(i, act):
    if act == "publish": db.q("UPDATE articles SET status='published',published_at=? WHERE id=?", (int(time.time() * 1000), i), write=True)
    elif act == "reject": db.q("UPDATE articles SET status='rejected' WHERE id=?", (i,), write=True)
    elif act == "draft": db.q("UPDATE articles SET status='draft',published_at=NULL WHERE id=?", (i,), write=True)
    else: return jsonify(error="Bad action"), 400
    out = {"ok": 1}
    if act == "publish":
        art = db.q("SELECT * FROM articles WHERE id=?", (i,), one=True)
        if art and not art.get("social_shared"):
            out["social"] = social.share(art)
            if any(v == "ok" for v in out["social"].values()):
                db.q("UPDATE articles SET social_shared=1 WHERE id=?", (i,), write=True)
    return jsonify(out)

@app.delete("/api/admin/articles/<int:i>")
@admin
def a_del(i):
    db.q("DELETE FROM articles WHERE id=?", (i,), write=True); return jsonify(ok=1)

@app.get("/api/admin/sources")
@admin
def s_list(): return jsonify(db.q("SELECT * FROM sources"))

@app.post("/api/admin/sources")
@admin
def s_add():
    d = request.json or {}
    if not d.get("name") or not d.get("url"): return jsonify(error="Name and feed URL required"), 400
    try: db.q("INSERT INTO sources(name,url,category) VALUES(?,?,?)", (d["name"], d["url"], d.get("category", "World")), write=True)
    except Exception: return jsonify(error="Feed already added"), 400
    return jsonify(ok=1)

@app.delete("/api/admin/sources/<int:i>")
@admin
def s_del(i):
    db.q("DELETE FROM sources WHERE id=?", (i,), write=True); return jsonify(ok=1)

@app.post("/api/admin/fetch")
@admin
def s_fetch(): return jsonify(fetcher.fetch_all())

@app.get("/api/admin/stats")
@admin
def stats(): return jsonify(ok=1)

if __name__ == "__main__":
    fetcher.start_scheduler()
    app.run(port=int(os.getenv("PORT", 3000)), debug=False, threaded=True)
