"""POST /api/emails — Extract email addresses found in a page."""

from __future__ import annotations

import time

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from scrapper_tools.fetchers import fetch as do_fetch
from scrapper_tools.utils import extract_emails
from ..models import EmailsRequest, EmailsResponse, EmailItem

router = APIRouter(prefix="/emails", tags=["emails"])


@router.post("", response_model=EmailsResponse)
def find_emails(req: EmailsRequest):
    """Fetch the page and extract all unique email addresses."""
    t0 = time.perf_counter()
    try:
        page = do_fetch(req.url)
    except Exception as exc:
        return JSONResponse(
            status_code=502,
            content={"error": "Fetch failed", "detail": str(exc)},
        )

    elapsed = round((time.perf_counter() - t0) * 1000, 1)

    try:
        raw_text = page.get_all_text(separator=" ", strip=True) or ""
    except Exception:
        raw_text = str(page)

    # Also scan the raw HTML for obfuscated addresses
    try:
        raw_html = str(page.html_content) if hasattr(page, "html_content") else str(page)
    except Exception:
        raw_html = ""

    emails = extract_emails(raw_text + " " + raw_html)

    items = [
        EmailItem(email=e, domain=e.split("@", 1)[-1])
        for e in emails
    ]

    return EmailsResponse(
        url=req.url,
        count=len(items),
        emails=items,
        elapsed_ms=elapsed,
    )
