import type {
  TablePartitionConfig, FeatureStoreVersion, MaterializedViewConfig,
  PipelineJob, SystemPerformanceMonitor, SecurityAuditEvent, SecurityConfig,
  InfrastructureCostMonitor, ScalabilityHealthCheck, MLTrainingDatasetSnapshot,
} from "@/types/infrastructure";

// 1️⃣ PARTITIONING CONFIG
export const MOCK_PARTITION_CONFIGS: TablePartitionConfig[] = [
  { table_name: "standardized_campaign_metrics", partition_by: "date", cluster_by: ["tenant_id", "campaign_id", "client_id"], enabled: true, last_optimized: "2026-02-15T04:00:00Z", estimated_cost_reduction_pct: 42 },
  { table_name: "feature_store_metrics", partition_by: "date", cluster_by: ["tenant_id", "campaign_id"], enabled: true, last_optimized: "2026-02-15T04:00:00Z", estimated_cost_reduction_pct: 38 },
  { table_name: "ingestion_log", partition_by: "date", cluster_by: ["tenant_id"], enabled: true, last_optimized: "2026-02-14T04:00:00Z", estimated_cost_reduction_pct: 35 },
  { table_name: "statistical_models", partition_by: "date", cluster_by: ["tenant_id", "client_id"], enabled: true, last_optimized: "2026-02-14T04:00:00Z", estimated_cost_reduction_pct: 28 },
  { table_name: "pattern_models", partition_by: "date", cluster_by: ["tenant_id", "campaign_id"], enabled: true, last_optimized: "2026-02-13T04:00:00Z", estimated_cost_reduction_pct: 31 },
  { table_name: "security_audit_events", partition_by: "date", cluster_by: ["tenant_id"], enabled: false, last_optimized: "2026-02-10T04:00:00Z", estimated_cost_reduction_pct: 15 },
];

// 2️⃣ FEATURE STORE VERSIONS
export const MOCK_FS_VERSIONS: FeatureStoreVersion[] = [
  { version_id: "fsv-003", change_description: "Adicionado pattern_influence_score e margin_sensitivity_score", created_at: "2026-02-10T00:00:00Z", activated_flag: true, computation_version: "v3.2", model_dependency_reference: "elasticity_v2, pattern_v1.5", fields_added: ["pattern_influence_score", "margin_sensitivity_score"], fields_deprecated: [] },
  { version_id: "fsv-002", change_description: "Adicionado momentum_score e forecasted_cpa", created_at: "2026-01-20T00:00:00Z", activated_flag: false, computation_version: "v3.0", model_dependency_reference: "elasticity_v2, forecast_v1.0", fields_added: ["momentum_score", "forecasted_cpa"], fields_deprecated: [] },
  { version_id: "fsv-001", change_description: "Versão inicial com MBE Index, elasticity, saturation, funnel_lift", created_at: "2025-12-01T00:00:00Z", activated_flag: false, computation_version: "v2.0", model_dependency_reference: "elasticity_v1", fields_added: ["mbe_index", "elasticity_score", "saturation_risk_score", "funnel_lift_signal"], fields_deprecated: [] },
];

// 3️⃣ MATERIALIZED VIEWS
export const MOCK_MATERIALIZED_VIEWS: MaterializedViewConfig[] = [
  { view_name: "mv_agency_daily_summary", display_name: "Resumo Diário da Agência", source_tables: ["standardized_campaign_metrics", "feature_store_metrics"], refresh_frequency: "1h", last_refreshed: "2026-02-15T10:00:00Z", avg_query_time_ms: 45, avg_query_time_without_mv_ms: 1800, row_count: 42000, status: "active" },
  { view_name: "mv_client_weekly_summary", display_name: "Resumo Semanal por Cliente", source_tables: ["standardized_campaign_metrics", "feature_store_metrics"], refresh_frequency: "6h", last_refreshed: "2026-02-15T06:00:00Z", avg_query_time_ms: 62, avg_query_time_without_mv_ms: 2400, row_count: 18500, status: "active" },
  { view_name: "mv_margin_overview", display_name: "Visão de Margens", source_tables: ["feature_store_metrics", "financial_data"], refresh_frequency: "4h", last_refreshed: "2026-02-15T08:00:00Z", avg_query_time_ms: 38, avg_query_time_without_mv_ms: 1200, row_count: 8200, status: "active" },
  { view_name: "mv_pattern_overview", display_name: "Visão de Padrões", source_tables: ["pattern_models", "feature_store_metrics"], refresh_frequency: "12h", last_refreshed: "2026-02-14T22:00:00Z", avg_query_time_ms: 55, avg_query_time_without_mv_ms: 3200, row_count: 5600, status: "stale" },
];

// 4️⃣ PIPELINE JOBS
export const MOCK_PIPELINE_JOBS: PipelineJob[] = [
  { job_id: "pj-001", job_type: "ingestion", display_name: "Ingestão Meta Ads", schedule_frequency: "a cada 2h", last_run: "2026-02-15T10:00:00Z", status: "success", average_duration_ms: 45000, failure_count: 1, success_rate_pct: 98.2 },
  { job_id: "pj-002", job_type: "ingestion", display_name: "Ingestão Google Ads", schedule_frequency: "a cada 2h", last_run: "2026-02-15T10:00:00Z", status: "success", average_duration_ms: 38000, failure_count: 2, success_rate_pct: 96.5 },
  { job_id: "pj-003", job_type: "ingestion", display_name: "Ingestão DV360", schedule_frequency: "a cada 4h", last_run: "2026-02-15T08:00:00Z", status: "failed", average_duration_ms: 52000, failure_count: 5, success_rate_pct: 91.2 },
  { job_id: "pj-004", job_type: "transform", display_name: "Normalização & Padronização", schedule_frequency: "a cada 2h", last_run: "2026-02-15T10:15:00Z", status: "success", average_duration_ms: 82000, failure_count: 0, success_rate_pct: 99.8 },
  { job_id: "pj-005", job_type: "feature_update", display_name: "Atualização Feature Store", schedule_frequency: "a cada 4h", last_run: "2026-02-15T08:30:00Z", status: "running", average_duration_ms: 120000, failure_count: 1, success_rate_pct: 97.5 },
  { job_id: "pj-006", job_type: "pattern_update", display_name: "Detecção de Padrões", schedule_frequency: "diário", last_run: "2026-02-15T03:00:00Z", status: "success", average_duration_ms: 340000, failure_count: 0, success_rate_pct: 100 },
  { job_id: "pj-007", job_type: "transform", display_name: "Refresh Views Materializadas", schedule_frequency: "a cada 1h", last_run: "2026-02-15T10:00:00Z", status: "success", average_duration_ms: 28000, failure_count: 0, success_rate_pct: 99.9 },
];

// 5️⃣ PERFORMANCE MONITOR
export const MOCK_PERFORMANCE: SystemPerformanceMonitor = {
  avg_query_time_ms: 320,
  feature_update_time_ms: 3200,
  pattern_detection_time_ms: 5600,
  ai_generation_time_ms: 1800,
  drift_evaluation_time_ms: 2400,
  last_updated: "2026-02-15T10:00:00Z",
};

// 6️⃣ SECURITY
export const MOCK_SECURITY_CONFIG: SecurityConfig = {
  encryption_at_rest: true,
  encryption_in_transit: true,
  rls_strict_mode: true,
  service_roles: [
    { role_name: "ingestion_service", scope: "Ingestão de dados", active: true, last_used: "2026-02-15T10:00:00Z" },
    { role_name: "transform_service", scope: "Transformação & normalização", active: true, last_used: "2026-02-15T10:15:00Z" },
    { role_name: "ai_processing_service", scope: "Processamento IA & insights", active: true, last_used: "2026-02-15T09:00:00Z" },
    { role_name: "pattern_learning_service", scope: "Detecção de padrões", active: true, last_used: "2026-02-15T03:00:00Z" },
  ],
};

export const MOCK_SECURITY_EVENTS: SecurityAuditEvent[] = [
  { id: "sec-001", event_type: "rls_violation_attempt", tenant_scope: "t4", triggered_by: "api_ingestion", timestamp: "2026-02-15T09:30:00Z", severity: "high", description: "Tentativa de acesso cross-tenant bloqueada — AdVantage → Redmedia" },
  { id: "sec-002", event_type: "api_key_rotation", tenant_scope: null, triggered_by: "platform_admin", timestamp: "2026-02-15T08:00:00Z", severity: "info", description: "Rotação programada de API keys executada" },
  { id: "sec-003", event_type: "encryption_check", tenant_scope: null, triggered_by: "system", timestamp: "2026-02-15T04:00:00Z", severity: "info", description: "Verificação de criptografia em repouso — OK" },
  { id: "sec-004", event_type: "unauthorized_access", tenant_scope: "t3", triggered_by: "user_session", timestamp: "2026-02-14T16:00:00Z", severity: "warning", description: "Tentativa de acesso a módulo restrito pelo plano — MídiaMax" },
  { id: "sec-005", event_type: "data_export_attempt", tenant_scope: "t1", triggered_by: "admin_user", timestamp: "2026-02-14T14:00:00Z", severity: "info", description: "Exportação de dados autorizada — Redmedia" },
  { id: "sec-006", event_type: "service_role_escalation", tenant_scope: null, triggered_by: "system", timestamp: "2026-02-14T03:00:00Z", severity: "critical", description: "Escalação de service role detectada e revertida automaticamente" },
];

// 7️⃣ COST MONITORING
export const MOCK_COST_TREND: InfrastructureCostMonitor[] = [
  { date: "2026-02-09", query_volume: 240000, estimated_compute_cost_index: 28, storage_growth_rate_mb: 72, anomaly_flag: false, last_updated: "2026-02-09T23:59:00Z" },
  { date: "2026-02-10", query_volume: 258000, estimated_compute_cost_index: 30, storage_growth_rate_mb: 78, anomaly_flag: false, last_updated: "2026-02-10T23:59:00Z" },
  { date: "2026-02-11", query_volume: 262000, estimated_compute_cost_index: 31, storage_growth_rate_mb: 80, anomaly_flag: false, last_updated: "2026-02-11T23:59:00Z" },
  { date: "2026-02-12", query_volume: 310000, estimated_compute_cost_index: 45, storage_growth_rate_mb: 95, anomaly_flag: true, last_updated: "2026-02-12T23:59:00Z" },
  { date: "2026-02-13", query_volume: 275000, estimated_compute_cost_index: 34, storage_growth_rate_mb: 82, anomaly_flag: false, last_updated: "2026-02-13T23:59:00Z" },
  { date: "2026-02-14", query_volume: 284000, estimated_compute_cost_index: 35, storage_growth_rate_mb: 84, anomaly_flag: false, last_updated: "2026-02-14T23:59:00Z" },
  { date: "2026-02-15", query_volume: 292000, estimated_compute_cost_index: 37, storage_growth_rate_mb: 88, anomaly_flag: false, last_updated: "2026-02-15T10:00:00Z" },
];

// 8️⃣ SCALABILITY
export const MOCK_SCALABILITY: ScalabilityHealthCheck = {
  simulated_tenant_count: 50,
  simulated_data_volume: 5000000,
  performance_score: 82,
  degradation_flag: false,
  last_tested_at: "2026-02-12T02:00:00Z",
  bottleneck_area: null,
};

// 9️⃣ ML COMPATIBILITY
export const MOCK_ML_SNAPSHOTS: MLTrainingDatasetSnapshot[] = [
  { snapshot_id: "ml-snap-003", feature_version: "fsv-003", date_range_start: "2025-12-01", date_range_end: "2026-02-14", record_count: 284000, created_at: "2026-02-15T04:00:00Z", status: "ready" },
  { snapshot_id: "ml-snap-002", feature_version: "fsv-002", date_range_start: "2025-11-01", date_range_end: "2026-01-31", record_count: 215000, created_at: "2026-02-01T04:00:00Z", status: "ready" },
  { snapshot_id: "ml-snap-001", feature_version: "fsv-001", date_range_start: "2025-09-01", date_range_end: "2025-12-31", record_count: 148000, created_at: "2026-01-01T04:00:00Z", status: "expired" },
];
