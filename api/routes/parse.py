"""POST /api/parse — Parse raw HTML with a CSS selector (no network)."""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from scrapling.parser import Selector
from ..models import ParseRequest, ParseResponse, ParseResultItem

router = APIRouter(prefix="/parse", tags=["parse"])


@router.post("", response_model=ParseResponse)
def parse_html(req: ParseRequest):
    """Parse the provided HTML string using a CSS selector and return matched elements."""
    if not req.html.strip():
        return JSONResponse(status_code=422, content={"error": "html must not be empty"})
    if not req.selector.strip():
        return JSONResponse(status_code=422, content={"error": "selector must not be empty"})

    try:
        doc = Selector(req.html)
    except Exception as exc:
        return JSONResponse(
            status_code=422,
            content={"error": "HTML parse error", "detail": str(exc)},
        )

    try:
        matched = doc.css(req.selector)
    except Exception as exc:
        return JSONResponse(
            status_code=422,
            content={"error": "Selector error", "detail": str(exc)},
        )

    results: list[ParseResultItem] = []
    for el in matched:
        try:
            text = el.get_all_text(strip=True) or el.text or ""
        except Exception:
            text = ""
        try:
            html = str(el)
        except Exception:
            html = ""
        try:
            attrs = dict(el.attrib) if hasattr(el, "attrib") else {}
        except Exception:
            attrs = {}
        results.append(ParseResultItem(text=text, html=html, attrs=attrs))

    return ParseResponse(
        selector=req.selector,
        count=len(results),
        results=results,
    )
