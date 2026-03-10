import { type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  title: string
  description: string
  badge?: string
}

export function PageHeader({
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  title,
  description,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <div
        className={`${iconBg} flex size-11 shrink-0 items-center justify-center rounded-xl`}
      >
        <Icon className={`size-6 ${iconColor}`} />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
          {description}
        </p>
      </div>
    </div>
  )
}
