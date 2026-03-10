import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type ResultStatus = "idle" | "success" | "error" | "loading"

interface ResultBoxProps {
  status: ResultStatus
  children?: React.ReactNode
  className?: string
}

export function ResultBox({ status, children, className }: ResultBoxProps) {
  if (status === "idle") return null

  const variants: Record<ResultStatus, { border: string; bg: string; Icon?: React.ElementType; iconClass?: string }> = {
    idle: { border: "", bg: "" },
    loading: { border: "border-border", bg: "bg-muted/30" },
    success: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      Icon: CheckCircle2,
      iconClass: "text-emerald-500",
    },
    error: {
      border: "border-destructive/30",
      bg: "bg-destructive/5",
      Icon: AlertCircle,
      iconClass: "text-destructive",
    },
  }

  const { border, bg, Icon, iconClass } = variants[status]

  return (
    <div
      className={cn(
        "rounded-xl border p-4 font-mono text-sm",
        border,
        bg,
        className
      )}
    >
      {Icon && (
        <div className="mb-2 flex items-center gap-2">
          <Icon className={`size-4 shrink-0 ${iconClass}`} />
          <span className={`text-xs font-medium not-italic ${iconClass}`}>
            {status === "success" ? "Result" : "Error"}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="leading-relaxed">{children}</p>
    </div>
  )
}
