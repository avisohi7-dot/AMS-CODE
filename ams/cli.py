import urllib.parse

import click

from ams import etsy, llm
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


@cli.command("etsy-auth")
def etsy_auth():
    """One-time OAuth connect to your Etsy shop."""
    verifier, challenge = etsy.generate_pkce_pair()
    state = verifier[:16]
    url = etsy.build_authorize_url(challenge, state)

    click.echo("1. Open this URL, log in, and click 'Allow Access':\n")
    click.echo(f"   {url}\n")
    click.echo("2. Etsy will redirect your browser to a URL that may look broken/404 —")
    click.echo("   that's expected. Copy that FULL URL from your browser's address bar.\n")
    redirected_url = click.prompt("Paste the full redirected URL here")

    query = urllib.parse.urlparse(redirected_url).query
    params = urllib.parse.parse_qs(query)
    if params.get("state", [None])[0] != state:
        raise click.ClickException("State mismatch — please re-run etsy-auth and try again.")
    code = params.get("code", [None])[0]
    if not code:
        raise click.ClickException("No 'code' found in that URL.")

    etsy.exchange_code(code, verifier)
    click.echo(f"Connected. Token saved to {etsy.config.ETSY_TOKEN_FILE}.")
    click.echo("Next: run `etsy-whoami` to find your shop_id, then add it to .env as ETSY_SHOP_ID.")


@cli.command("etsy-whoami")
def etsy_whoami():
    """Look up the shop_id(s) for the connected Etsy account."""
    for shop in etsy.whoami().get("results", []):
        click.echo(f"shop_id={shop['shop_id']}  name={shop['shop_name']}")


@cli.command("etsy-taxonomy")
@click.option("--query", required=True, help='Search term, e.g. "ebook" or "digital prints"')
def etsy_taxonomy(query: str):
    """Find the taxonomy_id Etsy requires for a listing category."""
    for node in etsy.search_taxonomy(query):
        click.echo(f"id={node['id']}  {node['name']}")


@cli.command("etsy-list")
@click.option("--book-dir", required=True, help="Path to a generated book folder, e.g. output/my-book")
@click.option("--taxonomy-id", required=True, type=int, help="From `etsy-taxonomy`")
@click.option("--price", default=None, type=float, help="Overrides the AI-suggested price")
@click.option("--quantity", default=999, show_default=True, help="Digital listings can set this high")
def etsy_list(book_dir: str, taxonomy_id: int, price: float | None, quantity: int):
    """Create a DRAFT Etsy listing for a generated book (files + cover uploaded, not public)."""
    result = etsy.publish_draft(book_dir, taxonomy_id=taxonomy_id, price=price, quantity=quantity)
    click.echo(f"Draft listing created: {result['edit_url']}")
    click.echo("It is NOT public. Review it in Etsy's Shop Manager and publish it yourself when ready.")


@cli.command()
@click.option("--host", default="127.0.0.1", show_default=True)
@click.option("--port", default=5000, show_default=True)
@click.option("--debug", is_flag=True, help="Enable Flask debug/reload mode")
def serve(host: str, port: int, debug: bool):
    """Run the storefront + admin dashboard web app."""
    from ams import config
    from ams.web.app import app

    if config.ADMIN_PASSWORD == "change-me":
        click.echo("WARNING: AMS_ADMIN_PASSWORD is not set — using the insecure default. Set it in .env.")
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    cli()
