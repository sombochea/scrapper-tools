"""
Example: Parse raw HTML without making any network request.

Demonstrates how to use ``parse_html()`` to process already-fetched HTML content,
e.g. from a local file, database, or another HTTP client.

Run:
    uv run python examples/parse_html.py
"""

from scrapper_tools import parse_html
from scrapper_tools.utils import clean_text, extract_emails, extract_urls

SAMPLE_HTML = """
<!DOCTYPE html>
<html>
<head><title>Sample Page</title></head>
<body>
  <h1 class="title">Welcome to Scrapper Tools</h1>
  <p class="intro">A fast and adaptive web scraping toolkit.</p>

  <ul class="features">
    <li>Fast HTTP requests</li>
    <li>Anti-bot bypass with StealthyFetcher</li>
    <li>Full browser automation with DynamicFetcher</li>
    <li>Spider framework for multi-page crawls</li>
  </ul>

  <p>Contact us: hello@example.com or support@example.org</p>
  <p>More info: https://example.com/docs and https://example.com/api</p>
</body>
</html>
"""


def main() -> None:
    page = parse_html(SAMPLE_HTML)

    title = clean_text(page.css("h1.title::text").get())
    intro = clean_text(page.css("p.intro::text").get())
    features = page.css(".features li::text").getall()

    # full text of the page for email/URL extraction
    all_text = page.css("body").get() or ""

    emails = extract_emails(all_text)
    urls = extract_urls(all_text)

    print(f"Title   : {title}")
    print(f"Intro   : {intro}")
    print(f"Features: {features}")
    print(f"Emails  : {emails}")
    print(f"URLs    : {urls}")


if __name__ == "__main__":
    main()
