# AMS-CODE

An automation pipeline for an AI "faceless" digital products business: it turns a topic into
a sellable ebook — outline, chapters, EPUB, PDF, cover image, and marketplace listing
metadata — with no author on camera and minimal manual writing.

## What it does

1. **`ideas`** — brainstorm sellable ebook titles for a niche.
2. **`generate`** — given a topic, runs the full pipeline:
   - generates a chapter-by-chapter outline
   - writes each chapter (with continuity between chapters)
   - compiles the manuscript into `book.epub` and `book.pdf`
   - generates a simple text-based `cover.png`
   - generates `metadata.json`: back-cover description, keywords, categories,
     suggested price, and a social media promo blurb — ready to paste into
     Amazon KDP, Gumroad, Payhip, etc.

Everything for one book lands in its own folder under `output/<book-slug>/`.

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env   # then add your ANTHROPIC_API_KEY
```

## Usage

```bash
# Brainstorm ideas in a niche
.venv/bin/python -m ams.cli ideas --niche "personal finance for freelancers"

# Generate a full ebook
.venv/bin/python -m ams.cli generate --topic "A 30-Day Plan to Escape Freelance Feast-or-Famine" \
  --chapters 8 --author "Jordan Blake"
```

Output:

```
output/a-30-day-plan-to-escape-freelance-feast-or-famine/
  outline.json
  chapter_01.md ... chapter_08.md
  manuscript.md
  book.epub
  book.pdf
  cover.png
  metadata.json
```

## Notes

- The cover generator produces a clean text-based placeholder cover, good enough to list
  a book. Swap in a real design tool (Canva, Midjourney, etc.) if a title needs a
  stronger cover.
- The LLM calls use `ANTHROPIC_API_KEY` and the model set by `AMS_MODEL` (defaults to
  `claude-sonnet-5`) via the `anthropic` Python SDK.
- Human review before publishing is on you — check facts, tone, and that the content
  meets the platform's AI-content disclosure policies before listing it for sale.
