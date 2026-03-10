# ── Stage 1: builder ──────────────────────────────────────────────────────────
# uv's official image includes Python 3.13 + uv — ideal for installing deps
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY pyproject.toml uv.lock ./

# Install production deps into .venv; --frozen ensures reproducible builds
RUN uv sync --frozen --no-cache --no-dev

# Copy application source
COPY api/ ./api/
COPY scrapper_tools/ ./scrapper_tools/

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
