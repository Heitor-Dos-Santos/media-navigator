// Platform Governance Types — Super Admin Layer

export interface PlatformAgency {
  agency_id: string;
  name: string;
  plan: "starter" | "growth" | "pro" | "enterprise";
  active: boolean;
  total_clients: number;
  total_users: number;
  ai_enabled: boolean;
  pattern_engine_enabled: boolean;
  api_usage: number;
  last_activity: string;
}

/** @deprecated Use PlatformAgency */
export type PlatformTenant = PlatformAgency;

export interface PlatformUsageOverview {
  agency_id: string;
  agency_name: string;
  api_calls: number;
  ai_executions: number;
  forecast_runs: number;
  recommendation_runs: number;
  storage_usage_mb: number;
  last_updated: string;
}

export interface ThresholdConfig {
  id: string;
  name: string;
  description: string;
  category: "elasticity" | "saturation" | "funnel" | "margin" | "pattern";
  current_value: number;
  default_value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface PatternOversight {
  pattern_id: string;
  pattern_type: string;
  confidence_score: number;
  agency_scope: "global" | "specific";
  data_points: number;
  active: boolean;
  drift_indicator: "stable" | "minor" | "moderate" | "critical";
  agency_name?: string;
}

export interface ModelDriftMonitoring {
  model_type: string;
  drift_score: number;
  anomaly_rate: number;
  false_positive_rate: number;
  confidence_decay: number;
  last_checked_at: string;
  health_score: number;
  risk_level: "low" | "moderate" | "high" | "critical";
}

export interface FeatureFlag {
  feature_name: string;
  display_name: string;
  enabled_globally: boolean;
  enabled_for_plan: string[];
  enabled_for_specific_agencies: string[];
  beta_flag: boolean;
  created_at: string;
}

export interface GlobalAnonymizedMetrics {
  avg_mbei: number;
  avg_elasticity: number;
  avg_margin_pct: number;
  alert_density_avg: number;
  saturation_risk_distribution: Record<string, number>;
  funnel_lift_distribution: Record<string, number>;
}

export interface AIPerformanceMetrics {
  total_insights_generated: number;
  avg_confidence_score: number;
  most_common_insight_types: { type: string; count: number }[];
  anomaly_detection_accuracy: number;
  forecast_accuracy_pct: number;
}

export interface PlatformAuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action_type: "threshold_change" | "feature_toggle" | "agency_suspension" | "pattern_deactivation" | "ai_parameter_change" | "plan_change";
  entity_affected: string;
  old_value: string;
  new_value: string;
  timestamp: string;
}
