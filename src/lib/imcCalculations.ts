/**
 * ═══════════════════════════════════════════════════════════════
 * IMC CALCULATION ENGINE
 * ═══════════════════════════════════════════════════════════════
 *
 * Computa o Índice de Maturidade do Cliente (IMC) a partir de
 * sinais estruturais já existentes no Feature Store.
 *
 * NÃO usa performance direta como base principal.
 * NÃO influencia o cálculo do ISO.
 * Mede execução estrutural, não saúde atual.
 * ═══════════════════════════════════════════════════════════════
 */

import type { CampaignWithClient } from "@/data/multiClientData";
import type { AlertLog } from "@/types/alerts";
import type { CampaignForecast } from "@/lib/forecastCalculations";
import type { BudgetElasticityAnalysis, FrequencySaturationAnalysis, FunnelInteractionAnalysis } from "@/types/statisticalIntelligence";
import type { Recommendation } from "@/lib/recommendationEngine";
import type { IMCScore, AgencyIMCSummary } from "@/types/imc";
import { classifyIMC } from "@/types/imc";
import { inferFunnelStage } from "@/lib/aiCopilotEngine";

// ── Per-Client IMC ──

export function computeClientIMC(
  clientId: string,
  clientName: string,
  campaigns: CampaignWithClient[],
  alerts: AlertLog[],
  forecasts: CampaignForecast[],
  elasticities: BudgetElasticityAnalysis[],
  saturationAnalyses: FrequencySaturationAnalysis[],
  funnelInteractions: FunnelInteractionAnalysis[],
  recommendations: Recommendation[]
): IMCScore {
  const n = campaigns.length;
  if (n === 0) return buildIMC(clientId, clientName, 50, 50, 50, 50);

  // ── 1. Estrutura de Dados (30%) ──
  // Tracking ativo: campaigns with conversion data
  const hasConversions = campaigns.filter(c => c.rollingConversionRate > 0).length;
  const trackingScore = (hasConversions / n) * 100;

  // UTM padronization: campaigns with structured naming
  const hasStructuredName = campaigns.filter(c => c.campaignName.includes("_")).length;
  const utmScore = (hasStructuredName / n) * 100;

  // Integrações: platforms diversity
  const platforms = new Set(campaigns.map(c => c.platform));
  const integrationScore = Math.min(100, (platforms.size / 3) * 100);

  // Eventos estratégicos: campaigns with meaningful sparkline data
  const hasEvents = campaigns.filter(c => c.sparklineData.length >= 5).length;
  const eventScore = (hasEvents / n) * 100;

  const dataStructure = Math.round(trackingScore * 0.3 + utmScore * 0.3 + integrationScore * 0.2 + eventScore * 0.2);

  // ── 2. Estrutura de Mídia (25%) ──
  // Funil completo: presence across funnel stages
  const funnelStages = new Set(campaigns.map(c => inferFunnelStage(c)));
  const funnelCompleteness = Math.min(100, (funnelStages.size / 4) * 100);

  // Diversificação de canais
  const channelDiversity = Math.min(100, (platforms.size / 4) * 100);

  // Testes ativos: campaigns with testing momentum
  const testingCampaigns = campaigns.filter(c =>
    c.momentum === "positive" || c.momentum === "strong_positive"
  ).length;
  const testingScore = Math.min(100, (testingCampaigns / Math.max(1, n)) * 150);

  // Organização: naming conventions
  const organizedNaming = campaigns.filter(c => {
    const parts = c.campaignName.split("_");
    return parts.length >= 3;
  }).length;
  const organizationScore = (organizedNaming / n) * 100;

  const mediaStructure = Math.round(funnelCompleteness * 0.3 + channelDiversity * 0.25 + testingScore * 0.2 + organizationScore * 0.25);

  // ── 3. Governança Operacional (25%) ──
  // Alertas tratados: ratio of resolved vs total
  const clientAlerts = alerts.filter(a => campaigns.some(c => c.campaignId === a.campaign_id));
  const resolvedAlerts = clientAlerts.filter(a => a.status === "resolved").length;
  const alertHandlingScore = clientAlerts.length > 0 ? (resolvedAlerts / clientAlerts.length) * 100 : 80;

  // Frequência de revisões: inferred from momentum stability
  const stableMomentum = campaigns.filter(c =>
    Math.abs(c.momentumDelta) < 5
  ).length;
  const reviewScore = (stableMomentum / n) * 100;

  // Planejamento ativo: spend velocity close to 1.0
  const wellPaced = campaigns.filter(c =>
    c.spendVelocity >= 0.9 && c.spendVelocity <= 1.1
  ).length;
  const planningScore = (wellPaced / n) * 100;

  // Baixa concentração de risco
  const atRisk = campaigns.filter(c => c.currentMBEI < 85).length;
  const riskConcentration = Math.max(0, 100 - (atRisk / n) * 150);

  const governance = Math.round(alertHandlingScore * 0.25 + reviewScore * 0.25 + planningScore * 0.25 + riskConcentration * 0.25);

  // ── 4. Uso de Inteligência (20%) ──
  // Uso do Forecast: forecasts available and stable
  const clientForecasts = forecasts.filter(f => campaigns.some(c => c.campaignId === f.campaignId));
  const forecastUsage = clientForecasts.length > 0 ? Math.min(100, (clientForecasts.length / n) * 100) : 0;

  // Uso do Funnel Intelligence
  const clientFunnel = funnelInteractions.filter(fi => fi.clientId === clientId);
  const funnelUsage = clientFunnel.length > 0 ? Math.min(100, clientFunnel[0].liftSignalScore) : 30;

  // Uso de análises estruturais (elasticity + saturation)
  const clientElasticity = elasticities.filter(e => e.clientId === clientId);
  const clientSaturation = saturationAnalyses.filter(s => s.clientId === clientId);
  const analysisUsage = Math.min(100, (clientElasticity.length + clientSaturation.length) * 50);

  // Interação com recomendações
  const clientRecs = recommendations.filter(r => r.clientId === clientId);
  const acceptedRecs = clientRecs.filter(r => r.status === "accepted").length;
  const recInteraction = clientRecs.length > 0
    ? Math.min(100, (acceptedRecs / clientRecs.length) * 100 + 40)
    : 50;

  const intelligenceUsage = Math.round(forecastUsage * 0.3 + funnelUsage * 0.25 + analysisUsage * 0.25 + recInteraction * 0.2);

  return buildIMC(clientId, clientName, dataStructure, mediaStructure, governance, intelligenceUsage);
}

function buildIMC(
  clientId: string,
  clientName: string,
  dataStructure: number,
  mediaStructure: number,
  governance: number,
  intelligenceUsage: number
): IMCScore {
  const ds = Math.min(100, Math.max(0, dataStructure));
  const ms = Math.min(100, Math.max(0, mediaStructure));
  const gov = Math.min(100, Math.max(0, governance));
  const iu = Math.min(100, Math.max(0, intelligenceUsage));

  const score = Math.round(ds * 0.30 + ms * 0.25 + gov * 0.25 + iu * 0.20);
  const { classification, label } = classifyIMC(score);

  // Simulate trend (deterministic based on components)
  const avgComp = (ds + ms + gov + iu) / 4;
  const trendDelta = Math.round((score - avgComp) * 10) / 10;
  const trend: "up" | "down" | "stable" = trendDelta > 1 ? "up" : trendDelta < -1 ? "down" : "stable";

  // Identify gaps
  const gaps: string[] = [];
  const recs: string[] = [];

  if (ds < 60) {
    gaps.push("Estrutura de dados frágil");
    recs.push("Implementar tracking completo e padronizar UTMs em todas as campanhas");
  }
  if (ms < 60) {
    gaps.push("Estrutura de mídia incompleta");
    recs.push("Diversificar canais e garantir cobertura completa do funil");
  }
  if (gov < 60) {
    gaps.push("Governança operacional deficiente");
    recs.push("Estabelecer rotina de revisão e tratar alertas sistematicamente");
  }
  if (iu < 60) {
    gaps.push("Baixo uso de inteligência");
    recs.push("Adotar análises de forecast e elasticidade nas decisões táticas");
  }

  // AI Summary
  const weakest = [
    { name: "estrutura de dados", value: ds },
    { name: "estrutura de mídia", value: ms },
    { name: "governança operacional", value: gov },
    { name: "uso de inteligência", value: iu },
  ].sort((a, b) => a.value - b.value)[0];

  const aiSummary = score >= 85
    ? `Operação madura e bem estruturada. Todos os pilares acima do limiar de excelência.`
    : score >= 70
    ? `Operação estratégica. O pilar "${weakest.name}" (${weakest.value}) pode ser aprimorado para atingir nível avançado.`
    : score >= 55
    ? `Operação estruturada com oportunidades. Foco em "${weakest.name}" (${weakest.value}) para evolução consistente.`
    : `Operação básica. Priorize "${weakest.name}" (${weakest.value}) antes de escalar investimento.`;

  return {
    clientId,
    clientName,
    score,
    classification,
    classificationLabel: label,
    trend,
    trendDelta,
    components: {
      dataStructure: Math.round(ds),
      mediaStructure: Math.round(ms),
      governance: Math.round(gov),
      intelligenceUsage: Math.round(iu),
    },
    gaps,
    recommendations: recs,
    aiSummary,
  };
}

// ── Agency Aggregation ──

export function computeAgencyIMCSummary(clientScores: IMCScore[]): AgencyIMCSummary {
  if (clientScores.length === 0) {
    return {
      averageIMC: 0,
      classification: "basico",
      classificationLabel: "Básico",
      clientScores: [],
      clientsBelowThreshold: 0,
      distribution: { avancado: 0, estrategico: 0, estruturado: 0, basico: 0 },
    };
  }

  const avg = Math.round(clientScores.reduce((s, c) => s + c.score, 0) / clientScores.length);
  const { classification, label } = classifyIMC(avg);
  const belowThreshold = clientScores.filter(c => c.score < 60).length;

  const distribution: Record<string, number> = { avancado: 0, estrategico: 0, estruturado: 0, basico: 0 };
  clientScores.forEach(c => distribution[c.classification]++);

  return {
    averageIMC: avg,
    classification,
    classificationLabel: label,
    clientScores: clientScores.sort((a, b) => b.score - a.score),
    clientsBelowThreshold: belowThreshold,
    distribution: distribution as Record<any, number>,
  };
}
