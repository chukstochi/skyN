"""Tests a list of Nigerian news feeds and adds the working ones to your Sources.
Run from the backend folder:  python add_nigeria_sources.py"""
import socket
import feedparser
import db

socket.setdefaulttimeout(12)
db.init()

CANDIDATES = [
    ("Channels TV", "https://www.channelstv.com/feed/"),
    ("Punch", "https://punchng.com/feed/"),
    ("Vanguard", "https://www.vanguardngr.com/feed/"),
    ("Premium Times", "https://www.premiumtimesng.com/feed"),
    ("The Guardian Nigeria", "https://guardian.ng/feed/"),
    ("Daily Post", "https://dailypost.ng/feed/"),
    ("TheCable", "https://www.thecable.ng/feed"),
    ("BusinessDay", "https://businessday.ng/feed/"),
    ("The Nation", "https://thenationonlineng.net/feed/"),
    ("Tribune", "https://www.tribuneonlineng.com/feed/"),
]

added = 0
for name, url in CANDIDATES:
    try:
        n = len(feedparser.parse(url).entries)
    except Exception as ex:
        n = 0
    if n == 0:
        print(f"SKIPPED  {name}: no stories found at {url}")
        continue
    try:
        db.q("INSERT INTO sources(name,url,category) VALUES(?,?,?)", (name, url, "Nigeria"), write=True)
        print(f"ADDED    {name}: {n} stories")
        added += 1
    except Exception:
        print(f"ALREADY  {name} is already in your sources")

print(f"\nDone. {added} new source(s) added. Now click 'Fetch & rewrite now' in the admin page.")
