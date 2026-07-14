import type {
  DataIngestionLog,
  DataValidationIssue,
  DataHealthIndicator,
  DataPipelineOverview,
  FeatureStoreMetric,
  StandardizedCampaignMetric,
} from "@/types/dataArchitecture";

// ── INGESTION LOGS ──

export const MOCK_INGESTION_LOGS: DataIngestionLog[] = [
  { id: "ing-001", tenant_id: "tenant-001", source_type: "api", platform: "meta_ads", records_processed: 4820, status: "success", error_message: null, ingestion_time: "2026-02-15T08:30:00Z" },
  { id: "ing-002", tenant_id: "tenant-001", source_type: "api", platform: "google_ads", records_processed: 3210, status: "success", error_message: null, ingestion_time: "2026-02-15T07:15:00Z" },
  { id: "ing-003", tenant_id: "tenant-001", source_type: "api", platform: "linkedin_ads", records_processed: 1456, status: "success", error_message: null, ingestion_time: "2026-02-15T06:00:00Z" },
  { id: "ing-004", tenant_id: "tenant-001", source_type: "api", platform: "google_ads", records_processed: 0, status: "failed", error_message: "Rate limit excedido — retry em 15min", ingestion_time: "2026-02-14T18:00:00Z" },
  { id: "ing-005", tenant_id: "tenant-001", source_type: "upload", platform: "uploaded_file", records_processed: 520, status: "success", error_message: null, ingestion_time: "2026-02-14T14:30:00Z" },
  { id: "ing-006", tenant_id: "tenant-001", source_type: "warehouse_sync", platform: "external_warehouse", records_processed: 12400, status: "partial", error_message: "3 registros com schema incompatível", ingestion_time: "2026-02-14T02:00:00Z" },
  { id: "ing-007", tenant_id: "tenant-001", source_type: "api", platform: "meta_ads", records_processed: 4650, status: "success", error_message: null, ingestion_time: "2026-02-14T08:30:00Z" },
  { id: "ing-008", tenant_id: "tenant-001", source_type: "api", platform: "dv360", records_processed: 0, status: "failed", error_message: "Credenciais expiradas", ingestion_time: "2026-02-13T08:00:00Z" },
  { id: "ing-009", tenant_id: "tenant-001", source_type: "api", platform: "tiktok_ads", records_processed: 890, status: "success", error_message: null, ingestion_time: "2026-02-13T07:00:00Z" },
  { id: "ing-010", tenant_id: "tenant-001", source_type: "api", platform: "meta_ads", records_processed: 4300, status: "success", error_message: null, ingestion_time: "2026-02-13T08:30:00Z" },
];

// ── VALIDATION ISSUES ──

export const MOCK_VALIDATION_ISSUES: DataValidationIssue[] = [
  { id: "val-001", tenant_id: "tenant-001", issue_type: "negative_spend", severity: "high", affected_record_count: 3, detected_at: "2026-02-15T09:00:00Z", resolved_flag: false },
  { id: "val-002", tenant_id: "tenant-001", issue_type: "duplicate_record", severity: "medium", affected_record_count: 12, detected_at: "2026-02-15T08:45:00Z", resolved_flag: false },
  { id: "val-003", tenant_id: "tenant-001", issue_type: "missing_required_field", severity: "high", affected_record_count: 7, detected_at: "2026-02-14T14:30:00Z", resolved_flag: true },
  { id: "val-004", tenant_id: "tenant-001", issue_type: "impossible_metric", severity: "critical", affected_record_count: 1, detected_at: "2026-02-14T08:30:00Z", resolved_flag: false },
  { id: "val-005", tenant_id: "tenant-001", issue_type: "date_inconsistency", severity: "low", affected_record_count: 5, detected_at: "2026-02-13T07:00:00Z", resolved_flag: true },
];

// ── DATA HEALTH (TENANT VIEW) ──

export const MOCK_DATA_HEALTH: DataHealthIndicator = {
  tenant_id: "tenant-001",
  last_sync: "2026-02-15T08:30:00Z",
  records_processed_24h: 9486,
  validation_errors: 4,
  missing_data_alerts: 2,
  freshness_status: "healthy",
  overall_status: "warning",
};

// ── DATA PIPELINE OVERVIEW (SUPER ADMIN) ──

export const MOCK_PIPELINE_OVERVIEW: DataPipelineOverview = {
  total_records_24h: 48200,
  total_records_7d: 312400,
  total_records_30d: 1284000,
  sync_failure_rate: 4.2,
  schema_mismatch_rate: 0.8,
  avg_ingestion_latency_ms: 1240,
  feature_store_update_time_ms: 3200,
  storage_growth_mb_30d: 2400,
};

// ── SAMPLE STANDARDIZED METRICS ──

export const MOCK_STANDARDIZED_METRICS: StandardizedCampaignMetric[] = [
  { tenant_id: "tenant-001", client_id: "c1", platform: "meta_ads", account_id: "act_123456789", campaign_id: "camp-001", date: "2026-02-14", media_spend: 12500, impressions: 845000, clicks: 18200, conversions: 342, revenue: 48600, cpm: 14.79, cpc: 0.69, ctr: 2.15, conversion_rate: 1.88, cost_per_conversion: 36.55, created_at: "2026-02-15T08:30:00Z" },
  { tenant_id: "tenant-001", client_id: "c1", platform: "google_ads", account_id: "123-456-7890", campaign_id: "camp-002", date: "2026-02-14", media_spend: 8900, impressions: 520000, clicks: 14300, conversions: 289, revenue: 38200, cpm: 17.12, cpc: 0.62, ctr: 2.75, conversion_rate: 2.02, cost_per_conversion: 30.80, created_at: "2026-02-15T07:15:00Z" },
  { tenant_id: "tenant-001", client_id: "c2", platform: "meta_ads", account_id: "act_987654321", campaign_id: "camp-003", date: "2026-02-14", media_spend: 6200, impressions: 380000, clicks: 9100, conversions: 156, revenue: 21800, cpm: 16.32, cpc: 0.68, ctr: 2.39, conversion_rate: 1.71, cost_per_conversion: 39.74, created_at: "2026-02-15T08:30:00Z" },
];

// ── SAMPLE FEATURE STORE METRICS ──

export const MOCK_FEATURE_STORE: FeatureStoreMetric[] = [
  { tenant_id: "tenant-001", client_id: "c1", campaign_id: "camp-001", funnel_stage: "conversion", mbe_index: 8.4, elasticity_score: 1.18, saturation_risk_score: 0.32, funnel_lift_signal: 0.72, margin_sensitivity_score: 1.4, momentum_score: 0.85, forecasted_cpa: 34.20, risk_score: 0.22, alert_density: 2.1, margin_percentage: 24.5, pattern_influence_score: 0.78, updated_at: "2026-02-15T08:35:00Z" },
  { tenant_id: "tenant-001", client_id: "c1", campaign_id: "camp-002", funnel_stage: "consideration", mbe_index: 7.1, elasticity_score: 0.92, saturation_risk_score: 0.58, funnel_lift_signal: 0.45, margin_sensitivity_score: 1.8, momentum_score: 0.62, forecasted_cpa: 42.10, risk_score: 0.48, alert_density: 3.8, margin_percentage: 18.2, pattern_influence_score: 0.54, updated_at: "2026-02-15T07:20:00Z" },
  { tenant_id: "tenant-001", client_id: "c2", campaign_id: "camp-003", funnel_stage: "awareness", mbe_index: 6.8, elasticity_score: 1.05, saturation_risk_score: 0.41, funnel_lift_signal: 0.38, margin_sensitivity_score: 1.2, momentum_score: 0.71, forecasted_cpa: 38.50, risk_score: 0.35, alert_density: 2.8, margin_percentage: 21.0, pattern_influence_score: 0.62, updated_at: "2026-02-15T08:35:00Z" },
];
