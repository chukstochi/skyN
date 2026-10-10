import os, re
from decimal import Decimal
from urllib.parse import urlparse, unquote

import pymysql
import pymysql.cursors

try:  # optional: read settings from a .env file next to this file
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# On Railway one variable is enough: MYSQL_URL (mysql://user:password@host:port/database).
# On your own PC you can keep using the separate MYSQL_HOST / MYSQL_PORT / ... settings.
_url = urlparse(os.environ.get("MYSQL_URL", ""))
HOST = _url.hostname or os.environ.get("MYSQL_HOST", "127.0.0.1")
PORT = _url.port or int(os.environ.get("MYSQL_PORT", "3306"))
USER = unquote(_url.username) if _url.username else os.environ.get("MYSQL_USER", "root")
PASSWORD = unquote(_url.password) if _url.password else os.environ.get("MYSQL_PASSWORD", "")
DB = _url.path.lstrip("/") or os.environ.get("MYSQL_DB", "skyn")

# Catch this where the old code caught sqlite3.IntegrityError (duplicate slug, url, email)
IntegrityError = pymysql.err.IntegrityError

SCHEMA = [
    """CREATE TABLE IF NOT EXISTS articles(
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT,
        slug VARCHAR(255) UNIQUE,
        summary TEXT,
        body LONGTEXT,
        category VARCHAR(50),
        image TEXT,
        source_name VARCHAR(255),
        source_url VARCHAR(700) UNIQUE,
        author VARCHAR(255),
        status VARCHAR(20) DEFAULT 'draft',
        created_at BIGINT,
        published_at BIGINT,
        social_shared TINYINT DEFAULT 0,
        INDEX idx_status (status),
        INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci""",
    """CREATE TABLE IF NOT EXISTS sources(
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        url VARCHAR(700) UNIQUE,
        category VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci""",
    """CREATE TABLE IF NOT EXISTS subscribers(
        email VARCHAR(255) PRIMARY KEY,
        created_at BIGINT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci""",
]


def conn(use_database=True):
    return pymysql.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        database=DB if use_database else None,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
        max_allowed_packet=64 * 1024 * 1024,
    )


def init():
    c = conn(use_database=False)
    try:
        with c.cursor() as cur:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        c.commit()
    finally:
        c.close()

    c = conn()
    try:
        with c.cursor() as cur:
            for statement in SCHEMA:
                cur.execute(statement)
        c.commit()
    finally:
        c.close()


def _convert(sql):
    """Lets the rest of the backend keep its SQLite-style queries."""
    sql = sql.replace("%", "%%").replace("?", "%s")
    sql = re.sub(r"INSERT\s+OR\s+IGNORE", "INSERT IGNORE", sql, flags=re.I)
    sql = re.sub(r"INSERT\s+OR\s+REPLACE", "REPLACE", sql, flags=re.I)
    return sql


def _clean(row):
    for key, value in row.items():
        if isinstance(value, Decimal):
            row[key] = int(value) if value == value.to_integral_value() else float(value)
    return row


def q(sql, args=(), one=False, write=False):
    c = conn()
    try:
        with c.cursor() as cur:
            cur.execute(_convert(sql), tuple(args))
            if write:
                c.commit()
                return cur.lastrowid
            rows = [_clean(r) for r in cur.fetchall()]
            return (rows[0] if rows else None) if one else rows
    finally:
        c.close()