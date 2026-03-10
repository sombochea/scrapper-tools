"""
Example: Basic HTTP scraping with Scrapling's Fetcher.

Scrapes quotes from quotes.toscrape.com using a plain HTTP request.
No browser required.

Run:
    uv run python examples/basic_scrape.py
"""

from scrapper_tools import fetch
from scrapper_tools.utils import clean_text


def main() -> None:
    print("Fetching quotes.toscrape.com …")
    page = fetch("https://quotes.toscrape.com/")

    quotes = page.css(".quote")
    print(f"Found {len(quotes)} quotes on this page\n")

    for i, quote in enumerate(quotes, 1):
        text = clean_text(quote.css(".text::text").get())
        author = clean_text(quote.css(".author::text").get())
        tags = quote.css(".tag::text").getall()
        print(f"{i:>2}. {text}")
        print(f"    — {author}  |  tags: {', '.join(tags)}")
        print()


if __name__ == "__main__":
    main()
