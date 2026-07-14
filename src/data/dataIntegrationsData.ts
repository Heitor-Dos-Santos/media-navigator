import type {
  DSPConnection, ExternalWarehouseConnection, UploadRecord,
} from "@/types/dataIntegrations";
import type { DataIngestionLog, DataValidationIssue } from "@/types/dataArchitecture";

// ── DSP Connections ──

export const MOCK_DSP_CONNECTIONS: DSPConnection[] = [
  {
    platform: "meta_ads", displayName: "Meta Ads",
    description: "Facebook, Instagram, Messenger, Audience Network",
    connectionStatus: "connected", accountsLinked: 3,
    lastSyncAt: "2026-02-15T08:30:00Z", syncFrequency: "hourly",
    freshness: "fresh", healthStatus: "healthy", icon: "facebook",
  },
  {
    platform: "google_ads", displayName: "Google Ads",
    description: "Search, Display, YouTube, Performance Max",
    connectionStatus: "connected", accountsLinked: 2,
    lastSyncAt: "2026-02-15T07:15:00Z", syncFrequency: "hourly",
    freshness: "fresh", healthStatus: "warning", icon: "google",
  },
  {
    platform: "dv360", displayName: "DV360",
    description: "Display & Video 360 — Programmatic DSP",
    connectionStatus: "disconnected", accountsLinked: 0,
    lastSyncAt: null, syncFrequency: "daily",
    freshness: "stale", healthStatus: "critical", icon: "monitor",
  },
  {
    platform: "linkedin_ads", displayName: "LinkedIn Ads",
    description: "LinkedIn Campaign Manager",
    connectionStatus: "connected", accountsLinked: 1,
    lastSyncAt: "2026-02-14T22:00:00Z", syncFrequency: "every_6h",
    freshness: "delayed", healthStatus: "healthy", icon: "linkedin",
  },
  {
    platform: "tiktok_ads", displayName: "TikTok Ads",
    description: "TikTok For Business",
    connectionStatus: "disconnected", accountsLinked: 0,
    lastSyncAt: null, syncFrequency: "daily",
    freshness: "stale", healthStatus: "critical", icon: "music",
  },
];

// ── External Warehouses ──

export const MOCK_WAREHOUSES: ExternalWarehouseConnection[] = [
  { provider: "bigquery", displayName: "Google BigQuery", connectionStatus: "connected", datasetSelected: "mediahub_prod", syncMode: "incremental", lastSyncAt: "2026-02-14T02:00:00Z", schemaCompatible: true },
  { provider: "snowflake", displayName: "Snowflake", connectionStatus: "disconnected", datasetSelected: null, syncMode: "full", lastSyncAt: null, schemaCompatible: null },
  { provider: "redshift", displayName: "Amazon Redshift", connectionStatus: "disconnected", datasetSelected: null, syncMode: "full", lastSyncAt: null, schemaCompatible: null },
  { provider: "postgres", displayName: "PostgreSQL", connectionStatus: "disconnected", datasetSelected: null, syncMode: "full", lastSyncAt: null, schemaCompatible: null },
];

// ── Upload History ──

export const MOCK_UPLOADS: UploadRecord[] = [
  { id: "up-001", fileName: "campanhas_fev_2026.csv", fileType: "csv", uploadedAt: "2026-02-14T14:30:00Z", recordsProcessed: 520, recordsRejected: 3, validationErrors: 2, featureStoreUpdated: true, status: "success" },
  { id: "up-002", fileName: "relatorio_meta.xlsx", fileType: "xlsx", uploadedAt: "2026-02-12T10:00:00Z", recordsProcessed: 1240, recordsRejected: 0, validationErrors: 0, featureStoreUpdated: true, status: "success" },
  { id: "up-003", fileName: "google_ads_export.csv", fileType: "csv", uploadedAt: "2026-02-10T16:45:00Z", recordsProcessed: 0, recordsRejected: 890, validationErrors: 12, featureStoreUpdated: false, status: "failed" },
  { id: "up-004", fileName: "planilha_linkedin.xlsx", fileType: "xlsx", uploadedAt: "2026-02-08T09:20:00Z", recordsProcessed: 340, recordsRejected: 8, validationErrors: 3, featureStoreUpdated: true, status: "partial" },
];

// ── Extended Ingestion Logs (for Sync History tab) ──

export const MOCK_SYNC_HISTORY: (DataIngestionLog & { duration_ms: number })[] = [
  { id: "sh-001", tenant_id: "tenant-001", source_type: "api", platform: "meta_ads", records_processed: 4820, status: "success", error_message: null, ingestion_time: "2026-02-15T08:30:00Z", duration_ms: 1240 },
  { id: "sh-002", tenant_id: "tenant-001", source_type: "api", platform: "google_ads", records_processed: 3210, status: "success", error_message: null, ingestion_time: "2026-02-15T07:15:00Z", duration_ms: 980 },
  { id: "sh-003", tenant_id: "tenant-001", source_type: "api", platform: "linkedin_ads", records_processed: 1456, status: "success", error_message: null, ingestion_time: "2026-02-15T06:00:00Z", duration_ms: 650 },
  { id: "sh-004", tenant_id: "tenant-001", source_type: "api", platform: "google_ads", records_processed: 0, status: "failed", error_message: "Rate limit excedido — retry em 15min. A API do Google Ads retornou erro 429. Aguarde o intervalo de cooldown antes de tentar novamente.", ingestion_time: "2026-02-14T18:00:00Z", duration_ms: 320 },
  { id: "sh-005", tenant_id: "tenant-001", source_type: "upload", platform: "uploaded_file", records_processed: 520, status: "success", error_message: null, ingestion_time: "2026-02-14T14:30:00Z", duration_ms: 2100 },
  { id: "sh-006", tenant_id: "tenant-001", source_type: "warehouse_sync", platform: "external_warehouse", records_processed: 12400, status: "partial", error_message: "3 registros com schema incompatível foram ignorados. Verifique o mapeamento de colunas no warehouse.", ingestion_time: "2026-02-14T02:00:00Z", duration_ms: 8400 },
  { id: "sh-007", tenant_id: "tenant-001", source_type: "api", platform: "meta_ads", records_processed: 4650, status: "success", error_message: null, ingestion_time: "2026-02-14T08:30:00Z", duration_ms: 1180 },
  { id: "sh-008", tenant_id: "tenant-001", source_type: "api", platform: "dv360", records_processed: 0, status: "failed", error_message: "Credenciais expiradas. Reconecte a plataforma DV360 nas configurações de DSP.", ingestion_time: "2026-02-13T08:00:00Z", duration_ms: 150 },
  { id: "sh-009", tenant_id: "tenant-001", source_type: "api", platform: "tiktok_ads", records_processed: 890, status: "success", error_message: null, ingestion_time: "2026-02-13T07:00:00Z", duration_ms: 780 },
  { id: "sh-010", tenant_id: "tenant-001", source_type: "api", platform: "meta_ads", records_processed: 4300, status: "success", error_message: null, ingestion_time: "2026-02-13T08:30:00Z", duration_ms: 1100 },
  { id: "sh-011", tenant_id: "tenant-001", source_type: "upload", platform: "uploaded_file", records_processed: 1240, status: "success", error_message: null, ingestion_time: "2026-02-12T10:00:00Z", duration_ms: 3400 },
  { id: "sh-012", tenant_id: "tenant-001", source_type: "upload", platform: "uploaded_file", records_processed: 0, status: "failed", error_message: "Formato de arquivo inválido. Use CSV ou XLSX com as colunas obrigatórias.", ingestion_time: "2026-02-10T16:45:00Z", duration_ms: 80 },
];

// ── Data Health Metrics (tenant-level detail) ──

export const MOCK_TENANT_DATA_HEALTH = {
  freshnessScore: 87,
  validationErrorRate: 1.2,
  missingDataFlags: 2,
  schemaMismatchAlerts: 1,
  featureStoreLatency: 3200,
  platformFreshness: [
    { platform: "Meta Ads", lastSync: "2026-02-15T08:30:00Z", freshness: "fresh" as const, impactedCampaigns: 0 },
    { platform: "Google Ads", lastSync: "2026-02-15T07:15:00Z", freshness: "fresh" as const, impactedCampaigns: 0 },
    { platform: "LinkedIn Ads", lastSync: "2026-02-14T22:00:00Z", freshness: "delayed" as const, impactedCampaigns: 4 },
    { platform: "DV360", lastSync: null, freshness: "stale" as const, impactedCampaigns: 12 },
    { platform: "TikTok Ads", lastSync: null, freshness: "stale" as const, impactedCampaigns: 6 },
  ],
};
