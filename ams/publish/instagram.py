"""Publish a Reel via the Instagram Graph API.

Needs a Facebook developer app with instagram_content_publish permission,
an Instagram professional (business/creator) account, and IG_ACCESS_TOKEN /
IG_BUSINESS_ACCOUNT_ID set. Instagram fetches the video FROM A PUBLIC URL —
it cannot take a local file — so host the rendered mp4 somewhere reachable
(e.g. a private S3/GCS bucket with a signed URL) and pass that URL in.

Docs: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reels-publishing
"""
from __future__ import annotations

import time

import requests

from ams.config import SETTINGS

_GRAPH_BASE = "https://graph.facebook.com/v19.0"


def publish_reel(video_url: str, caption: str, poll_interval: float = 5.0, max_wait: float = 300.0) -> dict:
    if not SETTINGS.instagram_access_token or not SETTINGS.instagram_business_id:
        raise RuntimeError(
            "IG_ACCESS_TOKEN / IG_BUSINESS_ACCOUNT_ID are not set. Set up a Facebook "
            "developer app + Instagram professional account first."
        )

    create_resp = requests.post(
        f"{_GRAPH_BASE}/{SETTINGS.instagram_business_id}/media",
        data={
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "access_token": SETTINGS.instagram_access_token,
        },
        timeout=30,
    )
    create_resp.raise_for_status()
    container_id = create_resp.json()["id"]

    waited = 0.0
    while waited < max_wait:
        status_resp = requests.get(
            f"{_GRAPH_BASE}/{container_id}",
            params={"fields": "status_code", "access_token": SETTINGS.instagram_access_token},
            timeout=15,
        )
        status_resp.raise_for_status()
        status = status_resp.json().get("status_code")
        if status == "FINISHED":
            break
        if status == "ERROR":
            raise RuntimeError(f"Instagram failed to process the Reel container {container_id}")
        time.sleep(poll_interval)
        waited += poll_interval
    else:
        raise TimeoutError(f"Reel container {container_id} did not finish processing in time")

    publish_resp = requests.post(
        f"{_GRAPH_BASE}/{SETTINGS.instagram_business_id}/media_publish",
        data={"creation_id": container_id, "access_token": SETTINGS.instagram_access_token},
        timeout=30,
    )
    publish_resp.raise_for_status()
    return publish_resp.json()
