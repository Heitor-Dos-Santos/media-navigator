// ── Statistical Intelligence Types (Phase 11.2) ──

// ── Budget Elasticity ──

export type ElasticityClassification = "high" | "stable" | "weak" | "diminishing";

export interface BudgetElasticityAnalysis {
  tenantId: string;
  clientId: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  period: string;
  spendVariationPct: number;
  conversionVariationPct: number;
  elasticityScore: number;
  classification: ElasticityClassification;
  diminishingReturnFlag: boolean;
  optimalScaleRange: string;
  createdAt: string;
}

export const ELASTICITY_META: Record<ElasticityClassification, { label: string; color: string; bg: string }> = {
  high: { label: "Alta Elasticidade", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  stable: { label: "Estável", color: "text-blue-500", bg: "bg-blue-500/10" },
  weak: { label: "Elasticidade Fraca", color: "text-amber-500", bg: "bg-amber-500/10" },
  diminishing: { label: "Retorno Decrescente", color: "text-red-500", bg: "bg-red-500/10" },
};

// ── Frequency Saturation ──

export type SaturationRiskLevel = "low" | "moderate" | "high" | "critical";

export interface FrequencySaturationAnalysis {
  tenantId: string;
  clientId: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  avgFrequency: number;
  conversionRateTrend: number; // negative = declining
  saturationRiskLevel: SaturationRiskLevel;
  efficiencyDropPoint: number;
  createdAt: string;
}

export const SATURATION_META: Record<SaturationRiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: "Baixo", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  moderate: { label: "Moderado", color: "text-amber-500", bg: "bg-amber-500/10" },
  high: { label: "Alto", color: "text-orange-500", bg: "bg-orange-500/10" },
  critical: { label: "Crítico", color: "text-red-500", bg: "bg-red-500/10" },
};

// ── Funnel Interaction ──

export interface FunnelInteractionAnalysis {
  tenantId: string;
  clientId: string;
  clientName: string;
  awarenessSpend: number;
  considerationSpend: number;
  conversionSpend: number;
  awarenessVsConversionCorrelation: number;
  considerationVsConversionCorrelation: number;
  liftSignalScore: number; // 0-100
  createdAt: string;
}

// ── Margin Sensitivity ──

export interface MarginSensitivityAnalysis {
  tenantId: string;
  clientId: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  spendChangePct: number;
  marginChangePct: number;
  marginSensitivityScore: number;
  createdAt: string;
}

// ── Client Performance Clustering ──

export type EfficiencyProfile = "High" | "Stable" | "Volatile" | "Risky";
export type MarginProfile = "High" | "Medium" | "Low";
export type GrowthProfile = "Scalable" | "Limited" | "Saturated";

export interface ClientPerformanceCluster {
  tenantId: string;
  clientId: string;
  clientName: string;
  efficiencyProfile: EfficiencyProfile;
  marginProfile: MarginProfile;
  growthProfile: GrowthProfile;
  avgMBEI: number;
  elasticityAvg: number;
  marginPct: number;
  alertDensity: number;
  momentumStability: number;
  createdAt: string;
}

export const EFFICIENCY_PROFILE_META: Record<EfficiencyProfile, { color: string; bg: string }> = {
  High: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  Stable: { color: "text-blue-500", bg: "bg-blue-500/10" },
  Volatile: { color: "text-amber-500", bg: "bg-amber-500/10" },
  Risky: { color: "text-red-500", bg: "bg-red-500/10" },
};

export const MARGIN_PROFILE_META: Record<MarginProfile, { color: string; bg: string }> = {
  High: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  Medium: { color: "text-blue-500", bg: "bg-blue-500/10" },
  Low: { color: "text-red-500", bg: "bg-red-500/10" },
};

export const GROWTH_PROFILE_META: Record<GrowthProfile, { color: string; bg: string }> = {
  Scalable: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  Limited: { color: "text-amber-500", bg: "bg-amber-500/10" },
  Saturated: { color: "text-red-500", bg: "bg-red-500/10" },
};
