import { calculateMBEI, type MBEIInput } from "@/components/dashboard/MBEIScoreCard";
import type { MomentumCategory, CampaignTrendData, AgencyAggregation } from "@/types/efficiency";

export function getMomentumCategory(currentMBEI: number, avgMBEI7d: number): { category: MomentumCategory; delta: number } {
  const delta = avgMBEI7d > 0 ? ((currentMBEI - avgMBEI7d) / avgMBEI7d) * 100 : 0;
  if (delta >= 5) return { category: "strong_positive", delta };
  if (delta >= 1) return { category: "positive", delta };
  if (delta > -1) return { category: "neutral", delta };
  if (delta > -5) return { category: "negative", delta };
  return { category: "strong_negative", delta };
}

export function getSpendVelocity(actualSpend: number, plannedBudget: number, elapsedDays: number, totalDays: number): number {
  if (plannedBudget === 0 || totalDays === 0 || elapsedDays === 0) return 1;
  return (actualSpend / plannedBudget) / (elapsedDays / totalDays);
}

export function getMomentumMeta(category: MomentumCategory) {
  const map: Record<MomentumCategory, { label: string; arrow: string; color: string }> = {
    strong_positive: { label: "Strong Positive", arrow: "↑↑", color: "text-status-success" },
    positive: { label: "Positive", arrow: "↑", color: "text-status-success" },
    neutral: { label: "Neutral", arrow: "→", color: "text-status-warning" },
    negative: { label: "Negative", arrow: "↓", color: "text-status-error" },
    strong_negative: { label: "Strong Negative", arrow: "↓↓", color: "text-status-error" },
  };
  return map[category];
}

export function getSpendVelocityLabel(velocity: number): { label: string; color: string } {
  if (velocity > 1.05) return { label: "Overspending", color: "text-status-error" };
  if (velocity < 0.95) return { label: "Underspending", color: "text-status-warning" };
  return { label: "On Track", color: "text-status-success" };
}

export function computeAgencyAggregation(campaigns: CampaignTrendData[]): AgencyAggregation {
  const total = campaigns.length;
  if (total === 0) return { avgMBEI7d: 0, momentum: "neutral", momentumDelta: 0, overspendingCount: 0, underspendingCount: 0, totalCampaigns: 0 };

  const avgMBEI7d = campaigns.reduce((s, c) => s + c.avgMBEI7d, 0) / total;
  const avgCurrentMBEI = campaigns.reduce((s, c) => s + c.currentMBEI, 0) / total;
  const { category, delta } = getMomentumCategory(avgCurrentMBEI, avgMBEI7d);

  return {
    avgMBEI7d: Math.round(avgMBEI7d),
    momentum: category,
    momentumDelta: delta,
    overspendingCount: campaigns.filter(c => c.spendVelocity > 1.05).length,
    underspendingCount: campaigns.filter(c => c.spendVelocity < 0.95).length,
    totalCampaigns: total,
  };
}
