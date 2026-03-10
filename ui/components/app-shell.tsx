"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Globe,
  LayoutDashboard,
  Link2,
  Mail,
  FileCode2,
  Bug,
  Menu,
  X,
  Moon,
  Sun,
  Github,
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"

import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fetch", label: "HTTP Fetch", icon: Globe },
  { href: "/links", label: "Link Extractor", icon: Link2 },
  { href: "/emails", label: "Email Finder", icon: Mail },
  { href: "/parse", label: "HTML Parser", icon: FileCode2 },
  { href: "/spider", label: "Spider", icon: Bug },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

function SidebarNav({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1 px-2 py-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onNav}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-transform group-hover:scale-110",
                active && "drop-shadow-sm"
              )}
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 select-none">
      <div className="gradient-brand flex size-8 items-center justify-center rounded-lg shadow">
        <Bug className="size-4 text-white" />
      </div>
      <span className="gradient-text text-base font-bold tracking-tight">
        ScrapeKit
      </span>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Top navbar ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-3 px-4 sm:px-6">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <Logo />

          {/* Desktop nav links */}
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV_ITEMS.slice(0, 5).map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <a
              href="https://github.com/sombochea/scrapper-tools"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="mx-auto flex w-full max-w-screen-xl flex-1 items-start gap-0 md:gap-6 px-4 sm:px-6 py-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-[4.5rem] hidden w-52 shrink-0 flex-col md:flex">
          <div className="rounded-xl border border-border/60 bg-sidebar shadow-sm">
            <SidebarNav />
            <Separator className="mx-4" />
            <div className="px-4 py-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Powered by
              </p>
              <a
                href="https://github.com/sombochea/scrapper-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Bug className="size-3" />
                Scrapling
              </a>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 bg-background/60">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-4 text-center text-xs text-muted-foreground">
          ScrapeKit — built with{" "}
          <a
            href="https://github.com/sombochea/scrapper-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Scrapling
          </a>{" "}
          &{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Next.js
          </a>
        </div>
      </footer>

      {/* ── Mobile drawer ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* drawer panel */}
          <aside className="relative z-10 flex w-64 flex-col bg-sidebar shadow-xl">
            <div className="flex h-14 items-center justify-between px-4">
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <Separator />
            <SidebarNav onNav={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {label}
    </Link>
  )
}
