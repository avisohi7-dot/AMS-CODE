"""Thin wrapper around the Anthropic API for every generation step in the pipeline."""

import json
import re

import anthropic

from ams import config

_client = None


def client():
    global _client
    if _client is None:
        if not config.ANTHROPIC_API_KEY:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
            )
        _client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    return _client


def _complete(prompt: str, max_tokens: int = 4096, system: str | None = None) -> str:
    kwargs = {}
    if system:
        kwargs["system"] = system
    message = client().messages.create(
        model=config.MODEL,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
        **kwargs,
    )
    return "".join(block.text for block in message.content if block.type == "text")


def _extract_json(text: str) -> dict:
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    candidate = fenced.group(1) if fenced else text
    start, end = candidate.find("{"), candidate.rfind("}")
    return json.loads(candidate[start : end + 1])


def generate_ideas(niche: str, count: int = 10) -> list[str]:
    prompt = (
        f"Suggest {count} specific, commercially viable nonfiction ebook titles for the "
        f'niche "{niche}". Each should target a clear buyer pain point that a short, '
        "practical ebook can solve (not a broad topic). "
        'Respond with ONLY a JSON object: {"ideas": ["title 1", "title 2", ...]}'
    )
    data = _extract_json(_complete(prompt, max_tokens=1024))
    return data["ideas"]


def generate_outline(topic: str, num_chapters: int) -> dict:
    prompt = (
        f'Design a nonfiction ebook based on this topic/title: "{topic}".\n'
        f"It should have exactly {num_chapters} chapters.\n"
        "Respond with ONLY a JSON object of this shape:\n"
        "{\n"
        '  "title": "...",\n'
        '  "subtitle": "...",\n'
        '  "target_audience": "...",\n'
        '  "chapters": [{"title": "...", "summary": "1-2 sentence brief of what it covers"}]\n'
        "}"
    )
    return _extract_json(_complete(prompt, max_tokens=2048))


def generate_chapter(
    book_title: str, chapter_number: int, chapter_title: str, summary: str, previous_excerpt: str
) -> str:
    context = (
        f"For continuity, here is the end of the previous chapter:\n\"\"\"\n{previous_excerpt}\n\"\"\"\n"
        if previous_excerpt
        else "This is the first chapter.\n"
    )
    prompt = (
        f'Write chapter {chapter_number} of the nonfiction ebook "{book_title}".\n'
        f'Chapter title: "{chapter_title}"\n'
        f"What this chapter should cover: {summary}\n"
        f"{context}"
        "Write 900-1400 words of clear, practical, well-organized content in Markdown. "
        "Use a level-2 heading (##) for the chapter title, then prose with occasional "
        "subheadings, short paragraphs, and bullet lists where useful. Do not repeat "
        "content from other chapters. Do not add a preamble like 'Here is the chapter' — "
        "output only the chapter content itself."
    )
    return _complete(prompt, max_tokens=4096)


def generate_metadata(title: str, subtitle: str, target_audience: str, chapter_summaries: list[str]) -> dict:
    outline_text = "\n".join(f"- {s}" for s in chapter_summaries)
    prompt = (
        f'Create marketplace listing metadata for the ebook "{title}: {subtitle}", '
        f"targeted at: {target_audience}.\n"
        f"Chapters cover:\n{outline_text}\n\n"
        "Respond with ONLY a JSON object of this shape:\n"
        "{\n"
        '  "back_cover_description": "150-250 word sales description, benefit-driven",\n'
        '  "keywords": ["7 SEO/marketplace keywords"],\n'
        '  "categories": ["2-3 store categories, e.g. Amazon KDP / Gumroad categories"],\n'
        '  "suggested_price_usd": 9.99,\n'
        '  "social_blurb": "1-2 sentence hook for a social media promo post"\n'
        "}"
    )
    return _extract_json(_complete(prompt, max_tokens=1024))
