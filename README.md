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

## Selling on Etsy

Connects to your Etsy shop via OAuth and creates **draft** listings — files and cover
uploaded, but nothing goes public or costs a listing fee until you review and publish
it yourself in Etsy's Shop Manager.

Setup (one-time):

```bash
# 1. Create an app at https://www.etsy.com/developers/your-apps
#    Register the redirect URI you'll use (default: http://localhost:3945/oauth/redirect —
#    it doesn't need to be a live server).
# 2. Add ETSY_API_KEY / ETSY_SHARED_SECRET / ETSY_REDIRECT_URI to .env

.venv/bin/python -m ams.cli etsy-auth
# opens an authorize URL for you to visit; paste back the redirected URL it gives you

.venv/bin/python -m ams.cli etsy-whoami
# prints your numeric shop_id -> add it to .env as ETSY_SHOP_ID
```

Usage:

```bash
# Find the Etsy category (taxonomy_id) to list under, once
.venv/bin/python -m ams.cli etsy-taxonomy --query "ebook"

# Create a draft listing for a generated book
.venv/bin/python -m ams.cli etsy-list --book-dir output/my-book --taxonomy-id 2078
```

The listing's edit URL is printed and saved to `<book-dir>/etsy_listing.json`. It stays
a private draft until you publish it from Etsy directly.

## Storefront + admin dashboard

`ams.cli serve` runs a small web app with two pages:

- **`/`** — a public storefront listing every product in `products.json` plus every
  ebook the pipeline has generated (auto-discovered from `output/*/metadata.json`),
  with category filter pills.
- **`/admin/dashboard`** — catalog and pipeline metrics (products, ebooks generated,
  Etsy drafts pending review, catalog value), a table of generated ebooks with their
  Etsy status, and a form to add/remove hand-curated products. Protected by HTTP
  Basic Auth (`AMS_ADMIN_USERNAME` / `AMS_ADMIN_PASSWORD` in `.env` — **set a real
  password before deploying this anywhere public**; it defaults to `change-me`).

```bash
.venv/bin/python -m ams.cli serve --port 5000
# storefront:  http://127.0.0.1:5000/
# dashboard:   http://127.0.0.1:5000/admin/dashboard
```

Non-ebook products (prompt packs, AI workflows, mini-guides, templates) are managed
by hand in `products.json` or via the dashboard's "Add a product" form — this repo
doesn't yet generate content for those categories, only ebooks.

## Notes

- The cover generator produces a clean text-based placeholder cover, good enough to list
  a book. Swap in a real design tool (Canva, Midjourney, etc.) if a title needs a
  stronger cover.
- The LLM calls use `ANTHROPIC_API_KEY` and the model set by `AMS_MODEL` (defaults to
  `claude-sonnet-5`) via the `anthropic` Python SDK.
- Human review before publishing is on you — check facts, tone, and that the content
  meets the platform's AI-content disclosure policies before listing it for sale.
