# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM oven/bun:alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM oven/bun:alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined at build time — pass via --build-arg
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM oven/bun:alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# standalone output → server.js + internals
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# static assets (css, js chunks) go under .next/static inside the standalone dir
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# public files (favicon, images, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["bun", "server.js"]
