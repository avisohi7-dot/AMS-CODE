"""Central configuration, all overridable via environment variables / .env."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

ROOT_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT_DIR / "assets"
OUTPUT_DIR = ROOT_DIR / "output"
BACKGROUNDS_DIR = ASSETS_DIR / "backgrounds"
MUSIC_DIR = ASSETS_DIR / "music"
FONTS_DIR = ASSETS_DIR / "fonts"


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


@dataclass
class Settings:
    # Video format (TikTok / Reels / Shorts all use vertical 9:16)
    width: int = 1080
    height: int = 1920
    fps: int = 30

    # Script generation
    script_provider: str = field(default_factory=lambda: _env("SCRIPT_PROVIDER", "offline"))
    anthropic_api_key: str = field(default_factory=lambda: _env("ANTHROPIC_API_KEY"))
    openai_api_key: str = field(default_factory=lambda: _env("OPENAI_API_KEY"))

    # Text-to-speech
    tts_provider: str = field(default_factory=lambda: _env("TTS_PROVIDER", "offline"))
    elevenlabs_api_key: str = field(default_factory=lambda: _env("ELEVENLABS_API_KEY"))
    elevenlabs_voice_id: str = field(default_factory=lambda: _env("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM"))
    openai_tts_voice: str = field(default_factory=lambda: _env("OPENAI_TTS_VOICE", "alloy"))
    offline_voice: str = field(default_factory=lambda: _env("OFFLINE_TTS_VOICE", "en-us"))
    offline_speed_wpm: int = int(_env("OFFLINE_TTS_SPEED", "165"))

    # Backgrounds
    background_provider: str = field(default_factory=lambda: _env("BACKGROUND_PROVIDER", "procedural"))
    pexels_api_key: str = field(default_factory=lambda: _env("PEXELS_API_KEY"))

    # Captions
    caption_style: str = field(default_factory=lambda: _env("CAPTION_STYLE", "karaoke"))
    caption_font: str = field(default_factory=lambda: _env("CAPTION_FONT", "DejaVu-Sans-Bold"))

    # Publishing (optional, requires the user's own developer app credentials)
    instagram_access_token: str = field(default_factory=lambda: _env("IG_ACCESS_TOKEN"))
    instagram_business_id: str = field(default_factory=lambda: _env("IG_BUSINESS_ACCOUNT_ID"))
    tiktok_access_token: str = field(default_factory=lambda: _env("TIKTOK_ACCESS_TOKEN"))


SETTINGS = Settings()
