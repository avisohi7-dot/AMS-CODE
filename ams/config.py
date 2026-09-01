import os

from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
MODEL = os.environ.get("AMS_MODEL", "claude-sonnet-5")
OUTPUT_DIR = os.environ.get("AMS_OUTPUT_DIR", "output")

ETSY_API_KEY = os.environ.get("ETSY_API_KEY")
ETSY_SHARED_SECRET = os.environ.get("ETSY_SHARED_SECRET")
ETSY_SHOP_ID = os.environ.get("ETSY_SHOP_ID")
ETSY_REDIRECT_URI = os.environ.get("ETSY_REDIRECT_URI", "http://localhost:3945/oauth/redirect")
ETSY_TOKEN_FILE = os.environ.get("ETSY_TOKEN_FILE", ".etsy_token.json")

BRAND_NAME = os.environ.get("AMS_BRAND_NAME", "Digital Dash Store")
BRAND_TAGLINE = os.environ.get(
    "AMS_BRAND_TAGLINE", "Prompt packs, workflows, templates, and mini-guides — built to run your business behind the scenes."
)
PRODUCTS_FILE = os.environ.get("AMS_PRODUCTS_FILE", "products.json")
ADMIN_USERNAME = os.environ.get("AMS_ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("AMS_ADMIN_PASSWORD", "change-me")
