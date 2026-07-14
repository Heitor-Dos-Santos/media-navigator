// ── Data Architecture Types — Warehouse, Ingestion, Feature Store ──

export type SourcePlatform = "meta_ads" | "google_ads" | "dv360" | "linkedin_ads" | "tiktok_ads" | "uploaded_file" | "external_warehouse";
export type IngestionSourceType = "api" | "upload" | "warehouse_sync";
export type IngestionStatus = "success" | "failed" | "partial";
export type ValidationSeverity = "low" | "medium" | "high" | "critical";
export type DataHealthStatus = "healthy" | "warning" | "critical";

// ── RAW DATA LAYER ──

export interface RawDataRecord {
  id: string;
  tenant_id: string;
  source_platform: SourcePlatform;
  account_id: string | null;
  ingestion_timestamp: string;
  raw_payload_json: Record<string, unknown>;
}

// ── STANDARDIZED DATA LAYER ──

export interface StandardizedCampaignMetric {
  tenant_id: string;
  client_id: string;
  platform: SourcePlatform;
  account_id: string;
  campaign_id: string;
  date: string;
  media_spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cpm: number;
  cpc: number;
  ctr: number;
  conversion_rate: number;
  cost_per_conversion: number;
  created_at: string;
}

// ── FEATURE STORE (INTELLIGENCE LAYER) ──

export interface FeatureStoreMetric {
  tenant_id: string;
  client_id: string;
  campaign_id: string;
  funnel_stage: string;
  mbe_index: number;
  elasticity_score: number;
  saturation_risk_score: number;
  funnel_lift_signal: number;
  margin_sensitivity_score: number;
  momentum_score: number;
  forecasted_cpa: number;
  risk_score: number;
  alert_density: number;
  margin_percentage: number;
  pattern_influence_score: number;
  updated_at: string;
  // Versioning fields (Phase 4)
  feature_version?: string;
  computation_version?: string;
  model_dependency_reference?: string;
}

// ── INGESTION PIPELINE ──

export interface DataIngestionLog {
  id: string;
  tenant_id: string;
  source_type: IngestionSourceType;
  platform: SourcePlatform;
  records_processed: number;
  status: IngestionStatus;
  error_message: string | null;
  ingestion_time: string;
}

// ── DATA VALIDATION ──

export type ValidationIssueType =
  | "missing_required_field"
  | "negative_spend"
  | "impossible_metric"
  | "date_inconsistency"
  | "duplicate_record";

export interface DataValidationIssue {
  id: string;
  tenant_id: string;
  issue_type: ValidationIssueType;
  severity: ValidationSeverity;
  affected_record_count: number;
  detected_at: string;
  resolved_flag: boolean;
}

// ── DATA HEALTH (TENANT VIEW) ──

export interface DataHealthIndicator {
  tenant_id: string;
  last_sync: string;
  records_processed_24h: number;
  validation_errors: number;
  missing_data_alerts: number;
  freshness_status: DataHealthStatus;
  overall_status: DataHealthStatus;
}

// ── DATA PIPELINE MONITORING (SUPER ADMIN) ──

export interface DataPipelineOverview {
  total_records_24h: number;
  total_records_7d: number;
  total_records_30d: number;
  sync_failure_rate: number;
  schema_mismatch_rate: number;
  avg_ingestion_latency_ms: number;
  feature_store_update_time_ms: number;
  storage_growth_mb_30d: number;
}

export const VALIDATION_ISSUE_LABELS: Record<ValidationIssueType, string> = {
  missing_required_field: "Campo obrigatório ausente",
  negative_spend: "Investimento negativo",
  impossible_metric: "Métrica impossível",
  date_inconsistency: "Inconsistência de data",
  duplicate_record: "Registro duplicado",
};

export const SEVERITY_COLORS: Record<ValidationSeverity, string> = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const HEALTH_STATUS_CONFIG: Record<DataHealthStatus, { label: string; color: string; bg: string }> = {
  healthy: { label: "Saudável", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  warning: { label: "Atenção", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  critical: { label: "Crítico", color: "text-red-400", bg: "bg-red-500/20" },
};
