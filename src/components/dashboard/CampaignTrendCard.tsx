import { cn } from "@/lib/utils";
import { getMomentumMeta, getSpendVelocityLabel } from "@/lib/efficiencyCalculations";
import { computeCampaignForecast, forecastStatusMeta } from "@/lib/forecastCalculations";
import type { CampaignTrendData } from "@/types/efficiency";
import type { AlertLog } from "@/types/alerts";
import { getSeverityMeta } from "@/types/alerts";
import type { CampaignWithClient } from "@/data/multiClientData";
import { Bell, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CampaignTrendCardProps {
  campaign: CampaignTrendData;
  alerts?: AlertLog[];
}

export function CampaignTrendCard({ campaign, alerts = [] }: CampaignTrendCardProps) {
  const meta = getMomentumMeta(campaign.momentum);
  const velocity = getSpendVelocityLabel(campaign.spendVelocity);
  const activeAlerts = alerts.filter(a => a.status === "active");
  const highestSeverity = activeAlerts.length > 0
    ? activeAlerts.reduce((max, a) => {
        const order = { low: 0, medium: 1, high: 2, critical: 3 };
        return order[a.severity] > order[max.severity] ? a : max;
      })
    : null;

  // Forecast
  const forecast = computeCampaignForecast(campaign as CampaignWithClient);
  const fMeta = forecastStatusMeta[forecast.overallStatus];
  const DirectionIcon = forecast.mbeiDirection === "up" ? TrendingUp : forecast.mbeiDirection === "down" ? TrendingDown : Minus;

  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <p className="font-semibold text-foreground text-sm">{campaign.campaignName}</p>
            <p className="text-xs text-muted-foreground">{campaign.platform}</p>
          </div>
          {highestSeverity && (
            <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full", getSeverityMeta(highestSeverity.severity).bg, getSeverityMeta(highestSeverity.severity).color)}>
              <Bell className="w-3 h-3" />{activeAlerts.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold", meta.color)}>{meta.arrow}</span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
            meta.color === "text-status-success" ? "bg-status-success/10 text-status-success" :
            meta.color === "text-status-error" ? "bg-status-error/10 text-status-error" :
            "bg-status-warning/10 text-status-warning"
          )}>{meta.label}</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-10">
        <MiniSparkline data={campaign.sparklineData} color={meta.color} />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <MetricCell label="Efic." value={String(campaign.currentMBEI)} />
        <MetricCell label="CPA (7d)" value={`R$${campaign.rollingCPA.toFixed(0)}`} />
        <MetricCell label="CVR (7d)" value={`${(campaign.rollingConversionRate * 100).toFixed(1)}%`} />
        <MetricCell label="Velocity" value={campaign.spendVelocity.toFixed(2)} subColor={velocity.color} />
      </div>

      {/* Forecast Row */}
      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DirectionIcon className={cn("w-3.5 h-3.5", fMeta.color)} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Forecast</span>
          </div>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", fMeta.bg, fMeta.color, fMeta.border)}>{fMeta.label}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mt-1.5">
          <MetricCell label="Efic. Proj." value={String(forecast.forecastedMBEI)} subColor={forecast.forecastedMBEI >= 95 ? "text-status-success" : forecast.forecastedMBEI >= 85 ? "text-status-warning" : "text-status-error"} />
          <MetricCell label="CPA Proj." value={`R$${forecast.projectedCPA.toFixed(0)}`} subColor={forecast.cpaVariance <= 10 ? "text-status-success" : "text-status-error"} />
          <MetricCell label="Meta Conv." value={`${forecast.goalProbability}%`} subColor={forecast.goalProbability >= 95 ? "text-status-success" : forecast.goalProbability >= 80 ? "text-status-warning" : "text-status-error"} />
        </div>
      </div>
    </div>
  );
}

function MetricCell({ label, value, subColor }: { label: string; value: string; subColor?: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-bold tabular-nums", subColor || "text-foreground")}>{value}</p>
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 100;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  const strokeColor = color.includes("success") ? "hsl(var(--status-success))"
    : color.includes("error") ? "hsl(var(--status-error))"
    : "hsl(var(--status-warning))";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
