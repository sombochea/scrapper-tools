"""POST /api/links — Extract all hyperlinks from a URL."""

from __future__ import annotations

import time
from urllib.parse import urlparse, urljoin

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from scrapper_tools.fetchers import fetch as do_fetch
from ..models import LinksRequest, LinksResponse, LinkItem

router = APIRouter(prefix="/links", tags=["links"])


@router.post("", response_model=LinksResponse)
def extract_links(req: LinksRequest):
    """Fetch the page and return all unique anchor links with internal/external classification."""
    t0 = time.perf_counter()
    try:
        page = do_fetch(req.url)
    except Exception as exc:
        return JSONResponse(
            status_code=502,
            content={"error": "Fetch failed", "detail": str(exc)},
        )

    elapsed = round((time.perf_counter() - t0) * 1000, 1)
    base = urlparse(req.url)

    seen: set[str] = set()
    links: list[LinkItem] = []

    try:
        for a in page.css("a"):
            try:
                href = a.attrib.get("href", "").strip() if hasattr(a, "attrib") else ""
            except Exception:
                href = ""

            if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue

            # Resolve relative URLs
            if not href.startswith(("http://", "https://")):
                href = urljoin(req.url, href)

            if href in seen:
                continue
            seen.add(href)

            try:
                text = (a.get_all_text(strip=True) or "").strip()[:200]
            except Exception:
                text = ""

            parsed = urlparse(href)
            internal = parsed.netloc == base.netloc or not parsed.netloc

            links.append(LinkItem(url=href, text=text, internal=internal))
    except Exception as exc:
        return JSONResponse(
            status_code=422,
            content={"error": "Parse error", "detail": str(exc)},
        )

    internal_count = sum(1 for l in links if l.internal)
    external_count = len(links) - internal_count

    return LinksResponse(
        url=req.url,
        total=len(links),
        internal_count=internal_count,
        external_count=external_count,
        links=links,
        elapsed_ms=elapsed,
    )
