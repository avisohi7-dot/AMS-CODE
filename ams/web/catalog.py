"""Product catalog: hand-curated digital products (products.json) plus ebooks the
generation pipeline has already produced (auto-discovered from output/*/metadata.json)."""

import json
from datetime import datetime
from pathlib import Path

from ams import config
from ams.util import slugify

TYPE_LABELS = {
    "prompt_pack": "Prompt Packs",
    "ai_workflow": "AI Workflows",
    "mini_guide": "Mini Guides",
    "template": "Templates",
    "ebook": "Ebooks",
}


def load_curated_products() -> list[dict]:
    path = Path(config.PRODUCTS_FILE)
    if not path.exists():
        return []
    return json.loads(path.read_text())


def save_curated_products(products: list[dict]) -> None:
    Path(config.PRODUCTS_FILE).write_text(json.dumps(products, indent=2))


def add_curated_product(product: dict) -> dict:
    products = load_curated_products()
    product["id"] = slugify(product["title"])
    products.append(product)
    save_curated_products(products)
    return product


def delete_curated_product(product_id: str) -> None:
    products = [p for p in load_curated_products() if p["id"] != product_id]
    save_curated_products(products)


def discover_ebooks(output_dir: str = None) -> list[dict]:
    output_dir = output_dir or config.OUTPUT_DIR
    books = []
    for book_dir in sorted(Path(output_dir).glob("*")):
        metadata_path = book_dir / "metadata.json"
        if not metadata_path.exists():
            continue
        metadata = json.loads(metadata_path.read_text())

        etsy_status, etsy_edit_url = None, None
        etsy_path = book_dir / "etsy_listing.json"
        if etsy_path.exists():
            etsy_listing = json.loads(etsy_path.read_text())
            etsy_status = etsy_listing.get("state")
            etsy_edit_url = etsy_listing.get("edit_url")

        books.append(
            {
                "id": book_dir.name,
                "type": "ebook",
                "title": metadata.get("title", book_dir.name),
                "description": metadata.get("back_cover_description", ""),
                "price": float(metadata.get("suggested_price_usd", 0)),
                "format": "EPUB + PDF",
                "featured": False,
                "source": "generated",
                "etsy_status": etsy_status,
                "etsy_edit_url": etsy_edit_url,
                "generated_at": datetime.fromtimestamp(metadata_path.stat().st_mtime).isoformat(),
            }
        )
    return books


def all_products() -> list[dict]:
    return load_curated_products() + discover_ebooks()
