# ScrapeKit — Scrapper Tools

> Built by [@sombochea](https://github.com/sombochea)

A full-stack web scraping toolkit: a Python scraping library backed by a **FastAPI** REST API, with a **Next.js** web UI for interactive use.

---

## Features

| Tool       | Description                                                             |
| ---------- | ----------------------------------------------------------------------- |
| **Fetch**  | Fetch any URL and inspect rendered HTML, status code, and headers       |
| **Links**  | Extract and categorize all hyperlinks from a page                       |
| **Emails** | Harvest email addresses from a page, grouped by domain                  |
| **Parse**  | Run CSS/XPath selectors and extract structured data                     |
| **Spider** | Crawl a site depth-first with real-time progress via Server-Sent Events |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                    │
│           http://localhost:3000             │
└──────────────────┬──────────────────────────┘
                   │ HTTP / SSE
┌──────────────────▼──────────────────────────┐
│         Next.js UI  (port 3000)             │
│   Bun runtime · Tailwind CSS v4 · shadcn    │
└──────────────────┬──────────────────────────┘
                   │ REST  http://localhost:8000
┌──────────────────▼──────────────────────────┐
│         FastAPI  (port 8000)                │
│   Python 3.13 · uvicorn · Scrapling         │
└─────────────────────────────────────────────┘
```

---

## Quick Start — Local Development

### Prerequisites

- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Bun](https://bun.sh/) ≥ 1.0

### 1 — Clone and install

```bash
git clone https://github.com/sombochea/scrapper-tools.git
cd scrapper-tools

# Python deps
uv sync

# UI deps
cd ui && bun install && cd ..
```

### 2 — Start both servers

```bash
chmod +x start-dev.sh
./start-dev.sh
```

| Service            | URL                          |
| ------------------ | ---------------------------- |
| Web UI             | <http://localhost:3000>      |
| API                | <http://localhost:8000>      |
| API Docs (Swagger) | <http://localhost:8000/docs> |

Press **Ctrl+C** to stop both servers.

---

## Docker Deployment

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) v2

### Build and run

```bash
docker compose up --build
```

Services start on the same default ports (`3000` / `8000`).

### Run in the background

```bash
docker compose up -d --build
docker compose logs -f   # tail logs
docker compose down      # stop and remove containers
```

### Override ports

```bash
UI_PORT=4000 API_PORT=9000 docker compose up -d
```

### Custom API URL (production / remote server)

Because `NEXT_PUBLIC_API_URL` is **baked into the UI at build time**, rebuild the image when the API endpoint changes:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com docker compose up -d --build
```

---

## API Reference

Base URL: `http://localhost:8000`

### `GET /api/health`

Returns `{"status": "ok"}`.

---

### `POST /api/fetch`

Fetch a URL and return the rendered HTML.

**Request body**

```json
{
    "url": "https://example.com",
    "render_js": false
}
```

**Response**

```json
{
    "url": "https://example.com",
    "status_code": 200,
    "content_type": "text/html",
    "html": "<!doctype html>...",
    "elements_count": 42
}
```

---

### `POST /api/links`

Extract all hyperlinks from a page.

**Request body**

```json
{
    "url": "https://example.com",
    "render_js": false
}
```

**Response**

```json
{
    "url": "https://example.com",
    "total": 12,
    "internal": 8,
    "external": 4,
    "links": [{ "href": "/about", "text": "About", "type": "internal" }]
}
```

---

### `POST /api/emails`

Harvest email addresses from a page.

**Request body**

```json
{
    "url": "https://example.com",
    "render_js": false
}
```

**Response**

```json
{
    "url": "https://example.com",
    "total": 3,
    "emails": ["hello@example.com"]
}
```

---

### `POST /api/parse`

Run CSS or XPath selectors on a page.

**Request body**

```json
{
    "url": "https://example.com",
    "selector": "h1",
    "selector_type": "css",
    "render_js": false
}
```

`selector_type`: `"css"` | `"xpath"`

**Response**

```json
{
    "url": "https://example.com",
    "selector": "h1",
    "selector_type": "css",
    "count": 1,
    "results": [
        {
            "text": "Example Domain",
            "html": "<h1>Example Domain</h1>",
            "tag": "h1"
        }
    ]
}
```

---

### `GET /api/spider/stream`

Crawl a site and stream progress as **Server-Sent Events**.

**Query parameters**

| Parameter   | Type   | Default  | Description            |
| ----------- | ------ | -------- | ---------------------- |
| `url`       | string | required | Start URL              |
| `max_pages` | int    | `10`     | Maximum pages to crawl |
| `depth`     | int    | `2`      | Maximum crawl depth    |
| `render_js` | bool   | `false`  | Render JavaScript      |

**SSE event types**

| Event  | Payload                                              |
| ------ | ---------------------------------------------------- |
| `log`  | `{ "message": "Crawling https://..." }`              |
| `item` | `{ "url": "...", "title": "...", "links_count": 5 }` |
| `done` | `{ "total": 7, "elapsed": 3.2 }`                     |

---

## Environment Variables

### API

| Variable           | Default | Description              |
| ------------------ | ------- | ------------------------ |
| `PYTHONUNBUFFERED` | `1`     | Flush stdout immediately |

### UI

| Variable              | Default                 | Description                   |
| --------------------- | ----------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | API base URL (**build-time**) |
| `NODE_ENV`            | `production`            | Node environment              |

---

## Project Structure

```
scrapper-tools/
├── api/                        # FastAPI application
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── models.py               # Pydantic request/response models
│   └── routes/
│       ├── fetch.py            # POST /api/fetch
│       ├── links.py            # POST /api/links
│       ├── emails.py           # POST /api/emails
│       ├── parse.py            # POST /api/parse
│       └── spider.py           # GET  /api/spider/stream (SSE)
├── scrapper_tools/             # Core Python scraping library
│   ├── fetchers.py             # HTTP fetch helpers (Scrapling)
│   ├── spiders.py              # Site crawling logic
│   ├── utils.py                # Link/email extraction utilities
│   └── cli.py                  # CLI entry point
├── ui/                         # Next.js web UI
│   ├── app/
│   │   ├── fetch/page.tsx
│   │   ├── links/page.tsx
│   │   ├── emails/page.tsx
│   │   ├── parse/page.tsx
│   │   └── spider/page.tsx
│   ├── lib/api.ts              # Typed API client
│   ├── Dockerfile              # Multi-stage bun image
│   └── next.config.mjs         # standalone output enabled
├── Dockerfile                  # Multi-stage Python/uv image
├── docker-compose.yml          # Full deployment stack
├── start-dev.sh                # Local dev launcher
├── pyproject.toml              # Python project config
└── uv.lock                     # Locked dependency tree
```

---

## Tech Stack

| Layer            | Technology                                                                        |
| ---------------- | --------------------------------------------------------------------------------- |
| Scraping         | [Scrapling](https://github.com/D4Vinci/Scrapling)                                 |
| API              | [FastAPI](https://fastapi.tiangolo.com/) + [uvicorn](https://www.uvicorn.org/)    |
| Python runtime   | Python 3.13 + [uv](https://docs.astral.sh/uv/)                                    |
| UI framework     | [Next.js](https://nextjs.org/) 16                                                 |
| UI runtime       | [Bun](https://bun.sh/)                                                            |
| UI styling       | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Containerization | Docker (multi-stage builds) + Docker Compose                                      |

---

## License

MIT
