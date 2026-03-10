# ── Stage 1: builder ──────────────────────────────────────────────────────────
# uv's official image includes Python 3.13 + uv — ideal for installing deps
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY pyproject.toml uv.lock ./

# Install only third-party deps first (skip building the local package so
# hatchling doesn't need README.md yet) — this layer is cached until
# pyproject.toml / uv.lock change.
RUN uv sync --frozen --no-cache --no-dev --no-install-project

# Copy application source + README.md (required by hatchling metadata)
COPY README.md ./
COPY api/ ./api/
COPY scrapper_tools/ ./scrapper_tools/

# Install the local project itself into the already-populated .venv
RUN uv sync --frozen --no-cache --no-dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.13-slim AS runtime

WORKDIR /app

# Copy only the installed virtual environment from the builder
COPY --from=builder /app/.venv /app/.venv

# Copy application source
COPY --from=builder /app/api ./api
COPY --from=builder /app/scrapper_tools ./scrapper_tools

# Activate venv by prepending its bin to PATH
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
