"""GET /api/spider/stream — SSE stream of a multi-page crawl."""

from __future__ import annotations

import json
import time
from urllib.parse import urljoin, urlparse

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from scrapper_tools.fetchers import fetch as do_fetch

router = APIRouter(prefix="/spider", tags=["spider"])


def _sse(event: str, data: dict) -> str:
    """Format a server-sent event string."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _crawl(
    url: str,
    item_selector: str,
    text_selector: str,
    author_selector: str,
    next_selector: str,
    max_pages: int,
):
    """Generator that yields SSE-formatted strings while crawling."""
    visited: set[str] = set()
    queue = [url]
    page_num = 0

    while queue and page_num < max_pages:
        current_url = queue.pop(0)
        if current_url in visited:
            continue
        visited.add(current_url)
        page_num += 1

        yield _sse("log", {
            "level": "info",
            "msg": f"[{page_num}/{max_pages}] GET {current_url}",
            "page": page_num,
        })

        try:
            t0 = time.perf_counter()
            page = do_fetch(current_url)
            elapsed = round((time.perf_counter() - t0) * 1000, 1)
        except Exception as exc:
            yield _sse("log", {"level": "error", "msg": f"Failed: {exc}", "page": page_num})
            continue

        yield _sse("log", {
            "level": "success",
            "msg": f"[200] Fetched in {elapsed}ms — parsing items…",
            "page": page_num,
        })

        # Extract items
        item_count = 0
        try:
            for el in page.css(item_selector):
                try:
                    text_parts = text_selector.split("::")
                    if len(text_parts) == 2:
                        sub_els = el.css(text_parts[0])
                        text_val = sub_els[0].text.strip() if sub_els else ""
                    else:
                        text_val = (el.get_all_text(strip=True) or "").strip()
                except Exception:
                    text_val = (el.get_all_text(strip=True) or "").strip()

                try:
                    auth_parts = author_selector.split("::")
                    if len(auth_parts) == 2:
                        auth_els = el.css(auth_parts[0])
                        author_val = auth_els[0].text.strip() if auth_els else ""
                    else:
                        author_val = ""
                except Exception:
                    author_val = ""

                try:
                    tag_els = el.css(".tag")
                    tags = [t.text.strip() for t in tag_els if t.text]
                except Exception:
                    tags = []

                item_count += 1
                yield _sse("item", {
                    "text": text_val,
                    "author": author_val,
                    "tags": tags,
                    "source_url": current_url,
                    "page": page_num,
                })
        except Exception as exc:
            yield _sse("log", {"level": "warn", "msg": f"Item parse error: {exc}", "page": page_num})

        yield _sse("log", {
            "level": "info",
            "msg": f"Found {item_count} items on page {page_num}.",
            "page": page_num,
        })

        # Follow pagination
        try:
            next_links = page.css(next_selector)
            if next_links:
                href = next_links[0].attrib.get("href", "").strip()
                if href and not href.startswith(("#", "javascript:")):
                    next_url = urljoin(current_url, href)
                    if next_url not in visited:
                        queue.append(next_url)
                        yield _sse("log", {
                            "level": "info",
                            "msg": f"Following next page: {next_url}",
                            "page": page_num,
                        })
        except Exception:
            pass

    yield _sse("done", {
        "pages_visited": page_num,
        "msg": f"Crawl complete — {page_num} page(s) visited.",
    })


@router.get("/stream")
def spider_stream(
    url: str,
    item_selector: str = ".quote",
    text_selector: str = ".text::text",
    author_selector: str = ".author::text",
    next_selector: str = ".next a",
    max_pages: int = 5,
):
    """Stream crawl progress and scraped items as Server-Sent Events."""
    if max_pages > 20:
        max_pages = 20

    return StreamingResponse(
        _crawl(
            url=url,
            item_selector=item_selector,
            text_selector=text_selector,
            author_selector=author_selector,
            next_selector=next_selector,
            max_pages=max_pages,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
