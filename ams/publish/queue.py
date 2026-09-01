"""Local publishing queue.

TikTok has no public API for anonymous/unverified accounts to auto-post —
posting always needs either a manual upload or your own approved TikTok
developer app (see tiktok.py). So the reliable default here is: render the
video, write a caption/hashtag file next to it, and log it as "ready" so you
can review and upload by hand from the TikTok app in under a minute.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from ams.config import OUTPUT_DIR

QUEUE_FILE = OUTPUT_DIR / "publish_queue.jsonl"


def enqueue(metadata_path: Path) -> dict:
    metadata = json.loads(Path(metadata_path).read_text(encoding="utf-8"))
    entry = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "ready_to_post",
        **metadata,
    }
    QUEUE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(QUEUE_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

    caption_file = Path(metadata["video_path"]).with_name("caption.txt")
    caption_file.write_text(metadata["caption"], encoding="utf-8")
    return entry


def list_pending() -> list[dict]:
    if not QUEUE_FILE.exists():
        return []
    entries = [json.loads(line) for line in QUEUE_FILE.read_text(encoding="utf-8").splitlines() if line.strip()]
    return [e for e in entries if e.get("status") == "ready_to_post"]
