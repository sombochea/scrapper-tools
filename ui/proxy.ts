import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Proxy all /api/* requests to the internal FastAPI backend.
 *
 * API_INTERNAL_URL is a server-side runtime variable (not NEXT_PUBLIC_).
 * - Development:   http://localhost:8000  (via .env.local)
 * - Docker:        http://api:8000        (via docker-compose environment)
 * - Production:    https://api.example.com (via your deployment env)
 */
const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? "http://localhost:8000"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const target = new URL(`${pathname}${search}`, API_INTERNAL_URL)
  return NextResponse.rewrite(target)
}

export const config = {
  matcher: "/api/:path*",
}
