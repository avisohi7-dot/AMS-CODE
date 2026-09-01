"""Direct-post to TikTok via the official Content Posting API.

This requires YOUR OWN TikTok developer app, approved for the
`video.publish` scope, plus a user access token obtained through TikTok's
OAuth flow (set TIKTOK_ACCESS_TOKEN). There is no way to post on someone's
behalf without that — any tool claiming otherwise is violating TikTok's
terms. Until you have an approved app, use ams.publish.queue and upload
manually from the TikTok app; it takes under a minute per video.

Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
"""
from __future__ import annotations

from pathlib import Path

import requests

from ams.config import SETTINGS

_INIT_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/"


def publish_video(video_path: Path, caption: str, privacy_level: str = "SELF_ONLY") -> dict:
    """privacy_level defaults to SELF_ONLY (private draft) so a first run never
    goes live by accident. Pass "PUBLIC_TO_EVERYONE" once you've reviewed the
    result in the TikTok app."""
    if not SETTINGS.tiktok_access_token:
        raise RuntimeError(
            "TIKTOK_ACCESS_TOKEN is not set. Register a TikTok developer app, get it "
            "approved for video.publish, and complete the OAuth flow first. Until then, "
            "use ams.publish.queue to prepare videos for manual upload."
        )

    video_path = Path(video_path)
    file_size = video_path.stat().st_size

    init_resp = requests.post(
        _INIT_URL,
        headers={
            "Authorization": f"Bearer {SETTINGS.tiktok_access_token}",
            "Content-Type": "application/json; charset=UTF-8",
        },
        json={
            "post_info": {
                "title": caption,
                "privacy_level": privacy_level,
                "disable_duet": False,
                "disable_comment": False,
                "disable_stitch": False,
            },
            "source_info": {
                "source": "FILE_UPLOAD",
                "video_size": file_size,
                "chunk_size": file_size,
                "total_chunk_count": 1,
            },
        },
        timeout=30,
    )
    init_resp.raise_for_status()
    init_data = init_resp.json()["data"]
    upload_url = init_data["upload_url"]

    with open(video_path, "rb") as f:
        video_bytes = f.read()
    upload_resp = requests.put(
        upload_url,
        headers={
            "Content-Type": "video/mp4",
            "Content-Range": f"bytes 0-{file_size - 1}/{file_size}",
        },
        data=video_bytes,
        timeout=120,
    )
    upload_resp.raise_for_status()

    return init_data
