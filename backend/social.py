"""Posts a published article (title + image + link) to your social accounts."""
import os, requests


def facebook(a, url):
    pid, tok = os.getenv("FB_PAGE_ID"), os.getenv("FB_PAGE_TOKEN")
    if not (pid and tok):
        return None
    r = requests.post(f"https://graph.facebook.com/{pid}/feed",
                      data={"message": a["title"], "link": url, "access_token": tok}, timeout=20)
    return "ok" if r.ok else f"failed: {r.text[:160]}"


def instagram(a, url):
    uid, tok = os.getenv("IG_USER_ID"), os.getenv("FB_PAGE_TOKEN")
    if not (uid and tok):
        return None
    if not a.get("image"):
        return "skipped: this story has no image"
    caption = f'{a["title"]}\n\nRead more: {url}'
    r = requests.post(f"https://graph.facebook.com/{uid}/media",
                      data={"image_url": a["image"], "caption": caption, "access_token": tok}, timeout=30)
    if not r.ok:
        return f"failed: {r.text[:160]}"
    r2 = requests.post(f"https://graph.facebook.com/{uid}/media_publish",
                       data={"creation_id": r.json()["id"], "access_token": tok}, timeout=30)
    return "ok" if r2.ok else f"failed: {r2.text[:160]}"


def x(a, url):
    keys = [os.getenv(n) for n in ("X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET")]
    if not all(keys):
        return None
    import tweepy
    c = tweepy.Client(consumer_key=keys[0], consumer_secret=keys[1], access_token=keys[2], access_token_secret=keys[3])
    c.create_tweet(text=f'{a["title"][:240]}\n{url}')
    return "ok"


def webhook(a, url):
    """Sends the post to Make.com / Zapier, which can forward it to TikTok, LinkedIn, Telegram and more."""
    w = os.getenv("SOCIAL_WEBHOOK_URL")
    if not w:
        return None
    r = requests.post(w, json={"title": a["title"], "summary": a["summary"], "url": url, "image": a.get("image"),
                               "category": a["category"], "author": a["author"]}, timeout=20)
    return "ok" if r.ok else f"failed: HTTP {r.status_code}"


def share(a):
    site = os.getenv("SITE_URL", "").rstrip("/")
    if not site:
        return {"info": "SITE_URL is not set in .env, so nothing was posted"}
    if "localhost" in site or "127.0.0.1" in site:
        return {"info": "SITE_URL points to your own computer. Social networks can't open it, so nothing was posted"}
    url = f"{site}/article/{a['slug']}"
    out = {}
    for name, fn in (("facebook", facebook), ("instagram", instagram), ("x", x), ("webhook", webhook)):
        try:
            r = fn(a, url)
        except Exception as ex:
            r = f"failed: {str(ex)[:160]}"
        if r is not None:
            out[name] = r
    return out or {"info": "no social accounts are set up in .env yet"}
