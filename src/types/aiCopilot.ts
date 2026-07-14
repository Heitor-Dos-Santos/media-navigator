// ── Funnel Stage ──

export type FunnelStage = "awareness" | "consideration" | "conversion" | "retention";

export const FUNNEL_STAGES: FunnelStage[] = ["awareness", "consideration", "conversion", "retention"];

export const FUNNEL_STAGE_META: Record<FunnelStage, { label: string; color: string; bg: string; icon: string }> = {
  awareness: { label: "Consciência", color: "text-blue-500", bg: "bg-blue-500/10", icon: "Eye" },
  consideration: { label: "Consideração", color: "text-amber-500", bg: "bg-amber-500/10", icon: "Search" },
  conversion: { label: "Conversão", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: "Target" },
  retention: { label: "Retenção", color: "text-purple-500", bg: "bg-purple-500/10", icon: "Heart" },
};

// ── Funnel-Aware Metric Prioritization ──

export interface FunnelMetricConfig {
  primaryMetrics: string[];
  aiFocus: string[];
}

export const FUNNEL_METRIC_PRIORITY: Record<FunnelStage, FunnelMetricConfig> = {
  awareness: {
    primaryMetrics: ["Reach", "Frequency", "CPM", "Video Completion Rate", "Engagement Rate", "Assisted Conversions Trend", "Spend Velocity"],
    aiFocus: ["Saturation risk", "Frequency inflation", "Awareness efficiency vs downstream lift signals"],
  },
  consideration: {
    primaryMetrics: ["CTR", "Landing Page View Rate", "CPC", "Engagement Depth", "Bounce Rate", "Traffic Quality Proxy"],
    aiFocus: ["Traffic quality", "Engagement deterioration", "Funnel leakage risk"],
  },
  conversion: {
    primaryMetrics: ["CPA", "Conversion Rate", "ROAS", "MBEI", "Margin %", "Forecast Risk", "Alert Density"],
    aiFocus: ["Efficiency decay", "Margin erosion", "Scale vs risk tradeoff"],
  },
  retention: {
    primaryMetrics: ["Repeat Conversion Rate", "Revenue per User", "Cost per Returning User", "LTV Trend", "Retention Efficiency Index"],
    aiFocus: ["Customer value expansion", "Retention cost inflation", "Profit sustainability"],
  },
};

// ── AI Context Snapshot ──

export interface AIContextSnapshot {
  tenantId: string;
  clientId: string;
  campaignId: string;
  funnelStage: FunnelStage;
  structuredMetrics: {
    mbei: number;
    cpa: number;
    conversionRate: number;
    spendVelocity: number;
    momentum: string;
    momentumDelta: number;
  };
  anomalyFlags: string[];
  trendSummary: string;
  forecastSummary: string;
  marginSummary: string;
  // Statistical intelligence context (Phase 11.2)
  statisticalContext?: {
    elasticityScore?: number;
    elasticityClassification?: string;
    saturationRiskLevel?: string;
    funnelLiftSignal?: number;
    marginSensitivity?: number;
    clusterProfile?: string;
  };
  // Pattern Learning context (Phase 11.3)
  patternContext?: {
    activePatterns?: { type: string; description: string; confidence: number; impact: string }[];
    patternInfluenceScore?: number;
    patternRiskSignals?: string[];
  };
  createdAt: string;
}

// ── AI Generated Insight ──

export type InsightType = "daily" | "weekly" | "anomaly" | "forecast" | "margin";

export const INSIGHT_TYPE_META: Record<InsightType, { label: string; color: string; bg: string }> = {
  daily: { label: "Resumo Diário", color: "text-primary", bg: "bg-primary/10" },
  weekly: { label: "Estratégico Semanal", color: "text-blue-500", bg: "bg-blue-500/10" },
  anomaly: { label: "Anomalia", color: "text-status-error", bg: "bg-status-error/10" },
  forecast: { label: "Risco Forecast", color: "text-amber-500", bg: "bg-amber-500/10" },
  margin: { label: "Impacto Margem", color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

export interface AIGeneratedInsight {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  campaignId: string;
  campaignName: string;
  funnelStage: FunnelStage;
  insightType: InsightType;
  generatedText: string;
  confidenceScore: number; // 0-100
  createdAt: string;
}
