import type { CampaignWithClient } from "@/data/multiClientData";
import type { ClientProfitability } from "@/types/financials";
import { MARGIN_THRESHOLD } from "@/types/financials";

export interface AgencyBenchmark {
  avgMBEI: number;
  avgCPA: number;
  avgConversionRate: number;
  avgMarginPercent: number;
  avgSpendVelocity: number;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskScore {
  score: number;
  level: RiskLevel;
}

export type Percentile = "top10" | "top25" | "middle" | "bottom25";

export function computeAgencyBenchmark(
  campaigns: CampaignWithClient[],
  profitabilities: ClientProfitability[]
): AgencyBenchmark {
  const n = campaigns.length;
  if (n === 0) return { avgMBEI: 0, avgCPA: 0, avgConversionRate: 0, avgMarginPercent: 0, avgSpendVelocity: 0 };

  const avgMBEI = campaigns.reduce((s, c) => s + c.currentMBEI, 0) / n;
  const avgCPA = campaigns.reduce((s, c) => s + c.rollingCPA, 0) / n;
  const avgConversionRate = campaigns.reduce((s, c) => s + c.rollingConversionRate, 0) / n;
  const avgSpendVelocity = campaigns.reduce((s, c) => s + c.spendVelocity, 0) / n;

  const pn = profitabilities.length;
  const avgMarginPercent = pn > 0
    ? profitabilities.reduce((s, p) => s + p.marginPercent, 0) / pn
    : 0;

  return {
    avgMBEI: Math.round(avgMBEI),
    avgCPA: Math.round(avgCPA * 100) / 100,
    avgConversionRate: Math.round(avgConversionRate * 10000) / 10000,
    avgMarginPercent: Math.round(avgMarginPercent * 10) / 10,
    avgSpendVelocity: Math.round(avgSpendVelocity * 100) / 100,
  };
}

export function computeRiskScore(
  avgMBEI: number,
  momentum: string,
  alertCount: number,
  marginPercent: number
): RiskScore {
  let score = 0;

  // MBEI factor (0-35 points)
  if (avgMBEI < 80) score += 35;
  else if (avgMBEI < 90) score += 25;
  else if (avgMBEI < 100) score += 15;
  else if (avgMBEI < 110) score += 5;

  // Momentum factor (0-25 points)
  if (momentum === "strong_negative") score += 25;
  else if (momentum === "negative") score += 15;
  else if (momentum === "neutral") score += 5;

  // Alert factor (0-20 points)
  if (alertCount >= 5) score += 20;
  else if (alertCount >= 3) score += 15;
  else if (alertCount >= 1) score += 8;

  // Margin factor (0-20 points)
  if (marginPercent < 0) score += 20;
  else if (marginPercent < 10) score += 15;
  else if (marginPercent < MARGIN_THRESHOLD) score += 10;

  score = Math.min(100, score);

  let level: RiskLevel;
  if (score >= 70) level = "critical";
  else if (score >= 45) level = "high";
  else if (score >= 20) level = "medium";
  else level = "low";

  return { score, level };
}

export function getPercentile(rank: number, total: number): Percentile {
  if (total === 0) return "middle";
  const pct = rank / total;
  if (pct <= 0.1) return "top10";
  if (pct <= 0.25) return "top25";
  if (pct > 0.75) return "bottom25";
  return "middle";
}

export const riskLevelMeta: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  low: { label: "Baixo", color: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/30" },
  medium: { label: "Médio", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/30" },
  high: { label: "Alto", color: "text-[hsl(25,90%,50%)]", bg: "bg-[hsl(25,90%,50%)]/10", border: "border-[hsl(25,90%,50%)]/30" },
  critical: { label: "Crítico", color: "text-status-error", bg: "bg-status-error/10", border: "border-status-error/30" },
};

export const percentileMeta: Record<Percentile, { label: string; color: string; bg: string }> = {
  top10: { label: "Top 10%", color: "text-status-success", bg: "bg-status-success/10" },
  top25: { label: "Top 25%", color: "text-primary", bg: "bg-primary/10" },
  middle: { label: "Mediano", color: "text-muted-foreground", bg: "bg-muted" },
  bottom25: { label: "Bottom 25%", color: "text-status-error", bg: "bg-status-error/10" },
};
