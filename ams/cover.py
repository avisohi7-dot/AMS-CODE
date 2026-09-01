"""Generates a simple text-based cover image. Good enough to list a book; swap in a
real design tool (Canva, Midjourney, etc.) later if a title needs to stand out more."""

import hashlib
import textwrap

from PIL import Image, ImageDraw, ImageFont

PALETTE = [
    ((17, 24, 39), (255, 255, 255)),
    ((30, 58, 138), (255, 255, 255)),
    ((6, 78, 59), (255, 255, 255)),
    ((88, 28, 135), (255, 255, 255)),
    ((124, 45, 18), (255, 255, 255)),
    ((15, 23, 42), (226, 232, 240)),
]

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
]


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


def build_cover(title: str, subtitle: str, author: str, output_path: str, size=(1600, 2400)) -> None:
    bg, fg = PALETTE[int(hashlib.sha256(title.encode()).hexdigest(), 16) % len(PALETTE)]
    width, height = size
    img = Image.new("RGB", size, bg)
    draw = ImageDraw.Draw(img)

    title_font = _load_font(110)
    subtitle_font = _load_font(56)
    author_font = _load_font(48)

    y = height * 0.32
    for line in textwrap.wrap(title, width=16):
        bbox = draw.textbbox((0, 0), line, font=title_font)
        draw.text(((width - (bbox[2] - bbox[0])) / 2, y), line, font=title_font, fill=fg)
        y += (bbox[3] - bbox[1]) * 1.35

    y += 60
    for line in textwrap.wrap(subtitle, width=32):
        bbox = draw.textbbox((0, 0), line, font=subtitle_font)
        draw.text(((width - (bbox[2] - bbox[0])) / 2, y), line, font=subtitle_font, fill=fg)
        y += (bbox[3] - bbox[1]) * 1.4

    bbox = draw.textbbox((0, 0), author, font=author_font)
    draw.text(((width - (bbox[2] - bbox[0])) / 2, height * 0.9), author, font=author_font, fill=fg)

    img.save(output_path)
