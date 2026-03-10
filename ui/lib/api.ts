/**
 * Typed client for the scrapper-tools FastAPI backend.
 * Base URL is read from NEXT_PUBLIC_API_URL (defaults to http://localhost:8000).
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ── shared helpers ────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return json as T
}

// ── /api/fetch ────────────────────────────────────────────────────────────────

export interface FetchElement {
  text: string
  html: string
  attrs: Record<string, string>
}

export interface FetchResult {
  url: string
  status_code: number
  title: string | null
  text: string | null
  html: string | null
  elements: FetchElement[]
  elapsed_ms: number
}

export function apiFetch(
  url: string,
  selector?: string,
  mode?: string,
): Promise<FetchResult> {
  return post("/api/fetch", { url, selector: selector || null, mode: mode ?? "text" })
}

// ── /api/links ────────────────────────────────────────────────────────────────

export interface LinkItem {
  url: string
  text: string
  internal: boolean
}

export interface LinksResult {
  url: string
  total: number
  internal_count: number
  external_count: number
  links: LinkItem[]
  elapsed_ms: number
}

export function apiLinks(url: string): Promise<LinksResult> {
  return post("/api/links", { url })
}

// ── /api/emails ───────────────────────────────────────────────────────────────

export interface EmailItem {
  email: string
  domain: string
}

export interface EmailsResult {
  url: string
  count: number
  emails: EmailItem[]
  elapsed_ms: number
}

export function apiEmails(url: string): Promise<EmailsResult> {
  return post("/api/emails", { url })
}

// ── /api/parse ────────────────────────────────────────────────────────────────

export interface ParseResultItem {
  text: string
  html: string
  attrs: Record<string, string>
}

export interface ParseResult {
  selector: string
  count: number
  results: ParseResultItem[]
}

export function apiParse(html: string, selector: string): Promise<ParseResult> {
  return post("/api/parse", { html, selector })
}

// ── /api/spider/stream (SSE) ──────────────────────────────────────────────────

export interface SpiderLogEvent {
  type: "log"
  level: "info" | "warn" | "error" | "success"
  msg: string
  page: number
}

export interface SpiderItemEvent {
  type: "item"
  text: string
  author: string
  tags: string[]
  source_url: string
  page: number
}

export interface SpiderDoneEvent {
  type: "done"
  pages_visited: number
  msg: string
}

export type SpiderEvent = SpiderLogEvent | SpiderItemEvent | SpiderDoneEvent

export function spiderStream(
  url: string,
  options: {
    itemSelector?: string
    textSelector?: string
    authorSelector?: string
    nextSelector?: string
    maxPages?: number
    onLog: (e: SpiderLogEvent) => void
    onItem: (e: SpiderItemEvent) => void
    onDone: (e: SpiderDoneEvent) => void
    onError: (err: string) => void
  },
): () => void {
  const params = new URLSearchParams({
    url,
    item_selector: options.itemSelector ?? ".quote",
    text_selector: options.textSelector ?? ".text::text",
    author_selector: options.authorSelector ?? ".author::text",
    next_selector: options.nextSelector ?? ".next a",
    max_pages: String(options.maxPages ?? 5),
  })

  const es = new EventSource(`${BASE}/api/spider/stream?${params}`)

  es.addEventListener("log", (e) => {
    try {
      const data = JSON.parse(e.data) as Omit<SpiderLogEvent, "type">
      options.onLog({ type: "log", ...data })
    } catch {}
  })

  es.addEventListener("item", (e) => {
    try {
      const data = JSON.parse(e.data) as Omit<SpiderItemEvent, "type">
      options.onItem({ type: "item", ...data })
    } catch {}
  })

  es.addEventListener("done", (e) => {
    try {
      const data = JSON.parse(e.data) as Omit<SpiderDoneEvent, "type">
      options.onDone({ type: "done", ...data })
    } catch {}
    es.close()
  })

  es.onerror = () => {
    options.onError("Connection to API lost or spider encountered an error.")
    es.close()
  }

  // Return a cleanup/cancel function
  return () => es.close()
}
