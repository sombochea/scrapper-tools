"use client"

import { useState } from "react"
import { Link2, Loader2, Search, Copy, Check, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageHeader } from "@/components/page-header"
import { InfoBox } from "@/components/result-box"
import { apiLinks, type LinksResult, type LinkItem } from "@/lib/api"

type Status = "idle" | "loading" | "success" | "error"

export default function LinksPage() {
  const [url, setUrl] = useState("https://quotes.toscrape.com/")
  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<LinksResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [copied, setCopied] = useState(false)

  async function run() {
    if (!url) return
    setStatus("loading")
    setResult(null)
    setErrorMsg("")
    try {
      const data = await apiLinks(url)
      setResult(data)
      setStatus("success")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }

  function copyAll() {
    const links = result?.links.map((l) => l.url).join("\n") ?? ""
    navigator.clipboard.writeText(links).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  function LinkList({ items }: { items: LinkItem[] }) {
    if (items.length === 0) {
      return <p className="text-sm text-muted-foreground py-8 text-center">No links found.</p>
    }
    return (
      <ScrollArea className="h-72">
        <div className="space-y-1 pr-2">
          {items.map((link, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-background/60 p-2.5 text-xs group"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-mono text-foreground truncate">{link.url}</p>
                {link.text && (
                  <p className="text-muted-foreground truncate">{link.text}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant={link.internal ? "secondary" : "outline"}
                  className="text-[10px]"
                >
                  {link.internal ? "internal" : "external"}
                </Badge>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="size-3 text-muted-foreground hover:text-primary" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Link2}
        iconColor="text-blue-500"
        iconBg="bg-blue-500/10"
        title="Link Extractor"
        description="Extract every anchor link from a page, classified as internal or external with deduplication."
        badge="Anchor"
      />

      <InfoBox>
        Resolves relative URLs to absolute, deduplicates, and skips{" "}
        <code className="text-primary">javascript:</code>,{" "}
        <code className="text-primary">mailto:</code> and fragment links.
      </InfoBox>

      <Card className="glass-card p-5 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="url">Target URL</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="https://example.com"
              className="font-mono text-sm"
              disabled={status === "loading"}
            />
            <Button
              onClick={run}
              disabled={status === "loading" || !url}
              className="gap-2 shrink-0"
            >
              {status === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Extract
            </Button>
          </div>
        </div>

        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Fetching page and extracting links…
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "success" && result && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                <span>Done in {result.elapsed_ms}ms</span>
              </div>
              <Button variant="outline" size="sm" onClick={copyAll} className="gap-2">
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                Copy all
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: result.total, color: "text-foreground" },
                { label: "Internal", value: result.internal_count, color: "text-blue-500" },
                { label: "External", value: result.external_count, color: "text-orange-500" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/50 bg-background/60 p-3 text-center"
                >
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All ({result.total})</TabsTrigger>
                <TabsTrigger value="internal">Internal ({result.internal_count})</TabsTrigger>
                <TabsTrigger value="external">External ({result.external_count})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-3">
                <LinkList items={result.links} />
              </TabsContent>
              <TabsContent value="internal" className="mt-3">
                <LinkList items={result.links.filter((l) => l.internal)} />
              </TabsContent>
              <TabsContent value="external" className="mt-3">
                <LinkList items={result.links.filter((l) => !l.internal)} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>

      <Card className="glass-card p-5">
        <p className="mb-3 text-sm font-semibold">Equivalent Python</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-foreground">
          {`from scrapper_tools import fetch
from urllib.parse import urlparse, urljoin

page = fetch("${url}")
base = urlparse("${url}")
links = []
for a in page.css("a"):
    href = urljoin("${url}", a.attrib.get("href", ""))
    internal = urlparse(href).netloc == base.netloc
    links.append({"url": href, "internal": internal})
print(f"Found {len(links)} links")`}
        </pre>
      </Card>
    </div>
  )
}
