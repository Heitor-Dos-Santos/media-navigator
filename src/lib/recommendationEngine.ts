import type { CampaignWithClient } from "@/data/multiClientData";
import type { AlertLog } from "@/types/alerts";
import { computeCampaignForecast, type CampaignForecast } from "@/lib/forecastCalculations";

// ── Types ──

export type RecommendationType = "budget_reallocation" | "creative_rotation" | "pause" | "scale";
export type RecommendationSeverity = "medium" | "high" | "critical";
export type RecommendationStatus = "pending" | "accepted" | "dismissed";

export interface Recommendation {
  id: string;
  campaignId: string;
  campaignName: string;
  clientId: string;
  clientName: string;
  platform: string;
  type: RecommendationType;
  severity: RecommendationSeverity;
  reason: string;
  suggestedAction: string;
  estimatedImpact: number; // positive = gain, negative = loss prevention
  impactLabel: string;
  status: RecommendationStatus;
  createdAt: string;
  forecast?: CampaignForecast;
}

// ── Meta ──

export const recommendationTypeMeta: Record<RecommendationType, { label: string; icon: string; color: string; bg: string }> = {
  budget_reallocation: { label: "Realocação de Budget", icon: "ArrowLeftRight", color: "text-blue-500", bg: "bg-blue-500/10" },
  creative_rotation: { label: "Rotação de Criativos", icon: "RefreshCw", color: "text-purple-500", bg: "bg-purple-500/10" },
  pause: { label: "Avaliação de Pausa", icon: "PauseCircle", color: "text-status-error", bg: "bg-status-error/10" },
  scale: { label: "Escalar Budget", icon: "TrendingUp", color: "text-status-success", bg: "bg-status-success/10" },
};

export const severityMeta: Record<RecommendationSeverity, { label: string; color: string; bg: string; border: string }> = {
  medium: { label: "Médio", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/30" },
  high: { label: "Alto", color: "text-[hsl(25,90%,50%)]", bg: "bg-[hsl(25,90%,50%)]/10", border: "border-[hsl(25,90%,50%)]/30" },
  critical: { label: "Crítico", color: "text-status-error", bg: "bg-status-error/10", border: "border-status-error/30" },
};

// ── Engine ──

export function generateRecommendations(
  campaigns: CampaignWithClient[],
  alerts: AlertLog[],
  precomputedForecasts?: Map<string, CampaignForecast>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let idCounter = 1;

  // Use pre-computed forecasts from Feature Store when available, fallback to local computation
  const forecasts = precomputedForecasts ?? new Map<string, CampaignForecast>();
  if (!precomputedForecasts) {
    campaigns.forEach(c => forecasts.set(c.campaignId, computeCampaignForecast(c)));
  }

  const alertMap = new Map<string, AlertLog[]>();
  alerts.forEach(a => {
    if (!alertMap.has(a.campaign_id)) alertMap.set(a.campaign_id, []);
    alertMap.get(a.campaign_id)!.push(a);
  });

  // Find high-performing campaigns for reallocation pairing
  const highPerformers = campaigns.filter(c => c.currentMBEI > 120);

  for (const campaign of campaigns) {
    const forecast = forecasts.get(campaign.campaignId)!;
    const campaignAlerts = alertMap.get(campaign.campaignId) || [];
    const plannedCPA = campaign.rollingCPA * 1.1;
    const cpaExcess = ((campaign.rollingCPA - plannedCPA) / plannedCPA) * 100;
    const estimatedSpend = campaign.rollingCPA * 500;

    // ── PAUSE recommendation ──
    if (
      campaign.currentMBEI < 75 &&
      cpaExcess > 30 &&
      campaign.spendVelocity > 1.1
    ) {
      const lossPrevention = Math.abs(campaign.rollingCPA - plannedCPA) * (campaign.rollingConversionRate * 50000 / 7 * 9);
      recommendations.push({
        id: `rec-${idCounter++}`,
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        clientId: campaign.clientId,
        clientName: campaign.clientName,
        platform: campaign.platform,
        type: "pause",
        severity: "critical",
        reason: `MBEI em ${campaign.currentMBEI} (< 75), CPA excedendo planejado, margem negativa provável.`,
        suggestedAction: "Avaliar pausar campanha e redistribuir budget para campanhas eficientes.",
        estimatedImpact: Math.round(lossPrevention),
        impactLabel: `Prevenção de perda: R$ ${Math.round(lossPrevention).toLocaleString("pt-BR")}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        forecast,
      });
      continue; // don't generate other recs for paused candidates
    }

    // ── SCALE recommendation ──
    if (
      campaign.currentMBEI > 130 &&
      (campaign.momentum === "strong_positive" || campaign.momentum === "positive") &&
      campaignAlerts.length === 0 &&
      campaign.spendVelocity <= 1.05
    ) {
      const upliftFactor = 0.15; // estimated 15% uplift
      const currentConversions = campaign.rollingConversionRate * 50000;
      const potentialGain = currentConversions * upliftFactor * campaign.rollingCPA;
      recommendations.push({
        id: `rec-${idCounter++}`,
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        clientId: campaign.clientId,
        clientName: campaign.clientName,
        platform: campaign.platform,
        type: "scale",
        severity: "medium",
        reason: `MBEI em ${campaign.currentMBEI} (> 130), momentum ${campaign.momentum}, sem alertas ativos.`,
        suggestedAction: "Considerar escalar budget em +10–20% mantendo monitoramento diário.",
        estimatedImpact: Math.round(potentialGain),
        impactLabel: `Ganho potencial: R$ ${Math.round(potentialGain).toLocaleString("pt-BR")}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        forecast,
      });
    }

    // ── BUDGET REALLOCATION recommendation ──
    if (campaign.currentMBEI < 85 && highPerformers.length > 0) {
      const bestTarget = highPerformers.find(hp => hp.clientId === campaign.clientId) || highPerformers[0];
      const savingsEstimate = estimatedSpend * 0.2; // 20% reallocation
      recommendations.push({
        id: `rec-${idCounter++}`,
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        clientId: campaign.clientId,
        clientName: campaign.clientName,
        platform: campaign.platform,
        type: "budget_reallocation",
        severity: campaign.currentMBEI < 75 ? "high" : "medium",
        reason: `MBEI da campanha (${campaign.currentMBEI}) abaixo de 85. ${bestTarget.campaignName} tem MBEI ${bestTarget.currentMBEI}.`,
        suggestedAction: `Realocar ~20% do budget para "${bestTarget.campaignName}" (MBEI ${bestTarget.currentMBEI}).`,
        estimatedImpact: Math.round(savingsEstimate),
        impactLabel: `Otimização estimada: R$ ${Math.round(savingsEstimate).toLocaleString("pt-BR")}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        forecast,
      });
    }

    // ── CREATIVE ROTATION recommendation ──
    if (
      (campaign.momentum === "negative" || campaign.momentum === "strong_negative") &&
      campaign.rollingConversionRate < 0.02
    ) {
      recommendations.push({
        id: `rec-${idCounter++}`,
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        clientId: campaign.clientId,
        clientName: campaign.clientName,
        platform: campaign.platform,
        type: "creative_rotation",
        severity: campaign.momentum === "strong_negative" ? "high" : "medium",
        reason: `Momentum ${campaign.momentum}, taxa de conversão em queda (${(campaign.rollingConversionRate * 100).toFixed(1)}%).`,
        suggestedAction: "Testar novas variações de criativos. Priorizar formatos com melhor CTR histórico.",
        estimatedImpact: Math.round(estimatedSpend * 0.1),
        impactLabel: `Recuperação potencial: R$ ${Math.round(estimatedSpend * 0.1).toLocaleString("pt-BR")}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        forecast,
      });
    }
  }

  // Sort by severity
  const sevOrder: Record<RecommendationSeverity, number> = { medium: 0, high: 1, critical: 2 };
  return recommendations.sort((a, b) => sevOrder[b.severity] - sevOrder[a.severity]);
}

// ── Aggregation helpers ──

export function getRecommendationStats(recs: Recommendation[]) {
  const total = recs.length;
  const highPriority = recs.filter(r => r.severity === "high" || r.severity === "critical").length;
  const totalImpact = recs.reduce((s, r) => s + r.estimatedImpact, 0);
  const byType: Record<RecommendationType, number> = {
    budget_reallocation: 0,
    creative_rotation: 0,
    pause: 0,
    scale: 0,
  };
  recs.forEach(r => byType[r.type]++);
  return { total, highPriority, totalImpact, byType };
}
