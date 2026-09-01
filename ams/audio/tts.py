"""Text-to-speech provider abstraction.

Providers, selected via SETTINGS.tts_provider:
  - "offline"    : espeak-ng, no network, no API key (default, always works)
  - "gtts"       : Google Translate TTS (free, needs internet, no API key)
  - "elevenlabs" : ElevenLabs API (needs ELEVENLABS_API_KEY, best quality)
  - "openai"     : OpenAI TTS API (needs OPENAI_API_KEY)
"""
from __future__ import annotations

import shutil
import subprocess
import wave
from dataclasses import dataclass
from pathlib import Path

import requests

from ams.config import SETTINGS


@dataclass
class Narration:
    audio_path: Path
    duration: float  # seconds


def _wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as f:
        return f.getnframes() / float(f.getframerate())


def _mp3_duration(path: Path) -> float:
    from moviepy import AudioFileClip

    clip = AudioFileClip(str(path))
    duration = clip.duration
    clip.close()
    return duration


def _tts_offline(text: str, out_path: Path) -> Narration:
    if not shutil.which("espeak-ng"):
        raise RuntimeError("espeak-ng not found; install it or set TTS_PROVIDER to another option")
    wav_path = out_path.with_suffix(".wav")
    subprocess.run(
        [
            "espeak-ng",
            "-v", SETTINGS.offline_voice,
            "-s", str(SETTINGS.offline_speed_wpm),
            "-w", str(wav_path),
            text,
        ],
        check=True,
        capture_output=True,
    )
    return Narration(audio_path=wav_path, duration=_wav_duration(wav_path))


def _tts_gtts(text: str, out_path: Path) -> Narration:
    from gtts import gTTS

    mp3_path = out_path.with_suffix(".mp3")
    gTTS(text=text, lang="en").save(str(mp3_path))
    return Narration(audio_path=mp3_path, duration=_mp3_duration(mp3_path))


def _tts_elevenlabs(text: str, out_path: Path) -> Narration:
    if not SETTINGS.elevenlabs_api_key:
        raise RuntimeError("ELEVENLABS_API_KEY is not set")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{SETTINGS.elevenlabs_voice_id}"
    resp = requests.post(
        url,
        headers={
            "xi-api-key": SETTINGS.elevenlabs_api_key,
            "content-type": "application/json",
            "accept": "audio/mpeg",
        },
        json={
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.4, "similarity_boost": 0.8},
        },
        timeout=60,
    )
    resp.raise_for_status()
    mp3_path = out_path.with_suffix(".mp3")
    mp3_path.write_bytes(resp.content)
    return Narration(audio_path=mp3_path, duration=_mp3_duration(mp3_path))


def _tts_openai(text: str, out_path: Path) -> Narration:
    if not SETTINGS.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    resp = requests.post(
        "https://api.openai.com/v1/audio/speech",
        headers={"Authorization": f"Bearer {SETTINGS.openai_api_key}"},
        json={"model": "tts-1", "voice": SETTINGS.openai_tts_voice, "input": text},
        timeout=60,
    )
    resp.raise_for_status()
    mp3_path = out_path.with_suffix(".mp3")
    mp3_path.write_bytes(resp.content)
    return Narration(audio_path=mp3_path, duration=_mp3_duration(mp3_path))


_PROVIDERS = {
    "offline": _tts_offline,
    "gtts": _tts_gtts,
    "elevenlabs": _tts_elevenlabs,
    "openai": _tts_openai,
}


def synthesize(text: str, out_path: Path, provider: str | None = None) -> Narration:
    """Render `text` to speech, writing the audio next to `out_path` (extension
    is chosen by the provider) and returning the resulting path + duration."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    chosen = (provider or SETTINGS.tts_provider or "offline").lower()
    fn = _PROVIDERS.get(chosen)
    if fn is None:
        raise ValueError(f"Unknown TTS provider: {chosen!r}. Options: {sorted(_PROVIDERS)}")
    return fn(text, out_path)
