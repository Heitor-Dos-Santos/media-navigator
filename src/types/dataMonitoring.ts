// ── Super Admin Data Monitoring Types ──

export type DataRiskLevel = "low" | "medium" | "high" | "critical";
export type PlatformHealthStatus = "healthy" | "monitor" | "degraded" | "critical";
export type SupplierAlertType =
  | "pipeline_failure"
  | "schema_drift"
  | "volume_collapse"
  | "warehouse_cost_spike"
  | "feature_store_lag"
  | "validation_explosion";

// ── Agency Data Health (Supplier View) ──

export interface AgencyDataHealth {
  agency_id: string;
  agency_name: string;
  plan: string;
  status: "active" | "suspended";
  last_sync: string | null;
  freshness_score: number;
  validation_error_rate: number;
  schema_mismatch_incidents: number;
  failed_syncs_7d: number;
  feature_store_latency_ms: number;
  data_risk_level: DataRiskLevel;
}

/** @deprecated Use AgencyDataHealth */
export type TenantDataHealth = AgencyDataHealth;

// ── Schema Monitoring ──

export interface SchemaMonitoringEvent {
  id: string;
  agency_id: string;
  agency_name: string;
  platform: string;
  schema_version_detected: string;
  schema_change_flag: boolean;
  affected_fields: string[];
  detected_at: string;
  resolved_flag: boolean;
}

// ── Volume Anomaly Detection ──

export interface VolumeAnomalyEvent {
  id: string;
  agency_id: string;
  agency_name: string;
  platform: string;
  expected_volume_min: number;
  expected_volume_max: number;
  actual_volume: number;
  anomaly_score: number;
  anomaly_type: "drop" | "spike" | "zero_data";
  detected_at: string;
}

// ── Feature Store Health ──

export interface FeatureStoreHealth {
  agency_id: string;
  agency_name: string;
  last_update_time: string;
  update_duration_ms: number;
  record_count: number;
  lag_indicator: "normal" | "delayed" | "critical";
  drift_warning_flag: boolean;
}

// ── Warehouse Resource Monitor ──

export interface WarehouseResourceMonitor {
  total_query_volume: number;
  avg_query_duration_ms: number;
  storage_growth_rate_mb_day: number;
  compute_spike_flag: boolean;
  estimated_cost_index: number; // 0-100
  last_updated: string;
}

// ── Global Data Risk Score ──

export interface GlobalDataRiskScore {
  score: number; // 0-100
  status: PlatformHealthStatus;
  components: {
    failure_rate_score: number;
    schema_change_score: number;
    volume_anomaly_score: number;
    feature_store_lag_score: number;
    validation_error_score: number;
  };
}

// ── Supplier Alert ──

export interface SupplierAlert {
  id: string;
  type: SupplierAlertType;
  severity: DataRiskLevel;
  title: string;
  description: string;
  agency_name: string | null; // null = platform-wide
  detected_at: string;
  acknowledged: boolean;
}

// ── Display Configs ──

export const RISK_LEVEL_CONFIG: Record<DataRiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: "Baixo", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  medium: { label: "Médio", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  high: { label: "Alto", color: "text-orange-400", bg: "bg-orange-500/20" },
  critical: { label: "Crítico", color: "text-red-400", bg: "bg-red-500/20" },
};

export const PLATFORM_HEALTH_CONFIG: Record<PlatformHealthStatus, { label: string; color: string; bg: string }> = {
  healthy: { label: "Saudável", color: "text-emerald-400", bg: "bg-emerald-500" },
  monitor: { label: "Monitorar", color: "text-yellow-400", bg: "bg-yellow-500" },
  degraded: { label: "Degradado", color: "text-orange-400", bg: "bg-orange-500" },
  critical: { label: "Crítico", color: "text-red-400", bg: "bg-red-500" },
};

export const SUPPLIER_ALERT_LABELS: Record<SupplierAlertType, { label: string; icon: string }> = {
  pipeline_failure: { label: "Falha de Pipeline", icon: "🔴" },
  schema_drift: { label: "Drift de Schema", icon: "🟠" },
  volume_collapse: { label: "Colapso de Volume", icon: "🔴" },
  warehouse_cost_spike: { label: "Pico de Custo", icon: "🟡" },
  feature_store_lag: { label: "Lag Feature Store", icon: "🟠" },
  validation_explosion: { label: "Explosão de Validação", icon: "🔴" },
};

export const LAG_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  normal: { label: "Normal", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  delayed: { label: "Atrasado", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  critical: { label: "Crítico", color: "text-red-400", bg: "bg-red-500/20" },
};
