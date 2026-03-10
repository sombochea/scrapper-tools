"""scrapper-tools API — FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import fetch, links, emails, parse, spider

app = FastAPI(
    title="Scrapper Tools API",
    description="REST API for web scraping powered by Scrapling",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(fetch.router, prefix="/api")
app.include_router(links.router, prefix="/api")
app.include_router(emails.router, prefix="/api")
app.include_router(parse.router, prefix="/api")
app.include_router(spider.router, prefix="/api")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok", "service": "scrapper-tools-api"}


@app.get("/", include_in_schema=False)
def root():
    return JSONResponse({"message": "Scrapper Tools API — visit /docs for interactive docs."})
