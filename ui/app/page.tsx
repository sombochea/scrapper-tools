import {
  Globe,
  Link2,
  Mail,
  FileCode2,
  Bug,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Activity,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

const TOOLS = [
  {
    href: "/fetch",
    icon: Globe,
    label: "HTTP Fetch",
    description:
      "Fast HTTP request impersonating a real browser TLS fingerprint. Extract text, HTML, or structured data.",
    badge: "Fast",
    badgeVariant: "default" as const,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    href: "/links",
    icon: Link2,
    label: "Link Extractor",
    description:
      "Find and list every hyperlink on a page. Filter internal vs. external, sort by domain.",
    badge: "Useful",
    badgeVariant: "secondary" as const,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    href: "/emails",
    icon: Mail,
    label: "Email Finder",
    description:
      "Scan any URL for email addresses exposed in HTML content. Deduplicates results automatically.",
    badge: "Smart",
    badgeVariant: "secondary" as const,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    href: "/parse",
    icon: FileCode2,
    label: "HTML Parser",
    description:
      "Paste raw HTML and query with CSS selectors or XPath — no network request needed.",
    badge: "Offline",
    badgeVariant: "outline" as const,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    href: "/spider",
    icon: Bug,
    label: "Spider Runner",
    description:
      "Configure and run multi-page concurrent crawls. Paginate automatically and export to JSON.",
    badge: "Power",
    badgeVariant: "default" as const,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
]

const STATS = [
  { label: "Requests made", value: "—", sub: "this session" },
  { label: "Links found", value: "—", sub: "total" },
  { label: "Emails found", value: "—", sub: "total" },
  { label: "Spiders run", value: "—", sub: "this session" },
]

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Scrapling outperforms BeautifulSoup, PyQuery, and Selectolax in benchmarks.",
  },
  {
    icon: Shield,
    title: "Anti-bot Bypass",
    desc: "Bypass Cloudflare Turnstile and other bot-detection systems automatically.",
  },
  {
    icon: Layers,
    title: "Adaptive Scraping",
    desc: "Elements are re-located automatically even when page layouts change.",
  },
  {
    icon: Activity,
    title: "Full Spider Framework",
    desc: "Concurrent crawls with pause/resume, proxy rotation, and streaming results.",
  },
]

export default function Home() {
  return (
    <div className="space-y-10">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-2xl gradient-brand p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-24 size-96 rounded-full bg-black/10" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Bug className="size-8 drop-shadow" />
            <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm">
              ScrapeKit
            </h1>
          </div>
          <p className="text-lg opacity-90 leading-relaxed">
            A modern web interface for your{" "}
            <span className="font-semibold">adaptive scraping toolkit</span>{" "}
            powered by Scrapling. Fast, stealthy, and intelligent web data
            extraction.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/fetch"
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent px-2.5 text-sm font-semibold whitespace-nowrap transition-all bg-white text-violet-700 hover:bg-white/90 shadow"
            >
              Get started <ArrowRight className="ml-1.5 size-4" />
            </Link>
            <a
              href="https://github.com/sombochea/scrapper-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/40 px-2.5 text-sm font-medium whitespace-nowrap transition-all bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ label, value, sub }) => (
          <Card key={label} className="glass-card flex flex-col gap-1 p-4">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {value}
            </span>
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
          </Card>
        ))}
      </section>

      {/* ── Tools grid ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tools</h2>
          <Badge variant="outline" className="text-xs">
            {TOOLS.length} available
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(
            ({
              href,
              icon: Icon,
              label,
              description,
              badge,
              badgeVariant,
              color,
              bg,
            }) => (
              <Link key={href} href={href} className="group">
                <Card className="glass-card flex h-full flex-col gap-3 p-5 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-start justify-between">
                    <div className={`${bg} flex size-10 items-center justify-center rounded-xl`}>
                      <Icon className={`size-5 ${color}`} />
                    </div>
                    <Badge variant={badgeVariant} className="text-xs">
                      {badge}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary font-medium">
                    Open tool <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            )
          )}
        </div>
      </section>

      <Separator />

      {/* ── Features ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Why Scrapling?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-border/60 bg-card/60 p-4 hover:bg-card transition-colors"
            >
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Performance bar ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Performance Benchmarks</h2>
        <Card className="glass-card p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            Text extraction speed — 5000 nested elements (lower is better,
            normalised to Scrapling = 100%)
          </p>
          {[
            { name: "Scrapling", pct: 100, ms: "2.0 ms", highlight: true },
            { name: "Parsel / Scrapy", pct: 99, ms: "2.04 ms" },
            { name: "Raw Lxml", pct: 80, ms: "2.54 ms" },
            { name: "PyQuery", pct: 8, ms: "24.2 ms" },
            { name: "BS4 + Lxml", pct: 0.1, ms: "1584 ms" },
          ].map(({ name, pct, ms, highlight }) => (
            <div key={name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={
                    highlight ? "font-semibold text-primary" : "text-foreground"
                  }
                >
                  {name}
                </span>
                <span className="text-muted-foreground tabular-nums">{ms}</span>
              </div>
              <Progress
                value={pct}
                className={highlight ? "[&>div]:bg-primary" : "[&>div]:bg-muted-foreground/50"}
              />
            </div>
          ))}
        </Card>
      </section>
    </div>
  )
}

