import type { SourcePlatform, DataHealthStatus } from "@/types/dataArchitecture";

// ── DSP Connection Cards ──

export type DataFreshness = "fresh" | "delayed" | "stale";
export type SyncFrequency = "hourly" | "every_6h" | "daily" | "manual";

export interface DSPConnection {
  platform: SourcePlatform;
  displayName: string;
  description: string;
  connectionStatus: "connected" | "disconnected";
  accountsLinked: number;
  lastSyncAt: string | null;
  syncFrequency: SyncFrequency;
  freshness: DataFreshness;
  healthStatus: DataHealthStatus;
  icon: string;
}

// ── External Warehouse ──

export type WarehouseProvider = "bigquery" | "snowflake" | "redshift" | "postgres";
export type SyncMode = "full" | "incremental";

export interface ExternalWarehouseConnection {
  provider: WarehouseProvider;
  displayName: string;
  connectionStatus: "connected" | "disconnected";
  datasetSelected: string | null;
  syncMode: SyncMode;
  lastSyncAt: string | null;
  schemaCompatible: boolean | null;
}

// ── Upload History ──

export interface UploadRecord {
  id: string;
  fileName: string;
  fileType: "csv" | "xlsx" | "google_sheets";
  uploadedAt: string;
  recordsProcessed: number;
  recordsRejected: number;
  validationErrors: number;
  featureStoreUpdated: boolean;
  status: "success" | "partial" | "failed";
}

// ── Freshness config ──

export const FRESHNESS_CONFIG: Record<DataFreshness, { label: string; color: string; bg: string }> = {
  fresh: { label: "Atualizado", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  delayed: { label: "Atrasado", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  stale: { label: "Desatualizado", color: "text-red-400", bg: "bg-red-500/20" },
};

export const SYNC_FREQ_LABELS: Record<SyncFrequency, string> = {
  hourly: "A cada hora",
  every_6h: "A cada 6 horas",
  daily: "Diário",
  manual: "Manual",
};

export const WAREHOUSE_META: Record<WarehouseProvider, { displayName: string; color: string }> = {
  bigquery: { displayName: "Google BigQuery", color: "text-blue-400" },
  snowflake: { displayName: "Snowflake", color: "text-cyan-400" },
  redshift: { displayName: "Amazon Redshift", color: "text-orange-400" },
  postgres: { displayName: "PostgreSQL", color: "text-blue-500" },
};
