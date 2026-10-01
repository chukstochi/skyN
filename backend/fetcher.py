import os, re, time, random, threading, feedparser
import urllib.request, html as ihtml
import db, ai

AUTHORS = [a.strip() for a in os.getenv("AUTHORS", "Sky N Desk").split(",")]
PER_SOURCE = int(os.getenv("STORIES_PER_SOURCE", 5))   # max new stories per source each fetch
DELAY = float(os.getenv("DELAY_SECONDS", 5))           # pause between AI calls (free-tier friendly)
lock = threading.Lock()


def slugify(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:80] + "-" + format(int(time.time() * 1000), "x")


def image_of(e):
    """Best image listed in the feed itself (largest one if several)."""
    cands = []
    for m in e.get("media_content", []) + e.get("media_thumbnail", []):
        if m.get("url"):
            try:
                w = int(m.get("width") or 0)
            except ValueError:
                w = 0
            cands.append((w, m["url"]))
    for l in e.get("links", []):
        if l.get("type", "").startswith("image") and l.get("href"):
            cands.append((0, l["href"]))
    if not cands:
        return None
    cands.sort(key=lambda c: c[0], reverse=True)
    return cands[0][1]


def upgrade(url):
    """Feeds often give tiny thumbnails. BBC image URLs contain the width, so ask for a bigger one."""
    if not url:
        return url
    return re.sub(r"(ichef\.bbci\.co\.uk/(?:news|ace/standard)/)\d+/", r"\g<1>976/", url)


def og_image(link):
    """The full-size share image from the article page (og:image), usually much sharper than the feed thumbnail."""
    try:
        req = urllib.request.Request(link, headers={"User-Agent": "Mozilla/5.0 (SkyNNewsBot)"})
        html = urllib.request.urlopen(req, timeout=8).read(250000).decode("utf-8", "ignore")
        for pat in (r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
                    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']'):
            m = re.search(pat, html, re.I)
            if m:
                return ihtml.unescape(m.group(1))
    except Exception:
        pass
    return None


def best_image(e, link):
    return og_image(link) or upgrade(image_of(e))


def fetch_all():
    if not lock.acquire(blocking=False):
        return {"skipped": True}
    added, errors, stop = 0, [], False
    try:
        for src in db.q("SELECT * FROM sources"):
            if stop:
                break
            try:
                feed = feedparser.parse(src["url"])
                if not feed.entries:
                    raise Exception("no stories found in feed")
                done = 0
                for e in feed.entries:
                    if done >= PER_SOURCE:
                        break
                    link = e.get("link")
                    if not link or db.q("SELECT 1 FROM articles WHERE source_url=?", (link,), one=True):
                        continue
                    done += 1
                    try:
                        text = e.get("summary") or (e.get("content") or [{}])[0].get("value", "")
                        a = ai.rewrite(e.get("title", ""), text, src["name"])
                        cat = a["category"] if a["category"] in ai.CATS else (src["category"] or "World")
                        db.q("""INSERT INTO articles(title,slug,summary,body,category,image,source_name,source_url,author,created_at)
                                VALUES(?,?,?,?,?,?,?,?,?,?)""",
                             (a["title"], slugify(a["title"]), a["summary"], a["body"], cat, best_image(e, link),
                              src["name"], link, random.choice(AUTHORS), int(time.time() * 1000)), write=True)
                        added += 1
                        print(f"[fetch] drafted: {a['title']}")
                    except Exception as ex:
                        msg = f'{e.get("title", "")[:40]}: {ex}'
                        errors.append(msg)
                        print("[fetch] failed:", msg)
                        if "429" in str(ex) or "RESOURCE_EXHAUSTED" in str(ex) or "quota" in str(ex).lower():
                            errors.append("Stopped early: AI rate limit or quota reached. Wait a few minutes and try again.")
                            stop = True
                            break
                    time.sleep(DELAY)
            except Exception as ex:
                errors.append(f'{src["name"]}: {ex}')
                print("[fetch] source failed:", src["name"], ex)
    finally:
        lock.release()
    return {"added": added, "errors": errors}


def start_scheduler():
    mins = float(os.getenv("FETCH_EVERY_MIN", 30))

    def loop():
        while True:
            time.sleep(mins * 60)
            try:
                fetch_all()
            except Exception as ex:
                print("auto-fetch failed:", ex)

    threading.Thread(target=loop, daemon=True).start()