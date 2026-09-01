"""Turns generated Markdown chapters into a distributable EPUB and PDF."""

import io

import markdown as md
from ebooklib import epub
from xhtml2pdf import pisa


def build_epub(title: str, author: str, chapters: list[tuple[str, str]], output_path: str) -> None:
    book = epub.EpubBook()
    book.set_identifier(title.lower().replace(" ", "-"))
    book.set_title(title)
    book.set_language("en")
    book.add_author(author)

    epub_chapters = []
    for i, (chapter_title, content_md) in enumerate(chapters, start=1):
        html_body = md.markdown(content_md)
        item = epub.EpubHtml(title=chapter_title, file_name=f"chap_{i:02d}.xhtml", lang="en")
        item.content = f"<h1>{chapter_title}</h1>{html_body}"
        book.add_item(item)
        epub_chapters.append(item)

    book.toc = epub_chapters
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = ["nav"] + epub_chapters

    epub.write_epub(output_path, book)


def build_pdf(title: str, author: str, chapters: list[tuple[str, str]], output_path: str) -> None:
    sections = [f"<h1>{title}</h1><p><i>by {author}</i></p>"]
    for chapter_title, content_md in chapters:
        sections.append(f'<div style="page-break-before: always;">')
        sections.append(md.markdown(content_md))
        sections.append("</div>")
    html = f"<html><body>{''.join(sections)}</body></html>"

    with open(output_path, "wb") as f:
        result = pisa.CreatePDF(io.StringIO(html), dest=f)
    if result.err:
        raise RuntimeError(f"PDF generation failed with {result.err} error(s)")
