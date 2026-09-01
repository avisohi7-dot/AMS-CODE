import os

from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
MODEL = os.environ.get("AMS_MODEL", "claude-sonnet-5")
OUTPUT_DIR = os.environ.get("AMS_OUTPUT_DIR", "output")
