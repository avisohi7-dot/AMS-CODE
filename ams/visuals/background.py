"""Background video generation for the vertical (9:16) canvas.

Two providers, selected via SETTINGS.background_provider:
  - "procedural" : generated in-process (animated pitch-stripe gradient),
                   no network, no API key, always available.
  - "pexels"     : downloads a real vertical football stock clip from Pexels
                   (needs PEXELS_API_KEY), looped/trimmed to length.
"""
from __future__ import annotations

import random
from pathlib import Path

import numpy as np
import requests

from ams.config import SETTINGS

# Deep pitch-green palette so white karaoke captions stay readable.
_TOP_COLOR = np.array([6, 26, 14], dtype=np.float32)
_BOTTOM_COLOR = np.array([16, 74, 38], dtype=np.float32)
_STRIPE_COLOR = np.array([24, 96, 48], dtype=np.float32)


def _make_frame_fn(width: int, height: int):
    ys = np.linspace(0.0, 1.0, height, dtype=np.float32).reshape(height, 1, 1)  # (H, 1, 1)
    top = _TOP_COLOR.reshape(1, 1, 3)
    bottom = _BOTTOM_COLOR.reshape(1, 1, 3)
    base = top * (1 - ys) + bottom * ys  # (H, 1, 3)
    base = np.broadcast_to(base, (height, width, 3)).copy()  # (H, W, 3)

    xs = np.arange(width, dtype=np.float32).reshape(1, width)
    ys_full = np.arange(height, dtype=np.float32).reshape(height, 1)
    diag = xs + ys_full  # (H, W) diagonal coordinate for mowed-stripe pattern

    def make_frame(t: float) -> np.ndarray:
        scroll = t * 140.0  # px/sec stripe scroll speed
        stripe_phase = np.mod((diag - scroll) / 90.0, 2.0)
        stripe_mask = (stripe_phase < 1.0).astype(np.float32)[..., None]  # (H, W, 1)

        frame = base * (1 - 0.12 * stripe_mask) + _STRIPE_COLOR * (0.12 * stripe_mask)

        # slow pulsing vignette highlight to add a bit of life behind the text
        pulse = 0.5 + 0.5 * np.sin(t * 0.6)
        cy = height * (0.35 + 0.05 * pulse)
        cx = width * 0.5
        yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
        dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (width * 1.1)
        glow = np.clip(1.0 - dist, 0.0, 1.0) ** 2 * 18.0
        frame = frame + glow[..., None]

        return np.clip(frame, 0, 255).astype(np.uint8)

    return make_frame


def procedural_background(duration: float, width: int, height: int, fps: int):
    from moviepy import VideoClip

    return VideoClip(_make_frame_fn(width, height), duration=duration).with_fps(fps)


def _pexels_search(query: str) -> str | None:
    resp = requests.get(
        "https://api.pexels.com/videos/search",
        headers={"Authorization": SETTINGS.pexels_api_key},
        params={"query": query, "orientation": "portrait", "per_page": 15},
        timeout=20,
    )
    resp.raise_for_status()
    videos = resp.json().get("videos", [])
    if not videos:
        return None
    video = random.choice(videos)
    files = sorted(
        (f for f in video["video_files"] if f.get("width") and f["width"] <= 1080),
        key=lambda f: f["width"],
        reverse=True,
    )
    files = files or video["video_files"]
    return files[0]["link"]


def pexels_background(duration: float, out_dir: Path, query: str = "football stadium"):
    from moviepy import vfx
    from moviepy.video.io.VideoFileClip import VideoFileClip

    if not SETTINGS.pexels_api_key:
        raise RuntimeError("PEXELS_API_KEY is not set")

    url = _pexels_search(query)
    if not url:
        raise RuntimeError(f"No Pexels results for query {query!r}")

    out_dir.mkdir(parents=True, exist_ok=True)
    raw_path = out_dir / "background_source.mp4"
    with requests.get(url, stream=True, timeout=60) as resp:
        resp.raise_for_status()
        with open(raw_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=1 << 16):
                f.write(chunk)

    clip = VideoFileClip(str(raw_path))
    if clip.duration < duration:
        clip = clip.with_effects([vfx.Loop(duration=duration)])
    else:
        clip = clip.subclipped(0, duration)
    return clip


def get_background(duration: float, width: int, height: int, fps: int, out_dir: Path, query: str = "football stadium"):
    provider = (SETTINGS.background_provider or "procedural").lower()
    if provider == "pexels":
        clip = pexels_background(duration, out_dir, query=query)
        return clip.resized(height=height).cropped(x_center=clip.w / 2, width=width)
    return procedural_background(duration, width, height, fps)
