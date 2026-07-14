/** Snapshot model for future persistence (efficiency_snapshots table) */
export interface EfficiencySnapshot {
  date: string;
  campaign_id: string;
  mbe_index: number;
  rolling_cpa: number;
  rolling_conversion_rate: number;
  spend_velocity: number;
  efficiency_momentum: MomentumCategory;
}

export type MomentumCategory =
  | "strong_positive"
  | "positive"
  | "neutral"
  | "negative"
  | "strong_negative";

export interface CampaignTrendData {
  campaignId: string;
  campaignName: string;
  platform: string;
  currentMBEI: number;
  avgMBEI7d: number;
  momentum: MomentumCategory;
  momentumDelta: number;
  rollingCPA: number;
  rollingConversionRate: number;
  spendVelocity: number;
  sparklineData: number[]; // 7 data points for mini chart
}

export interface AgencyAggregation {
  avgMBEI7d: number;
  momentum: MomentumCategory;
  momentumDelta: number;
  overspendingCount: number;
  underspendingCount: number;
  totalCampaigns: number;
}
