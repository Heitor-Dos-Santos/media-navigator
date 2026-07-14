import type {
  AgencyDataHealth,
  SchemaMonitoringEvent,
  VolumeAnomalyEvent,
  FeatureStoreHealth,
  WarehouseResourceMonitor,
  GlobalDataRiskScore,
  SupplierAlert,
} from "@/types/dataMonitoring";

// ── Pipeline KPI Trends (for charts) ──

export const MOCK_INGESTION_TREND = [
  { date: "08/02", records: 38200, failures: 1200 },
  { date: "09/02", records: 41500, failures: 800 },
  { date: "10/02", records: 44000, failures: 2100 },
  { date: "11/02", records: 39800, failures: 1500 },
  { date: "12/02", records: 46200, failures: 900 },
  { date: "13/02", records: 43100, failures: 1800 },
  { date: "14/02", records: 48200, failures: 1400 },
];

export const MOCK_LATENCY_TREND = [
  { date: "08/02", ingestion: 1100, featureStore: 2800 },
  { date: "09/02", ingestion: 1250, featureStore: 3100 },
  { date: "10/02", ingestion: 1400, featureStore: 3500 },
  { date: "11/02", ingestion: 1180, featureStore: 2900 },
  { date: "12/02", ingestion: 1050, featureStore: 2700 },
  { date: "13/02", ingestion: 1320, featureStore: 3200 },
  { date: "14/02", ingestion: 1240, featureStore: 3200 },
];

export const MOCK_STORAGE_TREND = [
  { date: "Semana 1", storage_mb: 18200 },
  { date: "Semana 2", storage_mb: 19100 },
  { date: "Semana 3", storage_mb: 20400 },
  { date: "Semana 4", storage_mb: 21800 },
];

// ── Agency Data Health (Supplier View) ──

export const MOCK_AGENCY_DATA_HEALTH_TABLE: AgencyDataHealth[] = [
  { agency_id: "a1", agency_name: "Redmedia", plan: "enterprise", status: "active", last_sync: "2026-02-15T10:30:00Z", freshness_score: 94, validation_error_rate: 0.8, schema_mismatch_incidents: 0, failed_syncs_7d: 1, feature_store_latency_ms: 2100, data_risk_level: "low" },
  { agency_id: "a2", agency_name: "Agência Pulse", plan: "pro", status: "active", last_sync: "2026-02-15T09:15:00Z", freshness_score: 88, validation_error_rate: 1.5, schema_mismatch_incidents: 1, failed_syncs_7d: 2, feature_store_latency_ms: 2800, data_risk_level: "low" },
  { agency_id: "a3", agency_name: "MídiaMax", plan: "growth", status: "active", last_sync: "2026-02-14T17:45:00Z", freshness_score: 62, validation_error_rate: 3.8, schema_mismatch_incidents: 2, failed_syncs_7d: 5, feature_store_latency_ms: 4200, data_risk_level: "medium" },
  { agency_id: "a4", agency_name: "AdVantage", plan: "starter", status: "active", last_sync: "2026-02-13T14:00:00Z", freshness_score: 45, validation_error_rate: 6.2, schema_mismatch_incidents: 0, failed_syncs_7d: 8, feature_store_latency_ms: 5100, data_risk_level: "high" },
  { agency_id: "a5", agency_name: "Digital First", plan: "pro", status: "suspended", last_sync: null, freshness_score: 0, validation_error_rate: 0, schema_mismatch_incidents: 0, failed_syncs_7d: 0, feature_store_latency_ms: 0, data_risk_level: "low" },
  { agency_id: "a6", agency_name: "Connect Media", plan: "growth", status: "active", last_sync: "2026-02-15T08:00:00Z", freshness_score: 78, validation_error_rate: 2.1, schema_mismatch_incidents: 1, failed_syncs_7d: 3, feature_store_latency_ms: 3400, data_risk_level: "medium" },
];

/** @deprecated Use MOCK_AGENCY_DATA_HEALTH_TABLE */
export const MOCK_TENANT_DATA_HEALTH_TABLE = MOCK_AGENCY_DATA_HEALTH_TABLE;

// ── Schema Monitoring Events ──

export const MOCK_SCHEMA_EVENTS: SchemaMonitoringEvent[] = [
  { id: "sch-001", agency_id: "a3", agency_name: "MídiaMax", platform: "Google Ads", schema_version_detected: "v14.2", schema_change_flag: true, affected_fields: ["conversion_action_type", "bidding_strategy_type"], detected_at: "2026-02-14T06:00:00Z", resolved_flag: false },
  { id: "sch-002", agency_id: "a2", agency_name: "Agência Pulse", platform: "Meta Ads", schema_version_detected: "v18.0", schema_change_flag: true, affected_fields: ["ad_creative_primary_text"], detected_at: "2026-02-13T14:00:00Z", resolved_flag: true },
  { id: "sch-003", agency_id: "a6", agency_name: "Connect Media", platform: "DV360", schema_version_detected: "v3.1", schema_change_flag: true, affected_fields: ["line_item_type", "budget_allocation"], detected_at: "2026-02-12T09:30:00Z", resolved_flag: false },
  { id: "sch-004", agency_id: "a1", agency_name: "Redmedia", platform: "LinkedIn Ads", schema_version_detected: "v202602", schema_change_flag: false, affected_fields: [], detected_at: "2026-02-15T08:00:00Z", resolved_flag: true },
];

// ── Volume Anomaly Events ──

export const MOCK_VOLUME_ANOMALIES: VolumeAnomalyEvent[] = [
  { id: "vol-001", agency_id: "a4", agency_name: "AdVantage", platform: "Google Ads", expected_volume_min: 800, expected_volume_max: 1500, actual_volume: 0, anomaly_score: 98, anomaly_type: "zero_data", detected_at: "2026-02-14T08:00:00Z" },
  { id: "vol-002", agency_id: "a3", agency_name: "MídiaMax", platform: "Meta Ads", expected_volume_min: 2000, expected_volume_max: 3500, actual_volume: 680, anomaly_score: 82, anomaly_type: "drop", detected_at: "2026-02-14T09:00:00Z" },
  { id: "vol-003", agency_id: "a1", agency_name: "Redmedia", platform: "Meta Ads", expected_volume_min: 4000, expected_volume_max: 5500, actual_volume: 12400, anomaly_score: 75, anomaly_type: "spike", detected_at: "2026-02-13T08:30:00Z" },
  { id: "vol-004", agency_id: "a6", agency_name: "Connect Media", platform: "TikTok Ads", expected_volume_min: 400, expected_volume_max: 900, actual_volume: 0, anomaly_score: 95, anomaly_type: "zero_data", detected_at: "2026-02-13T07:00:00Z" },
];

// ── Feature Store Health ──

export const MOCK_FEATURE_STORE_HEALTH: FeatureStoreHealth[] = [
  { agency_id: "a1", agency_name: "Redmedia", last_update_time: "2026-02-15T10:35:00Z", update_duration_ms: 2100, record_count: 1240, lag_indicator: "normal", drift_warning_flag: false },
  { agency_id: "a2", agency_name: "Agência Pulse", last_update_time: "2026-02-15T09:20:00Z", update_duration_ms: 2800, record_count: 890, lag_indicator: "normal", drift_warning_flag: false },
  { agency_id: "a3", agency_name: "MídiaMax", last_update_time: "2026-02-14T18:00:00Z", update_duration_ms: 4200, record_count: 420, lag_indicator: "delayed", drift_warning_flag: true },
  { agency_id: "a4", agency_name: "AdVantage", last_update_time: "2026-02-13T14:30:00Z", update_duration_ms: 5100, record_count: 85, lag_indicator: "critical", drift_warning_flag: true },
  { agency_id: "a6", agency_name: "Connect Media", last_update_time: "2026-02-15T08:10:00Z", update_duration_ms: 3400, record_count: 310, lag_indicator: "delayed", drift_warning_flag: false },
];

// ── Warehouse Resource Monitor ──

export const MOCK_WAREHOUSE_RESOURCES: WarehouseResourceMonitor = {
  total_query_volume: 284000,
  avg_query_duration_ms: 320,
  storage_growth_rate_mb_day: 82,
  compute_spike_flag: false,
  estimated_cost_index: 34,
  last_updated: "2026-02-15T10:00:00Z",
};

// ── Global Data Risk Score ──

export const MOCK_GLOBAL_RISK: GlobalDataRiskScore = {
  score: 28,
  status: "monitor",
  components: {
    failure_rate_score: 15,
    schema_change_score: 35,
    volume_anomaly_score: 42,
    feature_store_lag_score: 22,
    validation_error_score: 18,
  },
};

// ── Supplier Alerts ──

export const MOCK_SUPPLIER_ALERTS: SupplierAlert[] = [
  { id: "sa-001", type: "volume_collapse", severity: "high", title: "Ingestão zero detectada", description: "AdVantage — Google Ads sem dados por >24h. Verificar credenciais.", agency_name: "AdVantage", detected_at: "2026-02-14T08:30:00Z", acknowledged: false },
  { id: "sa-002", type: "schema_drift", severity: "medium", title: "Mudança de schema detectada", description: "MídiaMax — Google Ads alterou campos conversion_action_type e bidding_strategy_type.", agency_name: "MídiaMax", detected_at: "2026-02-14T06:15:00Z", acknowledged: false },
  { id: "sa-003", type: "feature_store_lag", severity: "medium", title: "Lag elevado no Feature Store", description: "AdVantage — Feature Store não atualizado há >24h. Latência: 5.1s.", agency_name: "AdVantage", detected_at: "2026-02-14T15:00:00Z", acknowledged: false },
  { id: "sa-004", type: "validation_explosion", severity: "high", title: "Taxa de erros de validação elevada", description: "AdVantage — Taxa de erros em 6.2%, acima do threshold de 5%.", agency_name: "AdVantage", detected_at: "2026-02-14T10:00:00Z", acknowledged: true },
  { id: "sa-005", type: "pipeline_failure", severity: "low", title: "Falha pontual de sync", description: "Redmedia — DV360 falhou 1 sync nos últimos 7 dias. Credenciais expiradas.", agency_name: "Redmedia", detected_at: "2026-02-13T08:00:00Z", acknowledged: true },
  { id: "sa-006", type: "schema_drift", severity: "medium", title: "Mudança de schema DV360", description: "Connect Media — DV360 campos line_item_type e budget_allocation alterados.", agency_name: "Connect Media", detected_at: "2026-02-12T09:45:00Z", acknowledged: false },
];
