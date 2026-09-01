"""Assembles narration + background + burned-in captions into a finished
vertical MP4 ready to upload to TikTok / Reels / Shorts."""
from __future__ import annotations

import json
import random
import re
import uuid
from dataclasses import dataclass
from pathlib import Path

from ams.audio.tts import synthesize
from ams.captions.captions import build_word_cues, group_cues_into_captions, write_srt
from ams.config import FONTS_DIR, MUSIC_DIR, OUTPUT_DIR, SETTINGS
from ams.content.script import Script
from ams.visuals.background import get_background

_DEFAULT_FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


@dataclass
class RenderResult:
    video_path: Path
    srt_path: Path
    metadata_path: Path
    duration: float


def _resolve_font() -> str:
    custom_fonts = list(FONTS_DIR.glob("*.ttf")) if FONTS_DIR.exists() else []
    for candidate in [*custom_fonts, *_DEFAULT_FONT_CANDIDATES]:
        if Path(candidate).exists():
            return str(candidate)
    raise FileNotFoundError(
        "No usable .ttf font found. Install DejaVu fonts or drop a .ttf into assets/fonts/"
    )


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:60] or "football-short"


def _build_caption_clips(captions: list[tuple[str, float, float]], width: int, height: int, font: str):
    from moviepy import TextClip

    clips = []
    safe_width = int(width * 0.9)
    for text, start, end in captions:
        dur = max(end - start, 0.05)
        clip = (
            TextClip(
                font=font,
                text=text.upper(),
                font_size=84,
                size=(safe_width, None),
                color="white",
                stroke_color="black",
                stroke_width=6,
                method="caption",
                text_align="center",
                horizontal_align="center",
            )
            .with_start(start)
            .with_duration(dur)
            .with_position(("center", int(height * 0.62)))
        )
        clips.append(clip)
    return clips


def render_video(
    script: Script,
    out_dir: Path | None = None,
    background_query: str = "football stadium",
    add_music: bool = True,
) -> RenderResult:
    from moviepy import AudioFileClip, CompositeAudioClip, CompositeVideoClip

    out_dir = Path(out_dir) if out_dir else OUTPUT_DIR
    job_id = f"{_slugify(script.title)}-{uuid.uuid4().hex[:6]}"
    job_dir = out_dir / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    narration = synthesize(script.full_text, job_dir / "narration")
    duration = narration.duration + 0.6  # small tail so the last caption/CTA doesn't get cut

    width, height, fps = SETTINGS.width, SETTINGS.height, SETTINGS.fps

    background = get_background(duration, width, height, fps, job_dir, query=background_query)
    background = background.with_duration(duration)

    cues = build_word_cues(script.lines, narration.duration)
    captions = group_cues_into_captions(cues, max_words=3)
    srt_path = write_srt(captions, job_dir / "captions.srt")

    font = _resolve_font()
    caption_clips = _build_caption_clips(captions, width, height, font)

    from moviepy import AudioClip, concatenate_audioclips

    voice = AudioFileClip(str(narration.audio_path))
    tail = duration - voice.duration
    if tail > 0:
        silence = AudioClip(lambda t: 0.0, duration=tail, fps=voice.fps).with_fps(voice.fps)
        voice = concatenate_audioclips([voice, silence])
    audio_tracks = [voice]

    if add_music:
        music_files = list(MUSIC_DIR.glob("*.mp3")) if MUSIC_DIR.exists() else []
        if music_files:
            music = AudioFileClip(str(random.choice(music_files)))
            if music.duration < duration:
                loops = int(duration // music.duration) + 1
                music = concatenate_audioclips([music] * loops)
            music = music.subclipped(0, duration).with_volume_scaled(0.12)
            audio_tracks.append(music)

    final_audio = CompositeAudioClip(audio_tracks) if len(audio_tracks) > 1 else voice
    video = CompositeVideoClip([background, *caption_clips], size=(width, height)).with_audio(final_audio).with_duration(duration)

    video_path = job_dir / "final.mp4"
    video.write_videofile(
        str(video_path),
        fps=fps,
        codec="libx264",
        audio_codec="aac",
        threads=4,
        preset="medium",
        logger=None,
    )

    for c in [voice, background, video, *caption_clips]:
        try:
            c.close()
        except Exception:
            pass

    caption_text = script.hook + "\n\n" + " ".join(f"#{h}" for h in script.hashtags)
    metadata = {
        "title": script.title,
        "caption": caption_text,
        "hashtags": script.hashtags,
        "category": script.category,
        "duration_seconds": round(duration, 2),
        "video_path": str(video_path),
        "srt_path": str(srt_path),
    }
    metadata_path = job_dir / "metadata.json"
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    return RenderResult(video_path=video_path, srt_path=srt_path, metadata_path=metadata_path, duration=duration)
