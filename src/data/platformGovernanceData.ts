import type {
  PlatformAgency, PlatformUsageOverview, ThresholdConfig, PatternOversight,
  ModelDriftMonitoring, FeatureFlag, GlobalAnonymizedMetrics, AIPerformanceMetrics,
  PlatformAuditLog,
} from "@/types/platformGovernance";

export const MOCK_AGENCIES: PlatformAgency[] = [
  { agency_id: "a1", name: "Redmedia", plan: "enterprise", active: true, total_clients: 42, total_users: 18, ai_enabled: true, pattern_engine_enabled: true, api_usage: 84200, last_activity: "2026-02-15T10:30:00Z" },
  { agency_id: "a2", name: "Agência Pulse", plan: "pro", active: true, total_clients: 28, total_users: 12, ai_enabled: true, pattern_engine_enabled: true, api_usage: 52100, last_activity: "2026-02-15T09:15:00Z" },
  { agency_id: "a3", name: "MídiaMax", plan: "growth", active: true, total_clients: 15, total_users: 6, ai_enabled: false, pattern_engine_enabled: false, api_usage: 18400, last_activity: "2026-02-14T17:45:00Z" },
  { agency_id: "a4", name: "AdVantage", plan: "starter", active: true, total_clients: 5, total_users: 3, ai_enabled: false, pattern_engine_enabled: false, api_usage: 4200, last_activity: "2026-02-13T14:00:00Z" },
  { agency_id: "a5", name: "Digital First", plan: "pro", active: false, total_clients: 20, total_users: 8, ai_enabled: true, pattern_engine_enabled: false, api_usage: 0, last_activity: "2026-01-28T11:00:00Z" },
  { agency_id: "a6", name: "Connect Media", plan: "growth", active: true, total_clients: 11, total_users: 5, ai_enabled: false, pattern_engine_enabled: false, api_usage: 12300, last_activity: "2026-02-15T08:00:00Z" },
];

/** @deprecated Use MOCK_AGENCIES */
export const MOCK_TENANTS = MOCK_AGENCIES;

export const MOCK_USAGE: PlatformUsageOverview[] = [
  { agency_id: "a1", agency_name: "Redmedia", api_calls: 84200, ai_executions: 1240, forecast_runs: 320, recommendation_runs: 580, storage_usage_mb: 2400, last_updated: "2026-02-15T10:30:00Z" },
  { agency_id: "a2", agency_name: "Agência Pulse", api_calls: 52100, ai_executions: 890, forecast_runs: 210, recommendation_runs: 410, storage_usage_mb: 1800, last_updated: "2026-02-15T09:15:00Z" },
  { agency_id: "a3", agency_name: "MídiaMax", api_calls: 18400, ai_executions: 0, forecast_runs: 85, recommendation_runs: 120, storage_usage_mb: 650, last_updated: "2026-02-14T17:45:00Z" },
  { agency_id: "a4", agency_name: "AdVantage", api_calls: 4200, ai_executions: 0, forecast_runs: 12, recommendation_runs: 28, storage_usage_mb: 120, last_updated: "2026-02-13T14:00:00Z" },
  { agency_id: "a6", agency_name: "Connect Media", api_calls: 12300, ai_executions: 0, forecast_runs: 45, recommendation_runs: 90, storage_usage_mb: 380, last_updated: "2026-02-15T08:00:00Z" },
];

export const MOCK_THRESHOLDS: ThresholdConfig[] = [
  { id: "th1", name: "Elasticity — High Threshold", description: "Above this value campaigns are classified as highly elastic", category: "elasticity", current_value: 1.2, default_value: 1.2, min: 0.5, max: 3.0, step: 0.1, unit: "x" },
  { id: "th2", name: "Elasticity — Weak Threshold", description: "Below this value elasticity is considered weak", category: "elasticity", current_value: 0.8, default_value: 0.8, min: 0.1, max: 1.5, step: 0.1, unit: "x" },
  { id: "th3", name: "Elasticity — Diminishing Returns", description: "Below this value campaigns show diminishing returns", category: "elasticity", current_value: 0.5, default_value: 0.5, min: 0.1, max: 1.0, step: 0.05, unit: "x" },
  { id: "th4", name: "Saturation — Risk Sensitivity", description: "Frequency multiplier that triggers saturation risk", category: "saturation", current_value: 3.5, default_value: 3.5, min: 1.0, max: 10.0, step: 0.5, unit: "freq" },
  { id: "th5", name: "Funnel Lift — Minimum Confidence", description: "Minimum correlation confidence for lift signals", category: "funnel", current_value: 0.6, default_value: 0.6, min: 0.1, max: 1.0, step: 0.05, unit: "%" },
  { id: "th6", name: "Margin — Sensitivity Threshold", description: "Sensitivity score that triggers margin alerts", category: "margin", current_value: 1.5, default_value: 1.5, min: 0.5, max: 5.0, step: 0.1, unit: "x" },
  { id: "th7", name: "Pattern — Minimum Confidence", description: "Minimum confidence score for active patterns", category: "pattern", current_value: 0.7, default_value: 0.7, min: 0.3, max: 1.0, step: 0.05, unit: "%" },
];

export const MOCK_PATTERNS: PatternOversight[] = [
  { pattern_id: "p1", pattern_type: "Budget Elasticity", confidence_score: 0.92, agency_scope: "global", data_points: 1240, active: true, drift_indicator: "stable" },
  { pattern_id: "p2", pattern_type: "Frequency Saturation", confidence_score: 0.87, agency_scope: "global", data_points: 890, active: true, drift_indicator: "minor" },
  { pattern_id: "p3", pattern_type: "Funnel Interaction", confidence_score: 0.74, agency_scope: "global", data_points: 420, active: true, drift_indicator: "stable" },
  { pattern_id: "p4", pattern_type: "Margin Sensitivity", confidence_score: 0.81, agency_scope: "specific", data_points: 310, active: true, drift_indicator: "moderate", agency_name: "Redmedia" },
  { pattern_id: "p5", pattern_type: "Client Clustering", confidence_score: 0.68, agency_scope: "global", data_points: 560, active: true, drift_indicator: "minor" },
  { pattern_id: "p6", pattern_type: "Seasonal Spend", confidence_score: 0.45, agency_scope: "specific", data_points: 85, active: false, drift_indicator: "critical", agency_name: "MídiaMax" },
];

export const MOCK_DRIFT: ModelDriftMonitoring[] = [
  { model_type: "Budget Elasticity", drift_score: 0.04, anomaly_rate: 0.02, false_positive_rate: 0.03, confidence_decay: 0.01, last_checked_at: "2026-02-15T10:00:00Z", health_score: 96, risk_level: "low" },
  { model_type: "Frequency Saturation", drift_score: 0.12, anomaly_rate: 0.05, false_positive_rate: 0.08, confidence_decay: 0.04, last_checked_at: "2026-02-15T10:00:00Z", health_score: 84, risk_level: "moderate" },
  { model_type: "Funnel Interaction", drift_score: 0.07, anomaly_rate: 0.03, false_positive_rate: 0.05, confidence_decay: 0.02, last_checked_at: "2026-02-15T10:00:00Z", health_score: 91, risk_level: "low" },
  { model_type: "Margin Sensitivity", drift_score: 0.18, anomaly_rate: 0.09, false_positive_rate: 0.11, confidence_decay: 0.07, last_checked_at: "2026-02-15T09:00:00Z", health_score: 72, risk_level: "high" },
  { model_type: "Client Clustering", drift_score: 0.09, anomaly_rate: 0.04, false_positive_rate: 0.06, confidence_decay: 0.03, last_checked_at: "2026-02-15T10:00:00Z", health_score: 88, risk_level: "low" },
];

export const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  { feature_name: "pattern_learning", display_name: "Pattern Learning Engine", enabled_globally: false, enabled_for_plan: ["enterprise"], enabled_for_specific_agencies: ["a1"], beta_flag: true, created_at: "2026-01-15T00:00:00Z" },
  { feature_name: "advanced_ai", display_name: "Advanced AI Copilot", enabled_globally: false, enabled_for_plan: ["enterprise", "pro"], enabled_for_specific_agencies: [], beta_flag: false, created_at: "2026-01-01T00:00:00Z" },
  { feature_name: "statistical_intelligence", display_name: "Statistical Intelligence", enabled_globally: true, enabled_for_plan: [], enabled_for_specific_agencies: [], beta_flag: false, created_at: "2025-12-01T00:00:00Z" },
  { feature_name: "funnel_interaction", display_name: "Funnel Interaction Model", enabled_globally: false, enabled_for_plan: ["enterprise", "pro"], enabled_for_specific_agencies: ["a6"], beta_flag: true, created_at: "2026-02-01T00:00:00Z" },
  { feature_name: "executive_narrative", display_name: "Executive Narrative AI", enabled_globally: false, enabled_for_plan: ["enterprise"], enabled_for_specific_agencies: [], beta_flag: false, created_at: "2026-01-20T00:00:00Z" },
  { feature_name: "margin_sensitivity", display_name: "Margin Sensitivity Model", enabled_globally: true, enabled_for_plan: [], enabled_for_specific_agencies: [], beta_flag: false, created_at: "2025-11-15T00:00:00Z" },
];

export const MOCK_GLOBAL_METRICS: GlobalAnonymizedMetrics = {
  avg_mbei: 7.4,
  avg_elasticity: 1.08,
  avg_margin_pct: 22.5,
  alert_density_avg: 3.2,
  saturation_risk_distribution: { Low: 45, Moderate: 30, High: 18, Critical: 7 },
  funnel_lift_distribution: { "0-20": 12, "21-40": 18, "41-60": 35, "61-80": 25, "81-100": 10 },
};

export const MOCK_AI_PERFORMANCE: AIPerformanceMetrics = {
  total_insights_generated: 4820,
  avg_confidence_score: 0.78,
  most_common_insight_types: [
    { type: "Budget Optimization", count: 1240 },
    { type: "Audience Saturation", count: 980 },
    { type: "Creative Fatigue", count: 760 },
    { type: "Funnel Imbalance", count: 640 },
    { type: "Margin Risk", count: 520 },
    { type: "Scaling Opportunity", count: 680 },
  ],
  anomaly_detection_accuracy: 84.2,
  forecast_accuracy_pct: 76.8,
};

export const MOCK_AUDIT_LOGS: PlatformAuditLog[] = [
  { id: "a1", user_id: "sa1", user_name: "Platform Admin", action_type: "threshold_change", entity_affected: "Elasticity — High Threshold", old_value: "1.1", new_value: "1.2", timestamp: "2026-02-15T09:30:00Z" },
  { id: "a2", user_id: "sa1", user_name: "Platform Admin", action_type: "feature_toggle", entity_affected: "Pattern Learning Engine", old_value: "disabled", new_value: "enabled for Redmedia", timestamp: "2026-02-14T16:00:00Z" },
  { id: "a3", user_id: "sa1", user_name: "Platform Admin", action_type: "agency_suspension", entity_affected: "Digital First", old_value: "active", new_value: "suspended", timestamp: "2026-01-28T11:00:00Z" },
  { id: "a4", user_id: "sa1", user_name: "Platform Admin", action_type: "pattern_deactivation", entity_affected: "Seasonal Spend (MídiaMax)", old_value: "active", new_value: "deactivated", timestamp: "2026-02-10T14:20:00Z" },
  { id: "a5", user_id: "sa1", user_name: "Platform Admin", action_type: "plan_change", entity_affected: "Agência Pulse", old_value: "growth", new_value: "pro", timestamp: "2026-02-05T10:00:00Z" },
  { id: "a6", user_id: "sa1", user_name: "Platform Admin", action_type: "ai_parameter_change", entity_affected: "Pattern Minimum Confidence", old_value: "0.65", new_value: "0.70", timestamp: "2026-02-12T08:45:00Z" },
  { id: "a7", user_id: "sa1", user_name: "Platform Admin", action_type: "feature_toggle", entity_affected: "Funnel Interaction Model", old_value: "disabled", new_value: "beta for Connect Media", timestamp: "2026-02-13T15:30:00Z" },
];
