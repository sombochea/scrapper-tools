"""POST /api/fetch — Fetch a URL and optionally query with a CSS selector."""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from scrapper_tools.fetchers import fetch as do_fetch
from ..models import FetchRequest, FetchResponse, ErrorResponse

router = APIRouter(prefix="/fetch", tags=["fetch"])


@router.post("", response_model=FetchResponse)
def fetch_url(req: FetchRequest):
    """Fetch a remote URL and return content + optional selector results."""
    t0 = time.perf_counter()
    try:
        page = do_fetch(req.url)
    except Exception as exc:
        return JSONResponse(
            status_code=502,
            content={"error": "Fetch failed", "detail": str(exc)},
        )

    elapsed = round((time.perf_counter() - t0) * 1000, 1)

    # Status code — Scrapling's Response wraps httpx
    try:
        status_code: int = page.status
    except Exception:
        status_code = 200

    # Title
    try:
        title_el = page.css("title")
        title = title_el[0].text if title_el else None
    except Exception:
        title = None

    # Full text / html
    try:
        full_text: str | None = page.get_all_text(separator="\n", strip=True)
    except Exception:
        full_text = None

    try:
        full_html: str | None = str(page.html_content) if hasattr(page, "html_content") else str(page)
    except Exception:
        full_html = None

    # Selector results
    elements: list[dict[str, Any]] = []
    if req.selector:
        try:
            for el in page.css(req.selector):
                try:
                    text_val = el.get_all_text(strip=True) or el.text or ""
                except Exception:
                    text_val = ""
                try:
                    html_val = str(el)
                except Exception:
                    html_val = ""
                try:
                    attrs_val = dict(el.attrib) if hasattr(el, "attrib") else {}
                except Exception:
                    attrs_val = {}
                elements.append({"text": text_val, "html": html_val, "attrs": attrs_val})
        except Exception as exc:
            return JSONResponse(
                status_code=422,
                content={"error": "Selector error", "detail": str(exc)},
            )

    return FetchResponse(
        url=req.url,
        status_code=status_code,
        title=title,
        text=full_text,
        html=full_html,
        elements=elements,
        elapsed_ms=elapsed,
    )
