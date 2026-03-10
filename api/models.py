"""Pydantic request / response models for the scrapper-tools API."""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, HttpUrl, Field


# ── Request models ────────────────────────────────────────────────────────────

class FetchRequest(BaseModel):
    url: str = Field(..., description="URL to fetch")
    selector: str | None = Field(None, description="Optional CSS selector to extract")
    mode: str = Field("text", description="Output mode: text | html | json")


class LinksRequest(BaseModel):
    url: str = Field(..., description="URL to extract links from")


class EmailsRequest(BaseModel):
    url: str = Field(..., description="URL to extract emails from")


class ParseRequest(BaseModel):
    html: str = Field(..., description="Raw HTML to parse")
    selector: str = Field(..., description="CSS selector to query")


class SpiderRequest(BaseModel):
    url: str = Field(..., description="Start URL")
    item_selector: str = Field(".quote", description="CSS selector for items")
    text_selector: str = Field(".text::text", description="Sub-selector for item text")
    author_selector: str = Field(".author::text", description="Sub-selector for item author")
    next_selector: str = Field(".next a", description="CSS selector for next-page link")
    max_pages: int = Field(5, ge=1, le=20, description="Maximum pages to crawl")


# ── Response models ───────────────────────────────────────────────────────────

class FetchResponse(BaseModel):
    url: str
    status_code: int
    title: str | None
    text: str | None
    html: str | None
    elements: list[dict[str, Any]]
    elapsed_ms: float


class LinkItem(BaseModel):
    url: str
    text: str
    internal: bool


class LinksResponse(BaseModel):
    url: str
    total: int
    internal_count: int
    external_count: int
    links: list[LinkItem]
    elapsed_ms: float


class EmailItem(BaseModel):
    email: str
    domain: str


class EmailsResponse(BaseModel):
    url: str
    count: int
    emails: list[EmailItem]
    elapsed_ms: float


class ParseResultItem(BaseModel):
    text: str
    html: str
    attrs: dict[str, str]


class ParseResponse(BaseModel):
    selector: str
    count: int
    results: list[ParseResultItem]


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
