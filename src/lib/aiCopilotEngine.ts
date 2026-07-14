import type { CampaignWithClient } from "@/data/multiClientData";
import type { AlertLog } from "@/types/alerts";
import type { FunnelStage, AIContextSnapshot, AIGeneratedInsight, InsightType } from "@/types/aiCopilot";
import { FUNNEL_METRIC_PRIORITY } from "@/types/aiCopilot";
import { computeCampaignForecast, type CampaignForecast } from "@/lib/forecastCalculations";
import { getMomentumMeta } from "@/lib/efficiencyCalculations";

// ── Funnel stage assignment (deterministic, name-based heuristic) ──

export function inferFunnelStage(campaign: CampaignWithClient): FunnelStage {
  const name = campaign.campaignName.toLowerCase();
  if (name.includes("awareness") || name.includes("video") || name.includes("brand")) return "awareness";
  if (name.includes("lead") || name.includes("social") || name.includes("b2b") || name.includes("linkedin")) return "consideration";
  if (name.includes("retarget") || name.includes("retention") || name.includes("returning")) return "retention";
  return "conversion"; // default
}

// ── Context Snapshot Builder ──

export function buildContextSnapshot(
  campaign: CampaignWithClient,
  funnelStage: FunnelStage,
  alerts: AlertLog[],
  marginPercent?: number,
  precomputedForecast?: CampaignForecast
): AIContextSnapshot {
  let forecast = precomputedForecast;
  if (!forecast) {
    forecast = computeCampaignForecast(campaign);
  }
  const campaignAlerts = alerts.filter(a => a.campaign_id === campaign.campaignId);
  const anomalyFlags: string[] = [];

  if (campaign.currentMBEI < 85) anomalyFlags.push("MBEI abaixo do limiar");
  if (campaign.spendVelocity > 1.1) anomalyFlags.push("Overspending detectado");
  if (campaign.spendVelocity < 0.9) anomalyFlags.push("Underspending detectado");
  if (campaign.momentum === "strong_negative") anomalyFlags.push("Momentum fortemente negativo");
  if (campaignAlerts.filter(a => a.severity === "critical").length > 0) anomalyFlags.push("Alertas críticos ativos");
  if (forecast.overallStatus === "high_risk") anomalyFlags.push("Forecast em alto risco");

  const mMeta = getMomentumMeta(campaign.momentum);

  return {
    tenantId: "default",
    clientId: campaign.clientId,
    campaignId: campaign.campaignId,
    funnelStage,
    structuredMetrics: {
      mbei: campaign.currentMBEI,
      cpa: campaign.rollingCPA,
      conversionRate: campaign.rollingConversionRate,
      spendVelocity: campaign.spendVelocity,
      momentum: campaign.momentum,
      momentumDelta: campaign.momentumDelta,
    },
    anomalyFlags,
    trendSummary: `Momentum ${mMeta.label} (${campaign.momentumDelta >= 0 ? "+" : ""}${campaign.momentumDelta.toFixed(1)}%). MBEI atual ${campaign.currentMBEI} vs 7d avg ${campaign.avgMBEI7d}.`,
    forecastSummary: `Forecast status: ${forecast.overallStatus}. CPA projetado: R$ ${forecast.projectedCPA.toFixed(2)}.`,
    marginSummary: marginPercent != null ? `Margem do cliente: ${marginPercent.toFixed(1)}%` : "Margem não disponível",
    createdAt: new Date().toISOString(),
  };
}

// ── Deterministic Insight Generation (no LLM, structured interpretation) ──

let insightIdCounter = 1;

function createInsight(
  campaign: CampaignWithClient,
  funnelStage: FunnelStage,
  insightType: InsightType,
  text: string,
  confidence: number
): AIGeneratedInsight {
  return {
    id: `ai-${insightIdCounter++}`,
    tenantId: "default",
    clientId: campaign.clientId,
    clientName: campaign.clientName,
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    funnelStage,
    insightType,
    generatedText: text,
    confidenceScore: confidence,
    createdAt: new Date().toISOString(),
  };
}

export function generateAIInsights(
  campaigns: CampaignWithClient[],
  alerts: AlertLog[],
  precomputedForecasts?: Map<string, CampaignForecast>
): AIGeneratedInsight[] {
  insightIdCounter = 1;
  const insights: AIGeneratedInsight[] = [];

  for (const campaign of campaigns) {
    const stage = inferFunnelStage(campaign);
    const ctx = buildContextSnapshot(campaign, stage, alerts);
    const focusAreas = FUNNEL_METRIC_PRIORITY[stage].aiFocus;

    // Anomaly insights
    if (ctx.anomalyFlags.length > 0) {
      const flags = ctx.anomalyFlags.join("; ");
      insights.push(createInsight(
        campaign, stage, "anomaly",
        `[${campaign.campaignName}] Anomalias detectadas no estágio ${stage}: ${flags}. Métricas prioritárias para este estágio: ${FUNNEL_METRIC_PRIORITY[stage].primaryMetrics.slice(0, 3).join(", ")}. Foco de análise: ${focusAreas[0]}.`,
        ctx.anomalyFlags.length >= 3 ? 92 : 78
      ));
    }

    // Forecast risk — use pre-computed or compute lazily
    let forecast = precomputedForecasts?.get(campaign.campaignId);
    if (!forecast) {
      forecast = computeCampaignForecast(campaign);
    }
    if (forecast.overallStatus === "high_risk") {
      insights.push(createInsight(
        campaign, stage, "forecast",
        `[${campaign.campaignName}] Projeção indica alto risco de descumprimento de metas. CPA projetado R$ ${forecast.projectedCPA.toFixed(2)} pode comprometer eficiência no estágio ${stage}. Recomenda-se ${stage === "conversion" ? "revisão imediata de lances e segmentação" : "avaliação de audience quality e creative fatigue"}.`,
        85
      ));
    }

    // Margin insights for conversion stage
    if (stage === "conversion" && campaign.currentMBEI < 90) {
      insights.push(createInsight(
        campaign, stage, "margin",
        `[${campaign.campaignName}] MBEI ${campaign.currentMBEI} indica erosão de margem em campanha de conversão. CPA rolling R$ ${campaign.rollingCPA.toFixed(2)} com spend velocity ${campaign.spendVelocity.toFixed(2)}. Avaliar trade-off entre escala e rentabilidade.`,
        82
      ));
    }
  }

  // Daily summary insight (agency-level)
  const avgMBEI = campaigns.length > 0 ? Math.round(campaigns.reduce((s, c) => s + c.currentMBEI, 0) / campaigns.length) : 0;
  const criticalAlerts = alerts.filter(a => a.severity === "critical" && a.status === "active").length;
  const atRisk = campaigns.filter(c => c.currentMBEI < 85).length;
  const funnelDist = campaigns.reduce((acc, c) => {
    const s = inferFunnelStage(c);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dominantStage = Object.entries(funnelDist).sort((a, b) => b[1] - a[1])[0]?.[0] || "conversion";

  if (campaigns.length > 0) {
    insights.unshift({
      id: "ai-daily-summary",
      tenantId: "default",
      clientId: "agency",
      clientName: "Agência",
      campaignId: "all",
      campaignName: "Visão Geral",
      funnelStage: dominantStage as FunnelStage,
      insightType: "daily",
      generatedText: `MBEI médio da agência em ${avgMBEI}. ${criticalAlerts} alertas críticos ativos. ${atRisk} campanhas com MBEI < 85. Estágio dominante: ${dominantStage}. ${atRisk > 2 ? "Atenção: concentração de risco acima do esperado — revisar alocação de budget entre estágios do funil." : "Distribuição de risco dentro dos parâmetros aceitáveis."}`,
      confidenceScore: 90,
      createdAt: new Date().toISOString(),
    });
  }

  // Weekly strategic summary
  const negMomentumCount = campaigns.filter(c => c.momentum === "negative" || c.momentum === "strong_negative").length;
  if (campaigns.length > 0) {
    insights.push({
      id: "ai-weekly-strategic",
      tenantId: "default",
      clientId: "agency",
      clientName: "Agência",
      campaignId: "all",
      campaignName: "Estratégia Semanal",
      funnelStage: dominantStage as FunnelStage,
      insightType: "weekly",
      generatedText: `Análise semanal: ${negMomentumCount} campanhas com momentum negativo de ${campaigns.length} ativas. ${criticalAlerts} alertas críticos persistentes. Funil ${Object.entries(funnelDist).map(([k, v]) => `${k}: ${v}`).join(", ")}. ${negMomentumCount > campaigns.length * 0.4 ? "Risco estrutural: mais de 40% das campanhas em declínio. Recomenda-se revisão estratégica completa." : "Performance dentro dos parâmetros — foco em otimizações pontuais."}`,
      confidenceScore: 88,
      createdAt: new Date().toISOString(),
    });
  }

  return insights.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

// ── Helpers ──

export function getInsightsByType(insights: AIGeneratedInsight[], type: InsightType): AIGeneratedInsight[] {
  return insights.filter(i => i.insightType === type);
}

export function getInsightsByFunnel(insights: AIGeneratedInsight[], stage: FunnelStage): AIGeneratedInsight[] {
  return insights.filter(i => i.funnelStage === stage);
}

export function getInsightsByClient(insights: AIGeneratedInsight[], clientId: string): AIGeneratedInsight[] {
  return insights.filter(i => i.clientId === clientId);
}
