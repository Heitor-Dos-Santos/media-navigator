// ── Infrastructure Hardening & Scalability Types ──

// 1️⃣ DATA PARTITIONING & CLUSTERING
export type PartitionStrategy = "date" | "tenant_id";
export type ClusterStrategy = "tenant_id" | "campaign_id" | "client_id";

export interface TablePartitionConfig {
  table_name: string;
  partition_by: PartitionStrategy;
  cluster_by: ClusterStrategy[];
  enabled: boolean;
  last_optimized: string;
  estimated_cost_reduction_pct: number;
}

// 2️⃣ FEATURE STORE VERSIONING
export interface FeatureStoreVersion {
  version_id: string;
  change_description: string;
  created_at: string;
  activated_flag: boolean;
  computation_version: string;
  model_dependency_reference: string;
  fields_added: string[];
  fields_deprecated: string[];
}

// 3️⃣ MATERIALIZED VIEWS (Query Optimization)
export type MaterializedViewStatus = "active" | "stale" | "rebuilding" | "error";

export interface MaterializedViewConfig {
  view_name: string;
  display_name: string;
  source_tables: string[];
  refresh_frequency: string;
  last_refreshed: string;
  avg_query_time_ms: number;
  avg_query_time_without_mv_ms: number;
  row_count: number;
  status: MaterializedViewStatus;
}

// 4️⃣ PIPELINE ORCHESTRATION
export type PipelineJobType = "ingestion" | "transform" | "feature_update" | "pattern_update";
export type PipelineJobStatus = "running" | "success" | "failed" | "scheduled" | "paused";

export interface PipelineJob {
  job_id: string;
  job_type: PipelineJobType;
  display_name: string;
  schedule_frequency: string;
  last_run: string;
  status: PipelineJobStatus;
  average_duration_ms: number;
  failure_count: number;
  success_rate_pct: number;
}

// 5️⃣ PERFORMANCE MONITORING
export interface SystemPerformanceMonitor {
  avg_query_time_ms: number;
  feature_update_time_ms: number;
  pattern_detection_time_ms: number;
  ai_generation_time_ms: number;
  drift_evaluation_time_ms: number;
  last_updated: string;
}

// 6️⃣ SECURITY HARDENING
export type SecurityEventType =
  | "rls_violation_attempt"
  | "encryption_check"
  | "service_role_escalation"
  | "unauthorized_access"
  | "data_export_attempt"
  | "api_key_rotation";

export type SecuritySeverity = "info" | "warning" | "high" | "critical";

export interface SecurityAuditEvent {
  id: string;
  event_type: SecurityEventType;
  tenant_scope: string | null;
  triggered_by: string;
  timestamp: string;
  severity: SecuritySeverity;
  description: string;
}

export interface SecurityConfig {
  encryption_at_rest: boolean;
  encryption_in_transit: boolean;
  rls_strict_mode: boolean;
  service_roles: {
    role_name: string;
    scope: string;
    active: boolean;
    last_used: string;
  }[];
}

// 7️⃣ COST MONITORING
export interface InfrastructureCostMonitor {
  date: string;
  query_volume: number;
  estimated_compute_cost_index: number;
  storage_growth_rate_mb: number;
  anomaly_flag: boolean;
  last_updated: string;
}

// 8️⃣ STRESS TEST / SCALABILITY
export interface ScalabilityHealthCheck {
  simulated_tenant_count: number;
  simulated_data_volume: number;
  performance_score: number;
  degradation_flag: boolean;
  last_tested_at: string;
  bottleneck_area: string | null;
}

// 9️⃣ ML COMPATIBILITY
export interface MLTrainingDatasetSnapshot {
  snapshot_id: string;
  feature_version: string;
  date_range_start: string;
  date_range_end: string;
  record_count: number;
  created_at: string;
  status: "ready" | "building" | "expired";
}

// ── Display Configs ──

export const JOB_STATUS_CONFIG: Record<PipelineJobStatus, { label: string; color: string; bg: string }> = {
  running: { label: "Executando", color: "text-blue-400", bg: "bg-blue-500/20" },
  success: { label: "Sucesso", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  failed: { label: "Falhou", color: "text-red-400", bg: "bg-red-500/20" },
  scheduled: { label: "Agendado", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  paused: { label: "Pausado", color: "text-muted-foreground", bg: "bg-muted/50" },
};

export const SECURITY_SEVERITY_CONFIG: Record<SecuritySeverity, { label: string; color: string; bg: string }> = {
  info: { label: "Info", color: "text-blue-400", bg: "bg-blue-500/20" },
  warning: { label: "Atenção", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  high: { label: "Alto", color: "text-orange-400", bg: "bg-orange-500/20" },
  critical: { label: "Crítico", color: "text-red-400", bg: "bg-red-500/20" },
};

export const MV_STATUS_CONFIG: Record<MaterializedViewStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Ativa", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  stale: { label: "Desatualizada", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  rebuilding: { label: "Reconstruindo", color: "text-blue-400", bg: "bg-blue-500/20" },
  error: { label: "Erro", color: "text-red-400", bg: "bg-red-500/20" },
};

export const ML_SNAPSHOT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ready: { label: "Pronto", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  building: { label: "Construindo", color: "text-blue-400", bg: "bg-blue-500/20" },
  expired: { label: "Expirado", color: "text-muted-foreground", bg: "bg-muted/50" },
};
