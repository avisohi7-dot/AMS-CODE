"""Etsy Open API v3 integration: OAuth (PKCE) connect + creating draft digital listings.

Setup (one-time):
  1. Create an app at https://www.etsy.com/developers/your-apps to get an API key
     (keystring) and shared secret.
  2. In that app's settings, register the redirect URI you'll use (default here:
     http://localhost:3945/oauth/redirect — it doesn't need to be a live server, Etsy
     just needs to redirect the browser there; you'll copy the resulting URL by hand).
  3. Put ETSY_API_KEY / ETSY_SHARED_SECRET / ETSY_REDIRECT_URI in .env.
  4. Run `python -m ams.cli etsy-auth` and follow the printed instructions.
  5. Run `python -m ams.cli etsy-whoami` to discover your numeric shop_id, then put it
     in .env as ETSY_SHOP_ID.
"""

import base64
import hashlib
import json
import os
import secrets
import time
import urllib.parse
from pathlib import Path

import requests

from ams import config

AUTHORIZE_URL = "https://www.etsy.com/oauth/connect"
TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token"
API_BASE = "https://openapi.etsy.com/v3/application"
SCOPES = "listings_w listings_r shops_r"


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def generate_pkce_pair() -> tuple[str, str]:
    verifier = _b64url(secrets.token_bytes(64))
    challenge = _b64url(hashlib.sha256(verifier.encode()).digest())
    return verifier, challenge


def build_authorize_url(code_challenge: str, state: str) -> str:
    if not config.ETSY_API_KEY:
        raise RuntimeError("ETSY_API_KEY is not set. Add it to .env first.")
    params = {
        "response_type": "code",
        "client_id": config.ETSY_API_KEY,
        "redirect_uri": config.ETSY_REDIRECT_URI,
        "scope": SCOPES,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }
    return f"{AUTHORIZE_URL}?{urllib.parse.urlencode(params)}"


def exchange_code(code: str, code_verifier: str) -> dict:
    resp = requests.post(
        TOKEN_URL,
        json={
            "grant_type": "authorization_code",
            "client_id": config.ETSY_API_KEY,
            "redirect_uri": config.ETSY_REDIRECT_URI,
            "code": code,
            "code_verifier": code_verifier,
        },
    )
    resp.raise_for_status()
    return _save_token(resp.json())


def _save_token(token_data: dict) -> dict:
    token_data["obtained_at"] = int(time.time())
    Path(config.ETSY_TOKEN_FILE).write_text(json.dumps(token_data, indent=2))
    return token_data


def _load_token() -> dict:
    path = Path(config.ETSY_TOKEN_FILE)
    if not path.exists():
        raise RuntimeError("No Etsy token found. Run `python -m ams.cli etsy-auth` first.")
    return json.loads(path.read_text())


def _refresh_token(refresh_token: str) -> dict:
    resp = requests.post(
        TOKEN_URL,
        json={
            "grant_type": "refresh_token",
            "client_id": config.ETSY_API_KEY,
            "refresh_token": refresh_token,
        },
    )
    resp.raise_for_status()
    return _save_token(resp.json())


def get_access_token() -> str:
    token = _load_token()
    expires_at = token["obtained_at"] + token.get("expires_in", 3600)
    if time.time() >= expires_at - 60:
        token = _refresh_token(token["refresh_token"])
    return token["access_token"]


def _headers() -> dict:
    return {"x-api-key": config.ETSY_API_KEY, "Authorization": f"Bearer {get_access_token()}"}


def whoami() -> dict:
    """Resolves the connected user's shops (the numeric shop_id you need for .env)."""
    access_token = get_access_token()
    user_id = access_token.split(".")[0]
    resp = requests.get(f"{API_BASE}/users/{user_id}/shops", headers=_headers())
    resp.raise_for_status()
    return resp.json()


def search_taxonomy(query: str) -> list[dict]:
    resp = requests.get(f"{API_BASE}/seller-taxonomy/nodes", headers=_headers())
    resp.raise_for_status()
    nodes = resp.json()["results"]
    query = query.lower()

    matches = []

    def walk(node):
        if query in node["name"].lower():
            matches.append({"id": node["id"], "name": node["name"], "level": node.get("level")})
        for child in node.get("children", []):
            walk(child)

    for node in nodes:
        walk(node)
    return matches


def create_draft_listing(
    shop_id: str,
    title: str,
    description: str,
    price: float,
    taxonomy_id: int,
    tags: list[str],
    quantity: int = 999,
    who_made: str = "i_did",
    when_made: str = "made_to_order",
) -> dict:
    payload = {
        "quantity": quantity,
        "title": title[:140],
        "description": description,
        "price": price,
        "who_made": who_made,
        "when_made": when_made,
        "taxonomy_id": taxonomy_id,
        "type": "download",
        "is_supply": False,
        "tags": [t[:20] for t in tags[:13]],
        "state": "draft",
    }
    resp = requests.post(f"{API_BASE}/shops/{shop_id}/listings", headers=_headers(), json=payload)
    resp.raise_for_status()
    return resp.json()


def upload_digital_file(shop_id: str, listing_id: int, file_path: str, rank: int = 1) -> dict:
    with open(file_path, "rb") as f:
        resp = requests.post(
            f"{API_BASE}/shops/{shop_id}/listings/{listing_id}/files",
            headers=_headers(),
            data={"rank": rank, "name": os.path.basename(file_path)},
            files={"file": (os.path.basename(file_path), f)},
        )
    resp.raise_for_status()
    return resp.json()


def upload_listing_image(shop_id: str, listing_id: int, image_path: str, rank: int = 1) -> dict:
    with open(image_path, "rb") as f:
        resp = requests.post(
            f"{API_BASE}/shops/{shop_id}/listings/{listing_id}/images",
            headers=_headers(),
            data={"rank": rank},
            files={"image": (os.path.basename(image_path), f)},
        )
    resp.raise_for_status()
    return resp.json()


def publish_draft(book_dir: str, taxonomy_id: int, price: float | None = None, quantity: int = 999) -> dict:
    """Reads a generated book folder (outline.json/metadata.json/book.epub/book.pdf/cover.png)
    and creates a matching DRAFT listing in the connected Etsy shop. Draft listings are not
    public and cost nothing until you publish them yourself in Etsy's Shop Manager."""
    if not config.ETSY_SHOP_ID:
        raise RuntimeError("ETSY_SHOP_ID is not set. Run `etsy-whoami` to find it, then add it to .env.")

    book_dir = Path(book_dir)
    metadata = json.loads((book_dir / "metadata.json").read_text())

    title = f"{metadata['title']}: {metadata['subtitle']}" if metadata.get("subtitle") else metadata["title"]
    listing = create_draft_listing(
        shop_id=config.ETSY_SHOP_ID,
        title=title,
        description=metadata.get("back_cover_description", ""),
        price=price if price is not None else float(metadata.get("suggested_price_usd", 9.99)),
        taxonomy_id=taxonomy_id,
        tags=metadata.get("keywords", []),
        quantity=quantity,
    )
    listing_id = listing["listing_id"]

    for rank, filename in enumerate(("book.epub", "book.pdf"), start=1):
        file_path = book_dir / filename
        if file_path.exists():
            upload_digital_file(config.ETSY_SHOP_ID, listing_id, str(file_path), rank=rank)

    cover_path = book_dir / "cover.png"
    if cover_path.exists():
        upload_listing_image(config.ETSY_SHOP_ID, listing_id, str(cover_path))

    result = {
        "listing_id": listing_id,
        "state": listing.get("state"),
        "edit_url": f"https://www.etsy.com/your/shops/me/tools/listings/{listing_id}",
    }
    (book_dir / "etsy_listing.json").write_text(json.dumps(result, indent=2))
    return result
