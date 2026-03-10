"""
fetchers.py — Thin wrappers around Scrapling fetchers for common use-cases.

Three modes are supported:
  • fetch()           — fast HTTP request (impersonates a real browser TLS fingerprint)
  • stealthy_fetch()  — headless Chromium with anti-bot bypass (requires extras)
  • dynamic_fetch()   — full Playwright browser automation (requires extras)
  • parse_html()      — parse raw HTML strings without any network request
"""

from __future__ import annotations

from typing import Any

from scrapling.fetchers import Fetcher
from scrapling.parser import Selector


def fetch(
    url: str,
    *,
    method: str = "GET",
    impersonate: str = "chrome",
    stealthy_headers: bool = True,
    timeout: int = 30,
    **kwargs: Any,
) -> Selector:
    """Perform a fast HTTP request and return a Scrapling Selector.

    Args:
        url:              Target URL.
        method:           HTTP verb — 'GET' or 'POST'.
        impersonate:      Browser fingerprint to mimic ('chrome', 'firefox', …).
        stealthy_headers: Auto-generate realistic browser headers.
        timeout:          Request timeout in seconds.
        **kwargs:         Extra keyword arguments forwarded to Scrapling's Fetcher.

    Returns:
        A Scrapling ``Selector`` object ready for CSS/XPath queries.

    Example::

        page = fetch("https://quotes.toscrape.com/")
        for quote in page.css(".quote"):
            print(quote.css(".text::text").get())
    """
    if method.upper() == "POST":
        return Fetcher.post(url, stealthy_headers=stealthy_headers, **kwargs)
    return Fetcher.get(
        url,
        impersonate=impersonate,
        stealthy_headers=stealthy_headers,
        **kwargs,
    )


def stealthy_fetch(
    url: str,
    *,
    headless: bool = True,
    solve_cloudflare: bool = False,
    timeout: int = 30,
    **kwargs: Any,
) -> Selector:
    """Fetch a URL with stealth mode — bypasses most anti-bot checks.

    Requires the fetchers extra: ``pip install "scrapling[fetchers]"``
    and ``scrapling install`` to download browser binaries.

    Args:
        url:              Target URL.
        headless:         Run the browser headlessly (no visible window).
        solve_cloudflare: Attempt to auto-solve Cloudflare Turnstile challenges.
        timeout:          Page load timeout in seconds.
        **kwargs:         Extra keyword arguments forwarded to StealthyFetcher.

    Returns:
        A Scrapling ``Selector`` object ready for CSS/XPath queries.

    Example::

        page = stealthy_fetch("https://nopecha.com/demo/cloudflare", solve_cloudflare=True)
        print(page.css("body::text").get())
    """
    try:
        from scrapling.fetchers import StealthyFetcher
    except ImportError as exc:
        raise ImportError(
            "StealthyFetcher requires extra dependencies.\n"
            'Run: pip install "scrapling[fetchers]" && scrapling install'
        ) from exc

    return StealthyFetcher.fetch(
        url,
        headless=headless,
        network_idle=True,
        timeout=timeout * 1000,
        solve_cloudflare=solve_cloudflare,
        **kwargs,
    )


def dynamic_fetch(
    url: str,
    *,
    headless: bool = True,
    network_idle: bool = True,
    timeout: int = 30,
    **kwargs: Any,
) -> Selector:
    """Fetch a URL using full Playwright browser automation.

    Useful for JavaScript-heavy single-page applications (SPAs).

    Requires the fetchers extra: ``pip install "scrapling[fetchers]"``
    and ``scrapling install`` to download browser binaries.

    Args:
        url:          Target URL.
        headless:     Run browser headlessly.
        network_idle: Wait for all network activity to finish before returning.
        timeout:      Page load timeout in seconds.
        **kwargs:     Extra keyword arguments forwarded to DynamicFetcher.

    Returns:
        A Scrapling ``Selector`` object ready for CSS/XPath queries.

    Example::

        page = dynamic_fetch("https://spa-example.com/")
        items = page.css(".item::text").getall()
    """
    try:
        from scrapling.fetchers import DynamicFetcher
    except ImportError as exc:
        raise ImportError(
            "DynamicFetcher requires extra dependencies.\n"
            'Run: pip install "scrapling[fetchers]" && scrapling install'
        ) from exc

    return DynamicFetcher.fetch(
        url,
        headless=headless,
        network_idle=network_idle,
        timeout=timeout * 1000,
        **kwargs,
    )


def parse_html(html: str) -> Selector:
    """Parse a raw HTML string into a Scrapling Selector (no network call).

    Args:
        html: Raw HTML content as a string.

    Returns:
        A Scrapling ``Selector`` object ready for CSS/XPath queries.

    Example::

        page = parse_html("<html><body><h1>Hello</h1></body></html>")
        print(page.css("h1::text").get())
    """
    return Selector(html)
