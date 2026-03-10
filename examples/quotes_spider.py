"""
Example: Multi-page spider using Scrapling's Spider framework.

Crawls all pages of quotes.toscrape.com and exports results to JSON.

Run:
    uv run python examples/quotes_spider.py
"""

from scrapper_tools.spiders import BaseSpider, Response
from scrapper_tools.utils import clean_text


class QuotesSpider(BaseSpider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]
    concurrent_requests = 5
    download_delay = 0.3

    async def parse(self, response: Response):
        for quote in response.css(".quote"):
            yield {
                "text": clean_text(quote.css(".text::text").get()),
                "author": clean_text(quote.css(".author::text").get()),
                "tags": quote.css(".tag::text").getall(),
                "author_url": response.urljoin(
                    quote.css("span a::attr(href)").get() or ""
                ),
            }

        # Follow the "next" pagination link
        next_page = response.css(".next a")
        if next_page:
            yield response.follow(next_page[0].attrib["href"])


def main() -> None:
    print("Starting QuotesSpider …")
    result = QuotesSpider().run()
    print(f"\nScraped {len(result.items)} quotes total")

    # Export to JSON
    output = "quotes.json"
    result.items.to_json(output)
    print(f"Saved to {output}")

    # Print a preview
    for item in result.items[:3]:
        print(f"\n  \"{item['text']}\"")
        print(f"  — {item['author']}  [{', '.join(item['tags'])}]")


if __name__ == "__main__":
    main()
