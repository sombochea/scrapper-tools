"use client"

import { useState } from "react"
import { Globe, Loader2, Send, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { InfoBox } from "@/components/result-box"
import { apiFetch, type FetchResult } from "@/lib/api"

type Status = "idle" | "loading" | "success" | "error"

export default function FetchPage() {
  const [url, setUrl] = useState("https://quotes.toscrape.com/")
  const [selector, setSelector] = useState(".quote")
  const [mode, setMode] = useState("text")
  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<FetchResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [copied, setCopied] = useState(false)

  async function run() {
    if (!url) return
    setStatus("loading")
    setResult(null)
    setErrorMsg("")
    try {
      const data = await apiFetch(url, selector || undefined, mode)
      setResult(data)
      setStatus("success")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") run()
  }

  function copyRaw() {
    const text = result?.text ?? result?.html ?? ""
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Globe}
        iconColor="text-violet-500"
        iconBg="bg-violet-500/10"
        title="HTTP Fetch"
        description="Perform a fast HTTP request that impersonates a real browser TLS fingerprint. Extract text, structured data, or raw HTML."
        badge="curl-cffi"
      />

      <InfoBox>
        Uses Scrapling&apos;s <code className="text-primary">Fetcher</code> with
        browser impersonation. No headless browser required — lightning fast.
      </InfoBox>

      <Card className="glass-card p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="url">Target URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="font-mono text-sm"
              disabled={status === "loading"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mode">Output</Label>
            <Select value={mode} onValueChange={(v) => v && setMode(v)}>
              <SelectTrigger id="mode" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="selector">CSS Selector</Label>
          <Input
            id="selector"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=".quote, h1, #content, …"
            className="font-mono text-sm"
            disabled={status === "loading"}
          />
        </div>

        <Button
          onClick={run}
          disabled={status === "loading" || !url}
          className="w-full sm:w-auto gap-2"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {status === "loading" ? "Fetching…" : "Fetch URL"}
        </Button>

        {/* ── Results ── */}
        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="size-4 animate-spin" />
            Sending request to API…
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "success" && result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                <span>
                  HTTP {result.status_code} · {result.elapsed_ms}ms
                  {result.title && <> · <span className="font-medium">{result.title}</span></>}
                </span>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={copyRaw}>
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
            <Tabs defaultValue={result.elements.length > 0 ? "structured" : "raw"}>
              <TabsList>
                <TabsTrigger value="structured">
                  Elements
                  <Badge variant="secondary" className="ml-1.5 text-[10px]">
                    {result.elements.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="raw">Raw text</TabsTrigger>
              </TabsList>
              <TabsContent value="structured" className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                {result.elements.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No elements matched <code className="text-primary">{selector}</code>
                  </p>
                ) : (
                  result.elements.map((el, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-1"
                    >
                      <p className="text-xs text-foreground leading-relaxed">{el.text}</p>
                      {Object.keys(el.attrs).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {Object.entries(el.attrs)
                            .slice(0, 4)
                            .map(([k, v]) => (
                              <Badge key={k} variant="outline" className="text-[10px] font-mono">
                                {k}={String(v).slice(0, 30)}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="raw" className="mt-3">
                <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap text-xs text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
                  {result.text ?? result.html ?? "(empty)"}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>

      <Card className="glass-card p-5">
        <p className="mb-3 text-sm font-semibold">Equivalent Python</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-foreground">
          {`from scrapper_tools import fetch

page = fetch("${url}")
items = page.css("${selector}::text").getall()
for item in items:
    print(item)`}
        </pre>
      </Card>
    </div>
  )
}
