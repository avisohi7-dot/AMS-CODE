import click

from ams import llm
from ams.pipeline import generate_book


@click.group()
def cli():
    """AMS: AI-generated ebook production pipeline."""


@cli.command()
@click.option("--niche", required=True, help='Niche to brainstorm in, e.g. "personal finance for freelancers"')
@click.option("--count", default=10, show_default=True, help="Number of title ideas to generate")
def ideas(niche: str, count: int):
    """Brainstorm sellable ebook titles for a niche."""
    for i, idea in enumerate(llm.generate_ideas(niche, count), start=1):
        click.echo(f"{i}. {idea}")


@cli.command()
@click.option("--topic", required=True, help="Ebook topic or working title")
@click.option("--chapters", default=8, show_default=True, help="Number of chapters")
@click.option("--author", default="Anonymous", show_default=True, help="Pen name / author byline")
@click.option("--output-dir", default="output", show_default=True)
def generate(topic: str, chapters: int, author: str, output_dir: str):
    """Generate a complete ebook (outline, chapters, EPUB, PDF, cover, listing metadata)."""
    click.echo(f'Generating "{topic}" ({chapters} chapters)...')
    book_dir = generate_book(topic, num_chapters=chapters, author=author, output_dir=output_dir)
    click.echo(f"Done. Output written to {book_dir}/")


if __name__ == "__main__":
    cli()
