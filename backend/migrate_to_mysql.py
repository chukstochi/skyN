"""Run once: copies everything from the old sky.db (SQLite) into MySQL."""
import os, sqlite3

import db

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "sky.db")

db.init()

src = sqlite3.connect(SQLITE_PATH)
src.row_factory = sqlite3.Row

for table in ("sources", "articles", "subscribers"):
    rows = src.execute(f"SELECT * FROM {table}").fetchall()
    for row in rows:
        data = dict(row)
        columns = ", ".join(data)
        marks = ", ".join("?" for _ in data)
        db.q(
            f"INSERT OR IGNORE INTO {table}({columns}) VALUES({marks})",
            list(data.values()),
            write=True,
        )
    print(f"{table}: {len(rows)} rows copied")

src.close()
print("Done. You can start the backend with: python app.py")