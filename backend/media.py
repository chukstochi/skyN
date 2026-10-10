import time

from flask import Blueprint, Response, jsonify, request, session

import db

# Photos and videos you upload from the admin page are stored in the database
# (so they survive redeploys) and served from /api/media/<id>.
bp = Blueprint("media", __name__)

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm"}
EXT_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp", "gif": "image/gif",
    "mp4": "video/mp4", "mov": "video/quicktime", "webm": "video/webm",
}
MAX_IMAGE = 8 * 1024 * 1024
MAX_VIDEO = 40 * 1024 * 1024


def init():
    db.q(
        "CREATE TABLE IF NOT EXISTS media("
        "id INT AUTO_INCREMENT PRIMARY KEY, mime VARCHAR(100), size INT, "
        "data LONGBLOB, created_at BIGINT) ENGINE=InnoDB",
        write=True,
    )
    try:
        db.q("ALTER TABLE articles ADD COLUMN video VARCHAR(255)", write=True)
    except Exception:
        pass  # the column is already there


@bp.post("/api/admin/upload")
def upload():
    if not session.get("admin"):
        return jsonify(error="Not signed in"), 401
    f = request.files.get("file")
    if not f:
        return jsonify(error="No file received"), 400
    mime = (f.mimetype or "").lower()
    if mime not in IMAGE_TYPES and mime not in VIDEO_TYPES:
        ext = (f.filename or "").rsplit(".", 1)[-1].lower()
        mime = EXT_TYPES.get(ext, mime)
    kind = "image" if mime in IMAGE_TYPES else "video" if mime in VIDEO_TYPES else None
    if not kind:
        return jsonify(error="Use a JPG, PNG, WebP or GIF picture, or an MP4, MOV or WebM video"), 400
    data = f.read()
    if len(data) > (MAX_IMAGE if kind == "image" else MAX_VIDEO):
        return jsonify(error="That file is too big"), 413
    new_id = db.q(
        "INSERT INTO media(mime,size,data,created_at) VALUES(?,?,?,?)",
        (mime, len(data), data, int(time.time() * 1000)),
        write=True,
    )
    return jsonify(url=f"/api/media/{new_id}", type=kind)


# Served with Range support, because phones (iPhones especially) will not play a video without it.
@bp.get("/api/media/<int:i>")
def serve(i):
    m = db.q("SELECT mime,data FROM media WHERE id=?", (i,), one=True)
    if not m:
        return jsonify(error="Not found"), 404
    data, mime = m["data"], m["mime"]
    total = len(data)
    rng = request.headers.get("Range", "")
    if rng.startswith("bytes="):
        try:
            first, _, last = rng[6:].split(",")[0].partition("-")
            if first == "":
                start, end = max(0, total - int(last)), total - 1
            else:
                start, end = int(first), (int(last) if last else total - 1)
            end = min(end, total - 1)
            if start > end or start >= total:
                raise ValueError
        except ValueError:
            return Response(status=416, headers={"Content-Range": f"bytes */{total}"})
        resp = Response(data[start:end + 1], status=206, mimetype=mime)
        resp.headers["Content-Range"] = f"bytes {start}-{end}/{total}"
    else:
        resp = Response(data, status=200, mimetype=mime)
    resp.headers["Accept-Ranges"] = "bytes"
    resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return resp
