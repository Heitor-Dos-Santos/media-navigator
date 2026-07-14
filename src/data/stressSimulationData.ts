import type {
  StressSimulationRun, StressPerformanceMetrics, IsolationTestResult,
  FailureSimulationResult, CostStressResult, ReadinessScoreBreakdown,
} from "@/types/stressSimulation";

// ── Past Simulation Runs ──
export const MOCK_SIMULATION_RUNS: StressSimulationRun[] = [
  {
    simulation_id: "sim-003", simulated_agency_count: 100, simulated_campaign_volume: 500,
    simulated_daily_records: 2000000, simulated_ai_requests: 5000, simulated_pattern_cycles: 200,
    duration_minutes: 60, start_time: "2026-02-14T02:00:00Z", end_time: "2026-02-14T03:00:00Z",
    status: "completed", degradation_flag: false, overall_performance_score: 78,
    readiness_classification: "Monitor Closely",
  },
  {
    simulation_id: "sim-002", simulated_agency_count: 50, simulated_campaign_volume: 300,
    simulated_daily_records: 1000000, simulated_ai_requests: 2500, simulated_pattern_cycles: 100,
    duration_minutes: 45, start_time: "2026-02-10T02:00:00Z", end_time: "2026-02-10T02:45:00Z",
    status: "completed", degradation_flag: false, overall_performance_score: 88,
    readiness_classification: "Production Ready",
  },
  {
    simulation_id: "sim-001", simulated_agency_count: 200, simulated_campaign_volume: 1000,
    simulated_daily_records: 5000000, simulated_ai_requests: 10000, simulated_pattern_cycles: 500,
    duration_minutes: 90, start_time: "2026-02-05T02:00:00Z", end_time: "2026-02-05T03:30:00Z",
    status: "completed", degradation_flag: true, overall_performance_score: 52,
    readiness_classification: "Risk Under Scale",
  },
];

// ── Performance Metrics for Latest Run ──
export const MOCK_STRESS_PERFORMANCE: StressPerformanceMetrics = {
  simulation_id: "sim-003",
  avg_query_latency_ms: 580,
  feature_update_latency_ms: 4800,
  ingestion_latency_ms: 1200,
  ai_generation_latency_ms: 2800,
  pattern_detection_latency_ms: 7200,
  error_rate_pct: 1.8,
  drift_increase_flag: false,
  cost_spike_flag: false,
  storage_growth_rate_mb: 145,
};

// ── Isolation Test ──
export const MOCK_ISOLATION_TEST: IsolationTestResult = {
  simulation_id: "sim-003",
  concurrent_agency_queries: 100,
  cross_agency_violations: 0,
  rls_validation_passed: true,
  isolation_score: 100,
};

// ── Failure Simulation Results ──
export const MOCK_FAILURE_RESULTS: FailureSimulationResult[] = [
  { scenario: "dsp_api_failure", label: "Falha de API DSP", description: "Simulação de timeout e erro 500 no endpoint da DSP", detected: true, recovery_time_ms: 3200, resilience_score: 92 },
  { scenario: "schema_change", label: "Mudança de Schema", description: "Alteração de campos na resposta da API da plataforma", detected: true, recovery_time_ms: 8500, resilience_score: 78 },
  { scenario: "volume_collapse", label: "Colapso de Volume", description: "Queda abrupta de 90% no volume de dados ingeridos", detected: true, recovery_time_ms: 1500, resilience_score: 95 },
  { scenario: "ingestion_spike", label: "Pico de Ingestão", description: "Aumento de 10x no volume normal de ingestão", detected: true, recovery_time_ms: 12000, resilience_score: 72 },
  { scenario: "feature_store_delay", label: "Atraso Feature Store", description: "Atraso de 5x no ciclo de atualização do Feature Store", detected: true, recovery_time_ms: 6800, resilience_score: 84 },
];

// ── Cost Stress Test ──
export const MOCK_COST_STRESS: CostStressResult = {
  simulation_id: "sim-003",
  baseline_cost_index: 37,
  stress_cost_index: 68,
  cost_increase_pct: 83.8,
  resource_spike_detected: true,
  heavy_dashboard_load_ok: true,
  feature_recalculation_ok: true,
};

// ── Enterprise Readiness Score ──
export const MOCK_READINESS: ReadinessScoreBreakdown = {
  latency_stability: 82,
  error_rate_score: 91,
  isolation_stability: 100,
  drift_stability: 88,
  cost_stability: 72,
  pipeline_recovery_score: 84,
  overall: 86,
  classification: "Production Ready",
};

// ── Default Simulation Config (for the control panel) ──
export const DEFAULT_SIM_CONFIG = {
  agencyCount: 50,
  campaignVolume: 300,
  dailyRecords: 1000000,
  aiRequests: 2500,
  patternCycles: 100,
  durationMinutes: 30,
};
