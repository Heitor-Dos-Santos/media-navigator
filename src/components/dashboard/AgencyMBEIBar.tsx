import { cn } from "@/lib/utils";
import { getMomentumMeta } from "@/lib/efficiencyCalculations";
import type { AgencyAggregation } from "@/types/efficiency";
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface AgencyMBEIBarProps {
  data: AgencyAggregation;
}

export function AgencyMBEIBar({ data }: AgencyMBEIBarProps) {
  const meta = getMomentumMeta(data.momentum);

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Agency Avg MBEI */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg MBEI (7d)</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{data.avgMBEI7d}<span className="text-sm text-muted-foreground">/150</span></p>
          </div>
        </div>

        {/* Momentum */}
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", meta.color === "text-status-success" ? "bg-status-success/10" : meta.color === "text-status-error" ? "bg-status-error/10" : "bg-status-warning/10")}>
            <span className={cn("text-lg font-bold", meta.color)}>{meta.arrow}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Momentum</p>
            <p className={cn("text-sm font-semibold", meta.color)}>{meta.label}</p>
          </div>
        </div>

        {/* Overspending */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-error/10">
            <TrendingUp className="w-5 h-5 text-status-error" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Overspending</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{data.overspendingCount}<span className="text-sm text-muted-foreground"> / {data.totalCampaigns}</span></p>
          </div>
        </div>

        {/* Underspending */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-warning/10">
            <TrendingDown className="w-5 h-5 text-status-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Underspending</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{data.underspendingCount}<span className="text-sm text-muted-foreground"> / {data.totalCampaigns}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
