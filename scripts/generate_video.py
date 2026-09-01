#!/usr/bin/env python3
"""CLI: generate one or more faceless football shorts.

Examples:
    python scripts/generate_video.py
    python scripts/generate_video.py --count 3 --category records
    python scripts/generate_video.py --prompt "Explain why offside exists" --queue
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ams.content.script import generate_script
from ams.content.topics import categories
from ams.publish.queue import enqueue
from ams.video.compose import render_video


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--count", type=int, default=1, help="how many videos to generate")
    parser.add_argument("--category", choices=categories(), help="restrict to one content category")
    parser.add_argument("--prompt", help="free-form topic prompt (uses an LLM provider if configured)")
    parser.add_argument("--seed", type=int, help="seed for reproducible offline topic selection")
    parser.add_argument("--no-music", action="store_true", help="skip background music track")
    parser.add_argument("--background-query", default="football stadium", help="Pexels search term (pexels provider only)")
    parser.add_argument("--queue", action="store_true", help="add to the local publish-ready queue")
    args = parser.parse_args()

    for i in range(args.count):
        seed = None if args.seed is None else args.seed + i
        script = generate_script(prompt=args.prompt, category=args.category, seed=seed)
        print(f"[{i + 1}/{args.count}] Script: {script.title}")

        result = render_video(script, background_query=args.background_query, add_music=not args.no_music)
        print(f"  -> video:    {result.video_path}")
        print(f"  -> captions: {result.srt_path}")
        print(f"  -> duration: {result.duration:.1f}s")

        if args.queue:
            enqueue(result.metadata_path)
            print("  -> queued for manual posting")


if __name__ == "__main__":
    main()
