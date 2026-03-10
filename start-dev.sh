#!/usr/bin/env bash
# start-dev.sh — Start API + UI dev servers
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "▶ Starting FastAPI API on :8000 …"
cd "$ROOT"
uv run uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!

echo "▶ Starting Next.js UI on :3000 …"
cd "$ROOT/ui"
bun dev &
UI_PID=$!

trap "echo '⏹ Stopping…'; kill $API_PID $UI_PID 2>/dev/null; exit" INT TERM

echo ""
echo "  API:  http://localhost:8000  (docs: http://localhost:8000/docs)"
echo "  UI:   http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

wait
