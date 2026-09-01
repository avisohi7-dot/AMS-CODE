"""Caption timing + subtitle export.

We don't get word-level timestamps from most TTS engines, so we estimate
them by distributing the known total narration duration across words,
weighted by word length (longer words take a bit longer to say). This is
accurate enough for karaoke-style burned-in captions on short-form video.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class WordCue:
    text: str
    start: float
    end: float


def build_word_cues(lines: list[str], total_duration: float) -> list[WordCue]:
    words: list[str] = []
    for line in lines:
        words.extend(line.split())
    if not words:
        return []

    weights = [max(len(w), 3) for w in words]
    total_weight = sum(weights)

    cues: list[WordCue] = []
    t = 0.0
    for word, weight in zip(words, weights):
        dur = total_duration * (weight / total_weight)
        cues.append(WordCue(text=word, start=t, end=t + dur))
        t += dur
    return cues


def group_cues_into_captions(cues: list[WordCue], max_words: int = 4) -> list[tuple[str, float, float]]:
    """Group word cues into short on-screen caption chunks (2-4 words each),
    the standard TikTok karaoke-caption look."""
    groups: list[tuple[str, float, float]] = []
    for i in range(0, len(cues), max_words):
        chunk = cues[i : i + max_words]
        text = " ".join(c.text for c in chunk)
        groups.append((text, chunk[0].start, chunk[-1].end))
    return groups


def _srt_timestamp(seconds: float) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def write_srt(captions: list[tuple[str, float, float]], out_path: Path) -> Path:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    lines = []
    for idx, (text, start, end) in enumerate(captions, start=1):
        lines.append(str(idx))
        lines.append(f"{_srt_timestamp(start)} --> {_srt_timestamp(end)}")
        lines.append(text)
        lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")
    return out_path
