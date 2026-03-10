"use client"

import { useState } from "react"
import { FileCode2, Loader2, Play, AlertCircle, CheckCircle2, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageHeader } from "@/components/page-header"
import { InfoBox } from "@/components/result-box"
import { apiParse, type ParseResult } from "@/lib/api"

type Status = "idle" | "loading" | "success" | "error"

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head><title>Sample Page</title></head>
<body>
  <div class="products">
    <div class="product">
      <h2 class="name">Widget Pro</h2>
      <span class="price">$29.99</span>
      <p class="description">A great widget for all your needs.</p>
    </div>
    <div class="product">
      <h2 class="name">Gadget Plus</h2>
      <span class="price">$49.99</span>
      <p class="description">The best gadget on the market.</p>
    </div>
    <div class="product">
      <h2 class="name">Tool Ultra</h2>
      <span class="price">$19.99</span>
      <p class="description">Essential tool for developers.</p>
    </div>
  </div>
  <footer>
    <p>Contact: <a href="mailto:info@example.com">info@example.com</a></p>
  </footer>
</body>
</html>`

type HistoryEntry = { selector: string; count: number }

export default function ParsePage() {
  const [html, setHtml] = useState(SAMPLE_HTML)
  const [selector, setSelector] = useState(".product .name")
  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<ParseResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>([])

  async function run() {
    if (!html.trim() || !selector.trim()) return
    setStatus("loading")
    setResult(null)
    setErrorMsg("")
    try {
      const data = await apiParse(html, selector)
      setResult(data)
      setStatus("success")
      setHistory((prev) => {
        const next = [
          { selector, count: data.count },
          ...prev.filter((h) => h.selector !== selector),
        ].slice(0, 5)
        return next
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileCode2}
        iconColor="text-emerald-500"
        iconBg="bg-emerald-500/10"
        title="HTML Parser"
        description="Paste raw HTML and query it with CSS selectors — no network request required. Useful for testing your selectors offline."
        badge="Offline"
      />

      <InfoBox>
        Powered by Scrapling&apos;s{" "}
        <code className="text-primary">Selector</code> — CSS 4 selectors,
        XPath, and pseudo-elements like <code className="text-primary">::text</code>.
      </InfoBox>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <Card className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">HTML Input</p>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setHtml(SAMPLE_HTML)}
              className="text-xs"
            >
              Reset sample
            </Button>
          </div>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="font-mono text-xs h-56 resize-none"
            placeholder="Paste your HTML here…"
          />

          <div className="space-y-1.5">
            <Label htmlFor="selector">CSS Selector</Label>
            <div className="flex gap-2">
              <Input
                id="selector"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run()}
                placeholder=".class, #id, tag, …"
                className="font-mono text-sm"
                disabled={status === "loading"}
              />
              <Button
                onClick={run}
                disabled={status === "loading" || !html.trim() || !selector.trim()}
                className="gap-2 shrink-0"
              >
                {status === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                Run
              </Button>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Recent queries</p>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setSelector(h.selector)}
                    className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-mono hover:bg-muted transition-colors"
                  >
                    {h.selector}
                    <span className="text-muted-foreground">({h.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Results */}
        <Card className="glass-card p-5 space-y-4">
          <p className="text-sm font-semibold">Results</p>

          {status === "idle" && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <Clock className="size-8 opacity-30" />
              <p className="text-sm">Run a query to see results here.</p>
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="size-4 animate-spin" />
              Parsing HTML…
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === "success" && result && (
            <>
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                <span>
                  <strong>{result.count}</strong> element
                  {result.count !== 1 ? "s" : ""} matched{" "}
                  <code className="text-primary text-xs">{result.selector}</code>
                </span>
              </div>

              {result.count === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No elements matched this selector.
                </p>
              ) : (
                <ScrollArea className="h-72">
                  <div className="space-y-2 pr-2">
                    {result.results.map((el, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            [{i + 1}]
                          </Badge>
                          <p className="text-sm text-foreground">{el.text || "(no text)"}</p>
                        </div>
                        {Object.keys(el.attrs).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(el.attrs)
                              .slice(0, 5)
                              .map(([k, v]) => (
                                <Badge key={k} variant="secondary" className="text-[10px] font-mono">
                                  {k}=&quot;{String(v).slice(0, 25)}&quot;
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </>
          )}
        </Card>
      </div>

      <Card className="glass-card p-5">
        <p className="mb-3 text-sm font-semibold">Equivalent Python</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-foreground">
          {`from scrapling.parser import Selector

doc = Selector(html_string)
for el in doc.css("${selector}"):
    print(el.text)`}
        </pre>
      </Card>
    </div>
  )
}
