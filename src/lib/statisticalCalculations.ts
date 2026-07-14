import type { CampaignWithClient } from "@/data/multiClientData";
import type { AlertLog } from "@/types/alerts";
import type {
  BudgetElasticityAnalysis,
  ElasticityClassification,
  FrequencySaturationAnalysis,
  SaturationRiskLevel,
  FunnelInteractionAnalysis,
  MarginSensitivityAnalysis,
  ClientPerformanceCluster,
  EfficiencyProfile,
  MarginProfile,
  GrowthProfile,
} from "@/types/statisticalIntelligence";
import { inferFunnelStage } from "@/lib/aiCopilotEngine";
import { CLIENT_FINANCIALS } from "@/data/clientFinancials";

// ── 1. Budget Elasticity ──

function classifyElasticity(score: number): ElasticityClassification {
  if (score > 1.2) return "high";
  if (score >= 0.8) return "stable";
  if (score >= 0.5) return "weak";
  return "diminishing";
}

export function computeBudgetElasticity(campaigns: CampaignWithClient[]): BudgetElasticityAnalysis[] {
  return campaigns.map(c => {
    // Simulate spend variation from velocity deviation and sparkline trend
    const sparkline = c.sparklineData;
    const early = sparkline.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const late = sparkline.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const mbeiChange = early > 0 ? ((late - early) / early) * 100 : 0;

    // Spend variation proxy from velocity
    const spendVar = (c.spendVelocity - 1) * 100; // deviation from ideal
    const convVar = mbeiChange * 0.8; // proxy: MBEI change correlates with conversion change

    const elasticity = Math.abs(spendVar) > 0.5 ? convVar / Math.abs(spendVar) : 1.0;
    const classification = classifyElasticity(elasticity);

    return {
      tenantId: "default",
      clientId: c.clientId,
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      clientName: c.clientName,
      period: "7d",
      spendVariationPct: parseFloat(spendVar.toFixed(1)),
      conversionVariationPct: parseFloat(convVar.toFixed(1)),
      elasticityScore: parseFloat(elasticity.toFixed(2)),
      classification,
      diminishingReturnFlag: classification === "diminishing",
      optimalScaleRange: classification === "high" ? "+10-25%" : classification === "stable" ? "+5-15%" : "Não recomendado",
      createdAt: new Date().toISOString(),
    };
  });
}

// ── 2. Frequency Saturation ──

function classifySaturation(freq: number, cvrTrend: number, cpaUp: boolean): SaturationRiskLevel {
  if (freq > 6 && cvrTrend < -5 && cpaUp) return "critical";
  if (freq > 4.5 && cvrTrend < -3) return "high";
  if (freq > 3 && cvrTrend < -1) return "moderate";
  return "low";
}

export function computeFrequencySaturation(campaigns: CampaignWithClient[]): FrequencySaturationAnalysis[] {
  return campaigns.map(c => {
    // Simulate frequency from spend velocity and impressions proxy
    const baseFreq = 1.5 + (c.spendVelocity * 2.5);
    const avgFrequency = parseFloat(baseFreq.toFixed(1));

    // CVR trend from sparkline
    const sparkline = c.sparklineData;
    const earlyAvg = sparkline.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const lateAvg = sparkline.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const cvrTrend = earlyAvg > 0 ? ((lateAvg - earlyAvg) / earlyAvg) * 100 : 0;

    const cpaIncreasing = c.momentumDelta < -2;
    const saturation = classifySaturation(avgFrequency, cvrTrend, cpaIncreasing);

    return {
      tenantId: "default",
      clientId: c.clientId,
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      clientName: c.clientName,
      avgFrequency,
      conversionRateTrend: parseFloat(cvrTrend.toFixed(1)),
      saturationRiskLevel: saturation,
      efficiencyDropPoint: parseFloat((avgFrequency + 1.5).toFixed(1)),
      createdAt: new Date().toISOString(),
    };
  });
}

// ── 3. Funnel Interaction ──

export function computeFunnelInteraction(campaigns: CampaignWithClient[]): FunnelInteractionAnalysis[] {
  // Group by client
  const clientMap = new Map<string, CampaignWithClient[]>();
  campaigns.forEach(c => {
    const arr = clientMap.get(c.clientId) || [];
    arr.push(c);
    clientMap.set(c.clientId, arr);
  });

  const results: FunnelInteractionAnalysis[] = [];

  clientMap.forEach((camps, clientId) => {
    const byStage: Record<string, CampaignWithClient[]> = {};
    camps.forEach(c => {
      const s = inferFunnelStage(c);
      (byStage[s] = byStage[s] || []).push(c);
    });

    const awarenessSpend = (byStage.awareness || []).reduce((s, c) => s + c.spendVelocity * 10000, 0);
    const considerationSpend = (byStage.consideration || []).reduce((s, c) => s + c.spendVelocity * 8000, 0);
    const conversionSpend = (byStage.conversion || []).reduce((s, c) => s + c.spendVelocity * 15000, 0);

    // Correlation proxy: if awareness exists and conversion MBEI is strong, positive correlation
    const convMBEI = (byStage.conversion || []).reduce((s, c) => s + c.currentMBEI, 0) / Math.max((byStage.conversion || []).length, 1);
    const awCorr = awarenessSpend > 0 ? Math.min(0.95, (convMBEI / 130) * 0.8 + (awarenessSpend > 5000 ? 0.15 : 0)) : 0;
    const consCorr = considerationSpend > 0 ? Math.min(0.90, (convMBEI / 130) * 0.7 + (considerationSpend > 3000 ? 0.1 : 0)) : 0;

    const liftSignal = Math.round(((awCorr + consCorr) / 2) * 100);

    results.push({
      tenantId: "default",
      clientId,
      clientName: camps[0].clientName,
      awarenessSpend: Math.round(awarenessSpend),
      considerationSpend: Math.round(considerationSpend),
      conversionSpend: Math.round(conversionSpend),
      awarenessVsConversionCorrelation: parseFloat(awCorr.toFixed(2)),
      considerationVsConversionCorrelation: parseFloat(consCorr.toFixed(2)),
      liftSignalScore: liftSignal,
      createdAt: new Date().toISOString(),
    });
  });

  return results;
}

// ── 4. Margin Sensitivity ──

export function computeMarginSensitivity(campaigns: CampaignWithClient[]): MarginSensitivityAnalysis[] {
  return campaigns.map(c => {
    const spendChange = (c.spendVelocity - 1) * 100;
    // Margin change proxy: inverse relationship with overspending
    const marginChange = spendChange > 0 ? -spendChange * 0.6 : Math.abs(spendChange) * 0.3;
    const sensitivity = Math.abs(spendChange) > 0.5 ? Math.abs(marginChange / spendChange) : 0.5;

    return {
      tenantId: "default",
      clientId: c.clientId,
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      clientName: c.clientName,
      spendChangePct: parseFloat(spendChange.toFixed(1)),
      marginChangePct: parseFloat(marginChange.toFixed(1)),
      marginSensitivityScore: parseFloat(sensitivity.toFixed(2)),
      createdAt: new Date().toISOString(),
    };
  });
}

// ── 5. Client Performance Clustering ──

export function computeClientClusters(
  campaigns: CampaignWithClient[],
  alerts: AlertLog[]
): ClientPerformanceCluster[] {
  const clientMap = new Map<string, CampaignWithClient[]>();
  campaigns.forEach(c => {
    const arr = clientMap.get(c.clientId) || [];
    arr.push(c);
    clientMap.set(c.clientId, arr);
  });

  const results: ClientPerformanceCluster[] = [];

  clientMap.forEach((camps, clientId) => {
    const avgMBEI = Math.round(camps.reduce((s, c) => s + c.currentMBEI, 0) / camps.length);
    const clientAlerts = alerts.filter(a => camps.some(c => c.campaignId === a.campaign_id));
    const alertDensity = camps.length > 0 ? clientAlerts.length / camps.length : 0;

    const elasticities = computeBudgetElasticity(camps);
    const elasticityAvg = elasticities.length > 0
      ? elasticities.reduce((s, e) => s + e.elasticityScore, 0) / elasticities.length
      : 1;

    const fin = CLIENT_FINANCIALS.find(f => f.client_id === clientId);
    const marginPct = fin ? (fin.percentage_fee > 0 ? fin.percentage_fee : (fin.fixed_fee_value / Math.max(fin.estimated_operational_cost, 1)) * 100) : 15;

    // Momentum stability: std deviation of momentumDeltas
    const deltas = camps.map(c => c.momentumDelta);
    const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length;
    const variance = deltas.reduce((s, d) => s + Math.pow(d - avgDelta, 2), 0) / deltas.length;
    const stability = Math.max(0, 100 - Math.sqrt(variance) * 10);

    // Classify
    const efficiencyProfile: EfficiencyProfile =
      avgMBEI >= 115 ? "High" :
      avgMBEI >= 95 ? "Stable" :
      alertDensity > 1.5 ? "Risky" : "Volatile";

    const marginProfile: MarginProfile =
      marginPct >= 25 ? "High" :
      marginPct >= 15 ? "Medium" : "Low";

    const growthProfile: GrowthProfile =
      elasticityAvg > 1.2 ? "Scalable" :
      elasticityAvg >= 0.5 ? "Limited" : "Saturated";

    results.push({
      tenantId: "default",
      clientId,
      clientName: camps[0].clientName,
      efficiencyProfile,
      marginProfile,
      growthProfile,
      avgMBEI,
      elasticityAvg: parseFloat(elasticityAvg.toFixed(2)),
      marginPct: parseFloat(marginPct.toFixed(1)),
      alertDensity: parseFloat(alertDensity.toFixed(2)),
      momentumStability: parseFloat(stability.toFixed(1)),
      createdAt: new Date().toISOString(),
    });
  });

  return results;
}
