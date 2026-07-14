// Pattern Learning Engine — Types

export type PatternType = "frequency" | "elasticity" | "funnel" | "creative" | "margin" | "risk";
export type PatternScope = "tenant" | "global_anonymized";
export type ImpactLevel = "low" | "medium" | "high";

export interface LearnedPattern {
  pattern_id: string;
  tenant_id: string | null;
  pattern_type: PatternType;
  pattern_scope: PatternScope;
  pattern_description: string;
  metric_threshold: number;
  supporting_data_points: number;
  statistical_strength_score: number;
  confidence_score: number; // 0–100
  first_detected_at: string;
  last_updated_at: string;
  active_flag: boolean;
  experimental_flag: boolean;
  impact_level: ImpactLevel;
  strategic_interpretation: string;
}

export interface PatternDetectionInput {
  campaigns: PatternCampaignSnapshot[];
  tenantId: string;
  clientId: string;
}

export interface PatternCampaignSnapshot {
  campaignId: string;
  frequency: number;
  frequencyPrev: number;
  conversionRate: number;
  conversionRatePrev: number;
  cpa: number;
  cpaPrev: number;
  ctr: number;
  ctrPrev: number;
  spend: number;
  spendPrev: number;
  conversions: number;
  conversionsPrev: number;
  margin: number;
  marginPrev: number;
  elasticityScore: number;
  awarenessSpend: number;
  conversionVolume: number;
  cpaTrend: "up" | "down" | "stable";
}

export interface ConfidenceFactors {
  sampleSize: number;
  repetitionCount: number;
  stabilityScore: number; // 0-1
  varianceLevel: number;  // lower is better
  driftImpact: number;    // 0-1, lower is better
}

export const PATTERN_TYPE_META: Record<PatternType, { label: string; color: string; bg: string; icon: string }> = {
  frequency: { label: "Frequency Behavior", color: "text-orange-400", bg: "bg-orange-500/10", icon: "Radio" },
  elasticity: { label: "Elasticity Profile", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "TrendingUp" },
  funnel: { label: "Funnel Interaction", color: "text-blue-400", bg: "bg-blue-500/10", icon: "Layers" },
  creative: { label: "Creative Sustainability", color: "text-violet-400", bg: "bg-violet-500/10", icon: "Palette" },
  margin: { label: "Margin Sensitivity", color: "text-red-400", bg: "bg-red-500/10", icon: "AlertTriangle" },
  risk: { label: "Risk Signal", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "ShieldAlert" },
};
