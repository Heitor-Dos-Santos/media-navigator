import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadGenStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  delay?: number;
}

export function LeadGenStatCard({ title, value, icon: Icon, change, changeType = "neutral", delay = 0 }: LeadGenStatCardProps) {
  return (
    <div
      className="rounded-xl p-5 border border-border bg-card animate-fade-in hover:border-primary/30 transition-all"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-status-success",
              changeType === "negative" && "text-status-error",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
