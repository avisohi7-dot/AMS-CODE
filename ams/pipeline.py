"""Orchestrates one end-to-end run: topic -> outline -> chapters -> epub/pdf/cover/metadata."""

import json
import re
from pathlib import Path

from ams import compile as compiler
from ams import cover as cover_gen
from ams import llm


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:60] or "book"


def generate_book(topic: str, num_chapters: int = 8, author: str = "Anonymous", output_dir: str = "output") -> Path:
    outline = llm.generate_outline(topic, num_chapters)
    title, subtitle = outline["title"], outline.get("subtitle", "")

    book_dir = Path(output_dir) / _slugify(title)
    book_dir.mkdir(parents=True, exist_ok=True)
    (book_dir / "outline.json").write_text(json.dumps(outline, indent=2))

    chapters: list[tuple[str, str]] = []
    previous_excerpt = ""
    for i, chapter in enumerate(outline["chapters"], start=1):
        content = llm.generate_chapter(
            book_title=title,
            chapter_number=i,
            chapter_title=chapter["title"],
            summary=chapter["summary"],
            previous_excerpt=previous_excerpt,
        )
        chapters.append((chapter["title"], content))
        previous_excerpt = content[-600:]
        (book_dir / f"chapter_{i:02d}.md").write_text(f"## {chapter['title']}\n\n{content}\n")

    manuscript = f"# {title}\n\n### {subtitle}\n\n" + "\n\n".join(c for _, c in chapters)
    (book_dir / "manuscript.md").write_text(manuscript)

    compiler.build_epub(title, author, chapters, str(book_dir / "book.epub"))
    compiler.build_pdf(title, author, chapters, str(book_dir / "book.pdf"))
    cover_gen.build_cover(title, subtitle, author, str(book_dir / "cover.png"))

    metadata = llm.generate_metadata(
        title, subtitle, outline.get("target_audience", ""), [c["summary"] for c in outline["chapters"]]
    )
    metadata["title"] = title
    metadata["subtitle"] = subtitle
    metadata["author"] = author
    (book_dir / "metadata.json").write_text(json.dumps(metadata, indent=2))

    return book_dir
