"use client"

import { useState } from "react"
import { Mail, Loader2, Search, Copy, Check, AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { InfoBox } from "@/components/result-box"
import { apiEmails, type EmailsResult } from "@/lib/api"

type Status = "idle" | "loading" | "success" | "error"

export default function EmailsPage() {
  const [url, setUrl] = useState("https://next.cubetiqs.com")
  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<EmailsResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  async function run() {
    if (!url) return
    setStatus("loading")
    setResult(null)
    setErrorMsg("")
    try {
      const data = await apiEmails(url)
      setResult(data)
      setStatus("success")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStatus("error")
    }
  }

  function copyEmail(email: string, idx: number) {
    navigator.clipboard.writeText(email).then(() => {
      setCopiedIndex(idx)
      setTimeout(() => setCopiedIndex(null), 1500)
    })
  }

  function copyAll() {
    const text = result?.emails.map((e) => e.email).join("\n") ?? ""
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1500)
    })
  }

  // Group emails by domain
  const byDomain = result
    ? result.emails.reduce<Record<string, string[]>>((acc, e) => {
        ;(acc[e.domain] ??= []).push(e.email)
        return acc
      }, {})
    : {}

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        iconColor="text-amber-500"
        iconBg="bg-amber-500/10"
        title="Email Finder"
        description="Scan a page for email addresses in text content and HTML source, deduplicated and grouped by domain."
        badge="Regex"
      />

      <InfoBox>
        Scans both visible text and raw HTML — catches{" "}
        <code className="text-primary">mailto:</code> links and plain-text
        addresses alike.
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
              placeholder="https://example.com/contact"
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
              Find Emails
            </Button>
          </div>
        </div>

        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Scanning page for email addresses…
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                <span>
                  Found <strong>{result.count}</strong> email
                  {result.count !== 1 ? "s" : ""} in {result.elapsed_ms}ms
                </span>
              </div>
              {result.count > 0 && (
                <Button variant="outline" size="sm" onClick={copyAll} className="gap-2">
                  {copiedAll ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  Copy all
                </Button>
              )}
            </div>

            {result.count === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No email addresses found on this page.
              </p>
            ) : (
              <>
                {/* Email cards */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.emails.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-mono truncate text-foreground">{item.email}</p>
                        <p className="text-xs text-muted-foreground">{item.domain}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => copyEmail(item.email, i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedIndex === i ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Domain breakdown */}
                {Object.keys(byDomain).length > 1 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      By domain
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(byDomain).map(([domain, addrs]) => (
                        <Badge key={domain} variant="secondary" className="gap-1.5">
                          {domain}
                          <span className="rounded-full bg-primary/20 px-1 text-[10px] font-semibold">
                            {addrs.length}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>

      <Card className="glass-card p-5">
        <p className="mb-3 text-sm font-semibold">Equivalent Python</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed text-foreground">
          {`from scrapper_tools import fetch
from scrapper_tools.utils import extract_emails

page = fetch("${url}")
text = page.get_all_text(separator=" ", strip=True)
emails = extract_emails(text)
print(f"Found {len(emails)} emails:", emails)`}
        </pre>
      </Card>
    </div>
  )
}
