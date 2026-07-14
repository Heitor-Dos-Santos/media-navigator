// ── Enterprise Stress Simulation Types ──

export type SimulationStatus = "idle" | "running" | "completed" | "failed";

export type ReadinessClassification =
  | "Production Ready"
  | "Monitor Closely"
  | "Risk Under Scale"
  | "Not Scalable Yet";

export type FailureScenario =
  | "dsp_api_failure"
  | "schema_change"
  | "volume_collapse"
  | "ingestion_spike"
  | "feature_store_delay";

// ── Simulation Run ──
export interface StressSimulationRun {
  simulation_id: string;
  simulated_agency_count: number;
  simulated_campaign_volume: number;
  simulated_daily_records: number;
  simulated_ai_requests: number;
  simulated_pattern_cycles: number;
  duration_minutes: number;
  start_time: string;
  end_time: string | null;
  status: SimulationStatus;
  degradation_flag: boolean;
  overall_performance_score: number;
  readiness_classification: ReadinessClassification;
}

// ── Performance Metrics Under Stress ──
export interface StressPerformanceMetrics {
  simulation_id: string;
  avg_query_latency_ms: number;
  feature_update_latency_ms: number;
  ingestion_latency_ms: number;
  ai_generation_latency_ms: number;
  pattern_detection_latency_ms: number;
  error_rate_pct: number;
  drift_increase_flag: boolean;
  cost_spike_flag: boolean;
  storage_growth_rate_mb: number;
}

// ── Agency Isolation Test ──
export interface IsolationTestResult {
  simulation_id: string;
  concurrent_agency_queries: number;
  cross_agency_violations: number;
  rls_validation_passed: boolean;
  isolation_score: number; // 0-100
}

// ── Failure Simulation ──
export interface FailureSimulationResult {
  scenario: FailureScenario;
  label: string;
  description: string;
  detected: boolean;
  recovery_time_ms: number;
  resilience_score: number; // 0-100
}

// ── Cost Stress Test ──
export interface CostStressResult {
  simulation_id: string;
  baseline_cost_index: number;
  stress_cost_index: number;
  cost_increase_pct: number;
  resource_spike_detected: boolean;
  heavy_dashboard_load_ok: boolean;
  feature_recalculation_ok: boolean;
}

// ── Enterprise Readiness Score Breakdown ──
export interface ReadinessScoreBreakdown {
  latency_stability: number;
  error_rate_score: number;
  isolation_stability: number;
  drift_stability: number;
  cost_stability: number;
  pipeline_recovery_score: number;
  overall: number;
  classification: ReadinessClassification;
}

// ── Display Configs ──

export const SIMULATION_STATUS_CONFIG: Record<SimulationStatus, { label: string; color: string; bg: string }> = {
  idle: { label: "Inativo", color: "text-muted-foreground", bg: "bg-muted/50" },
  running: { label: "Executando", color: "text-blue-400", bg: "bg-blue-500/20" },
  completed: { label: "Concluído", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  failed: { label: "Falhou", color: "text-red-400", bg: "bg-red-500/20" },
};

export const READINESS_CONFIG: Record<ReadinessClassification, { color: string; bg: string }> = {
  "Production Ready": { color: "text-emerald-400", bg: "bg-emerald-500/20" },
  "Monitor Closely": { color: "text-yellow-400", bg: "bg-yellow-500/20" },
  "Risk Under Scale": { color: "text-orange-400", bg: "bg-orange-500/20" },
  "Not Scalable Yet": { color: "text-red-400", bg: "bg-red-500/20" },
};

export const FAILURE_SCENARIO_CONFIG: Record<FailureScenario, { label: string; icon: string }> = {
  dsp_api_failure: { label: "Falha de API DSP", icon: "Wifi" },
  schema_change: { label: "Mudança de Schema", icon: "FileWarning" },
  volume_collapse: { label: "Colapso de Volume", icon: "TrendingDown" },
  ingestion_spike: { label: "Pico de Ingestão", icon: "Zap" },
  feature_store_delay: { label: "Atraso Feature Store", icon: "Clock" },
};
