"""
cli.py — Command-line interface for scrapper-tools.

Commands:
  fetch  <url>              Fetch a URL and print text content
  links  <url>              Print all links found on a page
  emails <url>              Extract email addresses from a page
  parse  <file>             Parse a local HTML file

Usage:
    uv run scrapper-tools fetch https://example.com
    uv run scrapper-tools links https://example.com
    uv run scrapper-tools emails https://example.com
    uv run scrapper-tools parse /path/to/page.html
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .fetchers import fetch, parse_html
from .utils import clean_text, extract_emails, extract_urls


def cmd_fetch(args: argparse.Namespace) -> None:
    """Fetch a URL and print its text content."""
    print(f"Fetching {args.url} …", file=sys.stderr)
    page = fetch(args.url)
    selector = args.selector or "body"
    elements = page.css(f"{selector}::text").getall()
    if not elements:
        # fall back to the full element text
        elements = [page.css(selector).get() or ""]
    for text in elements:
        cleaned = clean_text(text)
        if cleaned:
            print(cleaned)


def cmd_links(args: argparse.Namespace) -> None:
    """Fetch a URL and print every unique link found on the page."""
    print(f"Fetching {args.url} …", file=sys.stderr)
    page = fetch(args.url)
    hrefs = page.css("a::attr(href)").getall()
    seen: set[str] = set()
    for href in hrefs:
        if href and href not in seen:
            seen.add(href)
            print(href)
    print(f"\n{len(seen)} link(s) found.", file=sys.stderr)


def cmd_emails(args: argparse.Namespace) -> None:
    """Fetch a URL and extract all email addresses."""
    print(f"Fetching {args.url} …", file=sys.stderr)
    page = fetch(args.url)
    raw_html = page.css("body").get() or ""
    emails = extract_emails(raw_html)
    if emails:
        for email in emails:
            print(email)
    else:
        print("No email addresses found.", file=sys.stderr)
    print(f"\n{len(emails)} email(s) found.", file=sys.stderr)


def cmd_parse(args: argparse.Namespace) -> None:
    """Parse a local HTML file and print its text content."""
    path = Path(args.file)
    if not path.exists():
        print(f"Error: file not found: {path}", file=sys.stderr)
        sys.exit(1)
    html = path.read_text(encoding="utf-8")
    page = parse_html(html)
    selector = args.selector or "body"
    texts = page.css(f"{selector}::text").getall()
    for text in texts:
        cleaned = clean_text(text)
        if cleaned:
            print(cleaned)

    # Also report URLs/emails when parsing locally
    raw = page.css("body").get() or ""
    urls = extract_urls(raw)
    emails = extract_emails(raw)
    if urls:
        print(f"\nURLs found ({len(urls)}):", file=sys.stderr)
        for u in urls:
            print(f"  {u}", file=sys.stderr)
    if emails:
        print(f"\nEmails found ({len(emails)}):", file=sys.stderr)
        for e in emails:
            print(f"  {e}", file=sys.stderr)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="scrapper-tools",
        description="A mini web scraping toolkit powered by Scrapling.",
    )
    subparsers = parser.add_subparsers(dest="command", metavar="COMMAND")
    subparsers.required = True

    # fetch command
    p_fetch = subparsers.add_parser("fetch", help="Fetch a URL and print text content")
    p_fetch.add_argument("url", help="Target URL")
    p_fetch.add_argument(
        "--selector", "-s", default=None, help="CSS selector (default: body)"
    )
    p_fetch.set_defaults(func=cmd_fetch)

    # links command
    p_links = subparsers.add_parser("links", help="List all links on a page")
    p_links.add_argument("url", help="Target URL")
    p_links.set_defaults(func=cmd_links)

    # emails command
    p_emails = subparsers.add_parser("emails", help="Extract email addresses from a page")
    p_emails.add_argument("url", help="Target URL")
    p_emails.set_defaults(func=cmd_emails)

    # parse command
    p_parse = subparsers.add_parser("parse", help="Parse a local HTML file")
    p_parse.add_argument("file", help="Path to HTML file")
    p_parse.add_argument(
        "--selector", "-s", default=None, help="CSS selector (default: body)"
    )
    p_parse.set_defaults(func=cmd_parse)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
