"use client"

import { useEffect, useRef, useState } from "react"
import { Bug, Play, Square, Download, Loader2, CheckCircle2, Clock, AlertCircle, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import { InfoBox } from "@/components/result-box"
import { spiderStream, type SpiderLogEvent, type SpiderItemEvent } from "@/lib/api"

type SpiderStatus = "idle" | "running" | "done" | "error"

interface LogEntry {
  level: SpiderLogEvent["level"]
  msg: string
  page: number
}

interface ScrapedItem {
  text: string
  author: string
  tags: string[]
  source_url: string
}

export default function SpiderPage() {
  const [startUrl, setStartUrl] = useState("https://quotes.toscrape.com/")
  const [itemSelector, setItemSelector] = useState(".quote")
  const [textSelector, setTextSelector] = useState(".text::text")
  const [authorSelector, setAuthorSelector] = useState(".author::text")
  const [nextSelector, setNextSelector] = useState(".next a")
  const [maxPages, setMaxPages] = useState("3")

  const [spiderStatus, setSpiderStatus] = useState<SpiderStatus>("idle")
  const [pagesVisited, setPagesVisited] = useState(0)
  const [items, setItems] = useState<ScrapedItem[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [errorMsg, setErrorMsg] = useState("")

  const cancelRef = useRef<(() => void) | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  const maxPagesNum = Math.max(1, Math.min(20, parseInt(maxPages) || 3))
  const progress = pagesVisited > 0 ? Math.min(100, Math.round((pagesVisited / maxPagesNum) * 100)) : 0

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  function run() {
    setSpiderStatus("running")
    setPagesVisited(0)
    setItems([])
    setLogs([])
    setErrorMsg("")

    const cancel = spiderStream(startUrl, {
      itemSelector,
      textSelector,
      authorSelector,
      nextSelector,
      maxPages: maxPagesNum,
      onLog(e) {
        setLogs((prev) => [...prev, { level: e.level, msg: e.msg, page: e.page }])
        setPagesVisited(e.page)
      },
      onItem(e) {
        setItems((prev) => [
          ...prev,
          {
            text: e.text,
            author: e.author,
            tags: e.tags,
            source_url: e.source_url,
          },
        ])
      },
      onDone(e) {
        setPagesVisited(e.pages_visited)
        setSpiderStatus("done")
      },
      onError(err) {
        setErrorMsg(err)
        setSpiderStatus("error")
      },
    })

    cancelRef.current = cancel
  }

  function stop() {
    cancelRef.current?.()
    setSpiderStatus("done")
    setLogs((prev) => [...prev, { level: "warn", msg: "Spider cancelled by user.", page: pagesVisited }])
  }

  function download() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "scraped-items.json"
    a.click()
  }

  const levelColors: Record<SpiderLogEvent["level"], string> = {
    info: "text-muted-foreground",
    warn: "text-amber-500",
    error: "text-destructive",
    success: "text-emerald-500",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bug}
        iconColor="text-rose-500"
        iconBg="bg-rose-500/10"
        title="Spider Runner"
        description="Configure and run a real multi-page crawl via the FastAPI backend. Streams live log events and scraped items."
        badge="SSE"
      />

      <InfoBox>
        Uses Server-Sent Events for real-time streaming. The API backend follows
        pagination and extracts items using your CSS selectors.
      </InfoBox>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Config */}
        <Card className="glass-card p-5 space-y-4">
          <p className="text-sm font-semibold">Configuration</p>

          <div className="space-y-1.5">
            <Label htmlFor="start-url">Start URL</Label>
            <Input
              id="start-url"
              type="url"
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              className="font-mono text-sm"
              disabled={spiderStatus === "running"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-sel">Item Selector</Label>
              <Input
                id="item-sel"
                value={itemSelector}
                onChange={(e) => setItemSelector(e.target.value)}
                className="font-mono text-xs"
                disabled={spiderStatus === "running"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next-sel">Next Page Selector</Label>
              <Input
                id="next-sel"
                value={nextSelector}
                onChange={(e) => setNextSelector(e.target.value)}
                className="font-mono text-xs"
                disabled={spiderStatus === "running"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="text-sel">Text Sub-selector</Label>
              <Input
                id="text-sel"
                value={textSelector}
                onChange={(e) => setTextSelector(e.target.value)}
                className="font-mono text-xs"
                disabled={spiderStatus === "running"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author-sel">Author Sub-selector</Label>
              <Input
                id="author-sel"
                value={authorSelector}
                onChange={(e) => setAuthorSelector(e.target.value)}
                className="font-mono text-xs"
                disabled={spiderStatus === "running"}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="max-pages">Max Pages (1–20)</Label>
            <Input
              id="max-pages"
              type="number"
              min={1}
              max={20}
              value={maxPages}
              onChange={(e) => setMaxPages(e.target.value)}
              className="w-28"
              disabled={spiderStatus === "running"}
            />
          </div>

          <div className="flex gap-2">
            {spiderStatus !== "running" ? (
              <Button onClick={run} disabled={!startUrl} className="gap-2">
                <Play className="size-4" />
                {spiderStatus === "done" || spiderStatus === "error" ? "Run Again" : "Start Spider"}
              </Button>
            ) : (
              <Button variant="destructive" onClick={stop} className="gap-2">
                <Square className="size-3.5 fill-current" />
                Stop
              </Button>
            )}
            {(spiderStatus === "done") && items.length > 0 && (
              <Button variant="outline" onClick={download} className="gap-2">
                <Download className="size-4" />
                Export JSON
              </Button>
            )}
          </div>

          {/* Progress */}
          {spiderStatus !== "idle" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  {spiderStatus === "running" && <Loader2 className="size-3 animate-spin text-primary" />}
                  {spiderStatus === "done" && <CheckCircle2 className="size-3 text-emerald-500" />}
                  {spiderStatus === "error" && <AlertCircle className="size-3 text-destructive" />}
                  <span className="font-medium capitalize">{spiderStatus}</span>
                </div>
                <span>
                  {pagesVisited} page{pagesVisited !== 1 ? "s" : ""} · {items.length} items
                </span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {spiderStatus === "error" && errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </Card>

        {/* Live results */}
        <div className="space-y-4">
          {/* Log */}
          <Card className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Live Log</p>
              {spiderStatus === "running" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
            <ScrollArea className="h-40 rounded-xl border border-border/50 bg-muted/20 p-2 font-mono">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground p-1">
                  Logs will appear here when the spider runs…
                </p>
              ) : (
                <div className="space-y-0.5">
                  {logs.map((l, i) => (
                    <div key={i} className={`text-xs ${levelColors[l.level]}`}>
                      <span className="text-muted-foreground mr-2">[p{l.page}]</span>
                      {l.msg}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Items */}
          {items.length > 0 && (
            <Card className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Scraped Items</p>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <ScrollArea className="h-56">
                <div className="space-y-2 pr-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-1"
                    >
                      <p className="text-xs text-foreground leading-relaxed">{item.text || "(no text)"}</p>
                      {item.author && (
                        <p className="text-xs text-muted-foreground">— {item.author}</p>
                      )}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>

      <Separator />

      <Card className="glass-card p-5">
        <p className="mb-3 text-sm font-semibold">Equivalent Python</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-foreground">
          {`from scrapper_tools.spiders import BaseSpider, Response

class MySpider(BaseSpider):
    name = "my_spider"
    start_urls = ["${startUrl}"]

    async def parse(self, response: Response):
        for item in response.css("${itemSelector}"):
            yield {
                "text": item.css("${textSelector}").get(),
                "author": item.css("${authorSelector}").get(),
            }
        next_page = response.css("${nextSelector}")
        if next_page:
            yield response.follow(next_page[0].attrib["href"])

result = MySpider().run()
result.items.to_json("output.json")`}
        </pre>
      </Card>
    </div>
  )
}
