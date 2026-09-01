"""Turns a topic (or free-form prompt) into a timed voiceover script."""
from __future__ import annotations

import json
import random
from dataclasses import dataclass, field

import requests

from ams.config import SETTINGS
from ams.content.topics import Topic, get_topics

_SYSTEM_PROMPT = (
    "You write short, punchy voiceover scripts for faceless football TikTok videos. "
    "Return ONLY compact JSON with keys: hook (one sentence, curiosity-driven), "
    "beats (array of 2-4 short sentences with the actual facts/story), "
    "cta (one sentence asking for a comment/follow/save), "
    "hashtags (array of 4-6 lowercase tags without #). "
    "No markdown, no commentary, just the JSON object. Keep total spoken text under 60 seconds "
    "at a normal speaking pace (~150 words)."
)


@dataclass
class Script:
    title: str
    hook: str
    beats: list[str]
    cta: str
    hashtags: list[str] = field(default_factory=list)
    category: str = "football"

    @property
    def lines(self) -> list[str]:
        """All spoken lines in order: hook, beats..., cta."""
        return [self.hook, *self.beats, self.cta]

    @property
    def full_text(self) -> str:
        return " ".join(self.lines)

    @property
    def word_count(self) -> int:
        return len(self.full_text.split())

    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "hook": self.hook,
            "beats": self.beats,
            "cta": self.cta,
            "hashtags": self.hashtags,
            "category": self.category,
        }


def _from_topic(topic: Topic) -> Script:
    return Script(
        title=topic.title,
        hook=topic.hook,
        beats=list(topic.beats),
        cta=topic.cta,
        hashtags=list(topic.hashtags),
        category=topic.category,
    )


def _offline_script(category: str | None, seed: int | None) -> Script:
    pool = get_topics(category)
    if not pool:
        pool = get_topics()
    rng = random.Random(seed)
    return _from_topic(rng.choice(pool))


def _call_anthropic(prompt: str) -> dict:
    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": SETTINGS.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-5",
            "max_tokens": 500,
            "system": _SYSTEM_PROMPT,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=30,
    )
    resp.raise_for_status()
    text = resp.json()["content"][0]["text"]
    return json.loads(text)


def _call_openai(prompt: str) -> dict:
    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {SETTINGS.openai_api_key}",
            "content-type": "application/json",
        },
        json={
            "model": "gpt-4o-mini",
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        },
        timeout=30,
    )
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"]
    return json.loads(text)


def generate_script(
    prompt: str | None = None,
    category: str | None = None,
    seed: int | None = None,
) -> Script:
    """Generate a script.

    - If SETTINGS.script_provider is 'anthropic'/'openai' and a key is configured and
      a free-form `prompt` is given, calls that LLM.
    - Otherwise falls back to the offline curated topic bank (no network needed).
    """
    provider = SETTINGS.script_provider.lower()

    if prompt and provider == "anthropic" and SETTINGS.anthropic_api_key:
        data = _call_anthropic(prompt)
        return Script(
            title=data["hook"].strip("? .!")[:70],
            hook=data["hook"],
            beats=data["beats"],
            cta=data["cta"],
            hashtags=data.get("hashtags", []),
            category=category or "football",
        )

    if prompt and provider == "openai" and SETTINGS.openai_api_key:
        data = _call_openai(prompt)
        return Script(
            title=data["hook"].strip("? .!")[:70],
            hook=data["hook"],
            beats=data["beats"],
            cta=data["cta"],
            hashtags=data.get("hashtags", []),
            category=category or "football",
        )

    return _offline_script(category, seed)
