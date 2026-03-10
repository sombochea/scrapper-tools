"""
spiders.py — Reusable Spider base and helpers built on top of Scrapling's Spider.

BaseSpider wraps Scrapling's Spider with sensible defaults and a convenient
``run()`` shortcut method.

Usage::

    from scrapper_tools.spiders import BaseSpider, Response

    class QuotesSpider(BaseSpider):
        name = "quotes"
        start_urls = ["https://quotes.toscrape.com/"]

        async def parse(self, response: Response):
            for quote in response.css(".quote"):
                yield {
                    "text": quote.css(".text::text").get(),
                    "author": quote.css(".author::text").get(),
                    "tags": quote.css(".tag::text").getall(),
                }
            next_page = response.css(".next a")
            if next_page:
                yield response.follow(next_page[0].attrib["href"])

    result = QuotesSpider().run()
    print(result.items)
"""

from __future__ import annotations

from typing import Any

from scrapling.spiders import Spider, Response, Request  # noqa: F401 — re-exported


class BaseSpider(Spider):
    """A thin Spider subclass with sensible defaults.

    Attributes:
        name:               Unique identifier for the spider.
        start_urls:         List of seed URLs to crawl.
        concurrent_requests: Maximum number of in-flight requests.
        download_delay:     Seconds to wait between requests (politeness).
    """

    name: str = "base"
    start_urls: list[str] = []
    concurrent_requests: int = 5
    download_delay: float = 0.5

    def run(self, crawldir: str | None = None, **kwargs: Any) -> Any:
        """Start the spider and return the crawl result.

        Args:
            crawldir: Optional directory path for checkpoint persistence.
                      If provided, progress is saved and can be resumed.
            **kwargs: Additional keyword arguments forwarded to ``start()``.

        Returns:
            The spider result object.  Access ``result.items`` for scraped data,
            ``result.items.to_json(path)`` to export, etc.

        Example::

            result = MySpider().run()
            for item in result.items:
                print(item)
        """
        if crawldir:
            return self.start(crawldir=crawldir, **kwargs)
        return self.start(**kwargs)
