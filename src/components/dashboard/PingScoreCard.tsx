import { cn } from "@/lib/utils";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PingScoreCardProps {
  score: number;
  campaignName: string;
  platform: string;
  trend?: "up" | "down" | "stable";
  metrics?: {
    delivery: number;
    performance: number;
    optimization: number;
  };
}

function getScoreStatus(score: number) {
  if (score >= 75) return { label: "Saudável", color: "text-status-success", bg: "bg-status-success" };
  if (score >= 50) return { label: "Atenção", color: "text-status-warning", bg: "bg-status-warning" };
  if (score >= 25) return { label: "Crítico", color: "text-status-error", bg: "bg-status-error" };
  return { label: "Sem dados", color: "text-status-neutral", bg: "bg-status-neutral" };
}

export function PingScoreCard({ score, campaignName, platform, trend = "stable", metrics }: PingScoreCardProps) {
  const status = getScoreStatus(score);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="relative p-4 rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/30 transition-all duration-300">
      {/* Glow effect */}
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30",
        status.bg
      )} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{platform}</p>
            <h3 className="font-medium text-foreground truncate max-w-[180px]">{campaignName}</h3>
          </div>
          <div className={cn("flex items-center gap-1 text-xs", status.color)}>
            <TrendIcon className="w-3 h-3" />
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-end gap-3 mb-4">
          <div className="relative">
            <span className={cn("text-4xl font-bold tabular-nums", status.color)}>{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full mb-1", status.bg, "text-background")}>
            {status.label}
          </span>
        </div>

        {/* Metrics Bar */}
        {metrics && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Entrega</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-status-success rounded-full transition-all duration-500"
                  style={{ width: `${metrics.delivery}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{metrics.delivery}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Performance</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${metrics.performance}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{metrics.performance}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Otimização</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-status-warning rounded-full transition-all duration-500"
                  style={{ width: `${metrics.optimization}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{metrics.optimization}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Pulse indicator */}
      <div className="absolute top-4 right-4">
        <Activity className={cn("w-4 h-4", status.color)} />
      </div>
    </div>
  );
}
